import OpenAI from 'openai';
import { SelectedGame } from '../types';
import * as fs from 'fs';
import * as path from 'path';

let _openai: OpenAI | null = null;

export function getOpenAI(): OpenAI {
  if (!_openai) {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY must be provided');
    }
    _openai = new OpenAI({ apiKey });
  }
  return _openai;
}

// Build the prompt for generating a Winner receipt image
export function buildReceiptPrompt(
  selections: SelectedGame[],
  stake: number,
  receiptNumber: string,
  date: string,
  time: string
): string {
  const totalOdds = selections.reduce((acc, sel) => acc * sel.game.odds, 1);
  const winnings = stake * totalOdds;

  // Build games list text
  const gamesText = selections.map((sel, i) => {
    const { game } = sel;
    return `${i + 1}. ${game.homeTeam} vs ${game.awayTeam} - Result: ${game.homeScore}-${game.awayScore} - Bet: ${game.winningBet} - Odds: ${game.odds.toFixed(2)}`;
  }).join('\n');

  const prompt = `Generate a photorealistic image of an Israeli "Winner" sports betting receipt (thermal printer paper). 

The receipt should look EXACTLY like a real Winner betting slip with:
- White thermal paper background with slight texture
- "Winner" logo at the top (cursive gold/yellow text on dark red banner, or "WinnerLINE" with checkered flag)
- Hebrew text throughout
- Receipt number: ${receiptNumber}
- Date: ${date}, Time: ${time}
- Section titled "קבלה" (Receipt)

Games listed in a table format:
${gamesText}

Bottom section shows:
- Stake amount: ₪${stake.toFixed(2)}
- Total odds: ${totalOdds.toFixed(2)}
- Total winnings: ₪${winnings.toFixed(2)}
- Green "זוכה" (Winner) stamp or badge
- Barcode at the very bottom

Style: Clean thermal print, black text on white paper, professional betting slip format.
The image should look like a photograph of a real receipt - slightly imperfect like a real thermal print.
Include realistic paper texture and slight shadows.
All text must be in Hebrew except for numbers and "Winner" logo.`;

  return prompt;
}

// Load example images as base64 for reference
export async function getExampleImagesBase64(): Promise<string[]> {
  const examplesDir = path.join(process.cwd(), 'examples');
  const files = ['tofes1.jpeg', 'tofes2.jpeg', 'tofes3.jpeg', 'tofes4.jpeg'];
  
  const base64Images: string[] = [];
  
  for (const file of files) {
    try {
      const filePath = path.join(examplesDir, file);
      const buffer = fs.readFileSync(filePath);
      const base64 = buffer.toString('base64');
      base64Images.push(`data:image/jpeg;base64,${base64}`);
    } catch (error) {
      console.error(`Failed to load example image ${file}:`, error);
    }
  }
  
  return base64Images;
}

// Generate receipt image using OpenAI
export async function generateReceiptImage(
  selections: SelectedGame[],
  stake: number,
  receiptNumber: string,
  date: string,
  time: string
): Promise<string> {
  const openai = getOpenAI();
  const prompt = buildReceiptPrompt(selections, stake, receiptNumber, date, time);

  try {
    // Use DALL-E 3 for image generation
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1024x1792', // Portrait orientation for receipt
      quality: 'hd',
      style: 'natural', // More photorealistic
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      throw new Error('No image URL returned from OpenAI');
    }

    return imageUrl;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

// Alternative: Use GPT-4 Vision to analyze examples and generate better prompts
export async function generateReceiptWithVision(
  selections: SelectedGame[],
  stake: number,
  receiptNumber: string,
  date: string,
  time: string
): Promise<string> {
  const openai = getOpenAI();
  const exampleImages = await getExampleImagesBase64();
  
  if (exampleImages.length === 0) {
    // Fallback to regular generation
    return generateReceiptImage(selections, stake, receiptNumber, date, time);
  }

  const totalOdds = selections.reduce((acc, sel) => acc * sel.game.odds, 1);
  const winnings = stake * totalOdds;

  // Build games data for the receipt
  const gamesData = selections.map((sel, i) => ({
    num: i + 1,
    homeTeam: sel.game.homeTeam,
    awayTeam: sel.game.awayTeam,
    homeScore: sel.game.homeScore,
    awayScore: sel.game.awayScore,
    league: sel.game.league,
    bet: sel.game.winningBet,
    odds: sel.game.odds.toFixed(2),
  }));

  // First, ask GPT-4 Vision to analyze the examples and create an optimized prompt
  const analysisResponse = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze these real Winner betting receipts and create a detailed prompt for DALL-E 3 to generate a new receipt with this data:

Receipt Number: ${receiptNumber}
Date: ${date}, Time: ${time}
Branch: תל אביב - דיזנגוף

Games:
${gamesData.map(g => `${g.num}. ${g.league}: ${g.homeTeam} vs ${g.awayTeam}, Score: ${g.homeScore}-${g.awayScore}, Bet: ${g.bet}, Odds: ${g.odds}`).join('\n')}

Stake: ₪${stake.toFixed(2)}
Total Odds: ${totalOdds.toFixed(2)}
Winnings: ₪${winnings.toFixed(2)}

Create a prompt that will generate an image looking EXACTLY like these real receipts. Focus on the exact layout, fonts, spacing, paper texture, and all visual details. The result should be indistinguishable from a real Winner receipt.`,
          },
          ...exampleImages.slice(0, 2).map(img => ({
            type: 'image_url' as const,
            image_url: { url: img },
          })),
        ],
      },
    ],
    max_tokens: 1000,
  });

  const optimizedPrompt = analysisResponse.choices[0]?.message?.content || '';
  
  // Now generate the image with the optimized prompt
  const imageResponse = await openai.images.generate({
    model: 'dall-e-3',
    prompt: optimizedPrompt,
    n: 1,
    size: '1024x1792',
    quality: 'hd',
    style: 'natural',
  });

  const imageUrl = imageResponse.data[0]?.url;
  if (!imageUrl) {
    throw new Error('No image URL returned from OpenAI');
  }

  return imageUrl;
}

