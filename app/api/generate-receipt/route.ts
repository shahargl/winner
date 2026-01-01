import { NextRequest, NextResponse } from 'next/server';
import { generateReceiptWithGemini3Pro } from '@/app/lib/gemini';
import { SelectedGame } from '@/app/types';
import { generateReceiptNumber, getCurrentDateTime } from '@/app/lib/mock-games';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { selections, stake } = body as {
      selections: SelectedGame[];
      stake: number;
    };

    if (!selections || selections.length === 0) {
      return NextResponse.json(
        { error: 'No games selected' },
        { status: 400 }
      );
    }

    if (!stake || stake <= 0) {
      return NextResponse.json(
        { error: 'Invalid stake amount' },
        { status: 400 }
      );
    }

    // Generate receipt metadata
    const receiptNumber = generateReceiptNumber();
    const { date, time } = getCurrentDateTime();

    // Generate the image with Gemini 3 Pro for best Hebrew text
    const imageDataUrl = await generateReceiptWithGemini3Pro(
      selections,
      stake,
      receiptNumber,
      date,
      time
    );

    return NextResponse.json({
      success: true,
      imageUrl: imageDataUrl,
      receiptNumber,
      date,
      time,
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to generate receipt', details: message },
      { status: 500 }
    );
  }
}
