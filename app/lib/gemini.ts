import { GoogleGenerativeAI } from '@google/generative-ai';
import { SelectedGame } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Types for Gemini image generation
export interface GeminiImageResponse {
  candidates: {
    content: {
      parts: {
        inlineData?: {
          mimeType: string;
          data: string; // Base64 string
        };
        text?: string;
      }[];
    };
  }[];
}

let _genAI: GoogleGenerativeAI | null = null;

export function getGemini(): GoogleGenerativeAI {
  if (!_genAI) {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY must be provided');
    }
    _genAI = new GoogleGenerativeAI(apiKey);
  }
  return _genAI;
}

// Load example images as base64 for reference
export async function getExampleImagesBase64(): Promise<{ data: string; mimeType: string }[]> {
  const examplesDir = path.join(process.cwd(), 'examples');
  const files = ['tofes1.jpeg', 'tofes2.jpeg', 'tofes3.jpeg', 'tofes4.jpeg'];
  
  const images: { data: string; mimeType: string }[] = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(examplesDir, file);
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      images.push({
        data: base64,
        mimeType: 'image/jpeg',
      });
    } catch (error) {
      console.error(`Failed to load example image ${file}:`, error);
    }
  }
  
  return images;
}

// Build the exact Hebrew text content for the receipt - supports multiple games
function buildHebrewReceiptText(
  selections: SelectedGame[],
  stake: number,
  receiptNumber: string,
  date: string,
  time: string
): { prompt: string } {
  const totalOdds = selections.reduce((acc, sel) => acc * sel.game.odds, 1);
  const winnings = stake * totalOdds;

  // Build ALL games section with explicit Hebrew text in quotes
  const gamesSection = selections.map((sel, index) => {
    const game = sel.game;
    const betLabel = game.winningBet === '1' ? '1' : game.winningBet === '2' ? '2' : 'X';
    return `
"משחק ${index + 1}:"
- Home team (Hebrew text): "${game.homeTeam}"
- The word "נגד" (versus)
- Away team (Hebrew text): "${game.awayTeam}"
- "תוצאה:" followed by "${game.homeScore}-${game.awayScore}"
- "ניחוש:" followed by "${betLabel}"
- "מכפיל:" followed by "${game.odds.toFixed(2)}"`;
  }).join('\n');

  const prompt = `Create a high-resolution photorealistic image of an Israeli WinnerLINE betting receipt held in a human hand.

TEXT REQUIREMENTS - The Hebrew text MUST be rendered exactly as written below. Use standard Hebrew sans-serif font, right-to-left:

=== HEADER ===
Logo text: "WinnerLINE" with checkered racing flag pattern
Below logo, the Hebrew word: "קבלה"

=== RECEIPT DETAILS ===
Line 1: "מספר קבלה:" followed by "${receiptNumber}"
Line 2: "תאריך:" followed by "${date}"
Line 3: "שעה:" followed by "${time}"
Line 4: "סניף:" followed by "(0137) תל אביב - דיזנגוף"

=== GAMES SECTION (${selections.length} game${selections.length > 1 ? 's' : ''}) ===
${gamesSection}

=== SUMMARY ===
"סכום:" followed by "₪${stake.toFixed(2)}"
"מכפיל כולל:" followed by "${totalOdds.toFixed(2)}"
"זכייה:" followed by "₪${winnings.toFixed(2)}"

=== FOOTER ===
Barcode with numbers underneath

=== STYLE ===
- White thermal receipt paper with realistic texture
- Black monospace thermal printer text
- Paper held naturally in a human hand
- Slight paper curl and shadows for realism
- All Hebrew characters MUST be legible and correctly rendered right-to-left
- Use clean, readable Hebrew sans-serif typography
- Do NOT add any green stamp or winner badge

CRITICAL: Copy each Hebrew word EXACTLY as written in quotes above. Do not invent or modify the Hebrew text.`;

  return { prompt };
}

// Generate receipt image using Gemini
export async function generateReceiptWithGemini(
  selections: SelectedGame[],
  stake: number,
  receiptNumber: string,
  date: string,
  time: string
): Promise<string> {
  const genAI = getGemini();
  const exampleImages = await getExampleImagesBase64();
  const { prompt } = buildHebrewReceiptText(selections, stake, receiptNumber, date, time);

  try {
    // Use gemini-3-pro-image-preview for best Hebrew text rendering
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-3-pro-image-preview',
      generationConfig: {
        // @ts-expect-error - responseModalities is valid for image generation
        responseModalities: ['Text', 'Image'],
      },
    });

    // Build content with example images for reference
    const parts: (
      | { text: string }
      | { inlineData: { data: string; mimeType: string } }
    )[] = [];

    // Add example images first
    if (exampleImages.length > 0) {
      parts.push({ 
        text: 'Here are examples of real Israeli Winner betting receipts. Study the exact layout, typography, and Hebrew text structure:' 
      });
      for (const img of exampleImages.slice(0, 2)) {
        parts.push({ inlineData: img });
      }
    }

    // Add the main prompt with explicit Hebrew text requirements
    parts.push({ text: prompt });

    const result = await model.generateContent(parts);
    const response = result.response;

    // Extract the base64 image data
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error('No response from Gemini');
    }

    const content = candidates[0].content;
    if (!content || !content.parts) {
      throw new Error('No content in Gemini response');
    }

    // Find the image part
    const imagePart = content.parts.find(part => 'inlineData' in part && part.inlineData);
    
    if (imagePart && 'inlineData' in imagePart && imagePart.inlineData) {
      const { data, mimeType } = imagePart.inlineData;
      return `data:${mimeType};base64,${data}`;
    }

    // Log any text response for debugging
    const textPart = content.parts.find(part => 'text' in part);
    if (textPart && 'text' in textPart) {
      console.log('Gemini text response:', textPart.text);
    }

    throw new Error('No image generated by Gemini');
  } catch (error) {
    console.error('Error generating image with Gemini:', error);
    throw error;
  }
}

// Main export - uses the best available method
export async function generateReceiptWithGemini3Pro(
  selections: SelectedGame[],
  stake: number,
  receiptNumber: string,
  date: string,
  time: string
): Promise<string> {
  return generateReceiptWithGemini(selections, stake, receiptNumber, date, time);
}
