import { GoogleGenerativeAI } from '@google/generative-ai';
import { SelectedGame } from '../types';

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

// Load example images as base64 for reference - works both locally and on Vercel
export async function getExampleImagesBase64(): Promise<{ data: string; mimeType: string }[]> {
  const images: { data: string; mimeType: string }[] = [];
  const files = ['tofes1.jpeg', 'tofes2.jpeg', 'tofes3.jpeg', 'tofes4.jpeg'];
  
  // Determine base URL - use VERCEL_URL in production or localhost in dev
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  for (const file of files) {
    try {
      const response = await fetch(`${baseUrl}/${file}`);
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        images.push({
          data: base64,
          mimeType: 'image/jpeg',
        });
      }
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

  const prompt = `SUPER IMPORTANT: Generate an EXTREMELY PHOTOREALISTIC image that looks EXACTLY like a real photograph taken with an iPhone camera. This must be INDISTINGUISHABLE from a real photo.

The image shows a REAL Israeli WinnerLINE betting receipt held in a REAL human hand.

=== PHOTOREALISM REQUIREMENTS (CRITICAL) ===
- This MUST look like a real iPhone photo, NOT a render or illustration
- Real human hand with visible skin texture, pores, fingernails, natural skin tone variations
- Natural lighting with soft shadows as if taken indoors
- Slight motion blur or focus imperfections like a real phone photo
- The paper should have REAL thermal paper texture - slightly shiny, with micro-imperfections
- Natural paper curl and slight wrinkles from being held
- Realistic ambient shadows where fingers grip the paper
- Background should be slightly out of focus (depth of field)
- Paper edges should show natural wear or slight fraying
- Include subtle environmental reflections on the glossy thermal paper
- The hand position should look natural and candid, not posed

=== HEBREW TEXT (EXACT - DO NOT MODIFY) ===
Header: "WinnerLINE" logo with checkered flag, then "קבלה" below

Receipt details:
"מספר קבלה:" ${receiptNumber}
"תאריך:" ${date}
"שעה:" ${time}
"סניף:" (0137) תל אביב - דיזנגוף

Games (${selections.length}):
${gamesSection}

Summary:
"סכום:" ₪${stake.toFixed(2)}
"מכפיל כולל:" ${totalOdds.toFixed(2)}
"זכייה:" ₪${winnings.toFixed(2)}

Footer: Barcode with numbers

=== PRINTING STYLE ===
- Black thermal printer ink on white receipt paper
- Monospace font typical of thermal printers
- Hebrew text RIGHT-TO-LEFT
- Clean, legible characters
- NO green stamps or winner badges

REMEMBER: The final image must be SO REALISTIC that someone would believe it's a real photo of a real betting receipt. Focus on photographic realism above all else.`;

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

    // Add example images first - emphasize studying the PHOTOREALISTIC qualities
    if (exampleImages.length > 0) {
      parts.push({ 
        text: `REFERENCE PHOTOS: These are REAL photographs of actual Israeli Winner betting receipts. Study EVERYTHING about these photos:
- The exact way human hands hold the paper
- The realistic lighting and shadows
- The paper texture and slight imperfections  
- The thermal print quality
- The natural, candid feel of the photos

Your generated image MUST match this level of photorealism. It should be IMPOSSIBLE to tell your image apart from these real photos:` 
      });
      for (const img of exampleImages.slice(0, 3)) {
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
