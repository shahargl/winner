'use client';

import { Ticket, SelectedGame } from '../types';
import { generateReceiptNumber, generateBranchInfo, getCurrentDateTime, getBetTypeLabel } from '../lib/mock-games';
import { useMemo } from 'react';

interface TicketDisplayProps {
  selections: SelectedGame[];
  stake: number;
}

export function TicketDisplay({ selections, stake }: TicketDisplayProps) {
  // Generate ticket data
  const ticket = useMemo((): Ticket => {
    const { date, time } = getCurrentDateTime();
    const branch = generateBranchInfo();
    const totalOdds = selections.reduce((acc, sel) => acc * sel.game.odds, 1);
    
    return {
      receiptNumber: generateReceiptNumber(),
      branchId: branch.id,
      branchName: branch.name,
      date,
      time,
      selections,
      stake,
      totalOdds,
      winnings: stake * totalOdds,
    };
  }, [selections, stake]);

  if (selections.length === 0) {
    return (
      <div className="ticket-paper min-h-[400px] flex items-center justify-center">
        <div className="text-center text-[#666]">
          <div className="text-5xl mb-3">🎫</div>
          <p className="text-sm">בחר משחקים ליצירת טופס</p>
        </div>
      </div>
    );
  }

  // Generate barcode pattern based on receipt number
  const barcodePattern = ticket.receiptNumber.split('').flatMap((digit, i) => {
    const d = parseInt(digit);
    return [
      { width: d > 5 ? 2 : 1, gap: d > 3 ? 2 : 1 },
      { width: d % 2 === 0 ? 2 : 1, gap: 1 },
    ];
  });

  return (
    <div className="ticket-paper" dir="rtl">
      {/* Winner Logo Header */}
      <div className="text-center border-b border-dashed border-[#999] pb-3 mb-3">
        <div className="ticket-winner-logo">Winner</div>
        <div className="text-[10px] text-[#666] mt-1">ווינר - טוטו ספורט בע״מ</div>
      </div>

      {/* Receipt Info */}
      <div className="text-[10px] text-[#555] mb-3 space-y-0.5">
        <div className="flex justify-between">
          <span>סניף: {ticket.branchName}</span>
          <span>קוד: {ticket.branchId}</span>
        </div>
        <div className="flex justify-between">
          <span>תאריך: {ticket.date}</span>
          <span>שעה: {ticket.time}</span>
        </div>
      </div>

      {/* Receipt Number */}
      <div className="text-center border-y border-dashed border-[#999] py-2 mb-3">
        <div className="text-[10px] text-[#666]">מספר קבלה</div>
        <div className="font-mono text-base font-bold tracking-wider">
          {ticket.receiptNumber}
        </div>
      </div>

      {/* Ticket Type */}
      <div className="text-center mb-3">
        <div className="font-bold text-sm">קבלה</div>
        <div className="text-[10px] text-[#666]">הימור מרובה - תוצאות סיום</div>
      </div>

      {/* Bet Table Header */}
      <div className="grid grid-cols-12 gap-1 text-[9px] text-[#666] border-b border-[#ccc] pb-1 mb-1">
        <div className="col-span-1">#</div>
        <div className="col-span-5">משחק</div>
        <div className="col-span-2 text-center">תוצאה</div>
        <div className="col-span-2 text-center">סימן</div>
        <div className="col-span-2 text-left">שער</div>
      </div>

      {/* Bet Selections */}
      <div className="space-y-1 mb-3">
        {ticket.selections.map((sel, index) => (
          <div key={sel.game.id} className="grid grid-cols-12 gap-1 text-[10px] py-1 border-b border-[#ddd]">
            <div className="col-span-1 text-[#888]">{index + 1}</div>
            <div className="col-span-5">
              <div className="text-[9px] text-[#888]">{sel.game.league}</div>
              <div className="truncate">{sel.game.homeTeam}</div>
              <div className="truncate">{sel.game.awayTeam}</div>
            </div>
            <div className="col-span-2 text-center font-bold">
              {sel.game.homeScore}-{sel.game.awayScore}
            </div>
            <div className="col-span-2 text-center">
              <span className="bg-[#e8f5e9] text-[#2e7d32] px-1.5 py-0.5 rounded text-[9px] font-bold">
                {getBetTypeLabel(sel.game.winningBet)} ✓
              </span>
            </div>
            <div className="col-span-2 text-left font-mono font-bold">
              {sel.game.odds.toFixed(2)}
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="border-t border-dashed border-[#999] pt-2 space-y-1 text-[11px]">
        <div className="flex justify-between">
          <span>סכום הימור:</span>
          <span className="font-mono">₪{ticket.stake.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>שער כולל:</span>
          <span className="font-mono font-bold">{ticket.totalOdds.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm font-bold border-t border-[#999] pt-1 mt-1">
          <span>סה״כ לתשלום:</span>
          <span className="text-[#2e7d32]">₪{ticket.winnings.toLocaleString('he-IL', { 
            minimumFractionDigits: 2,
            maximumFractionDigits: 2 
          })}</span>
        </div>
      </div>

      {/* Winner Badge */}
      <div className="mt-3 text-center">
        <span className="inline-block bg-[#2e7d32] text-white px-4 py-1.5 rounded text-xs font-bold">
          זוכה
        </span>
      </div>

      {/* Barcode */}
      <div className="mt-4 text-center">
        <div className="barcode-container">
          {barcodePattern.map((bar, i) => (
            <div
              key={i}
              className="barcode-line"
              style={{
                width: `${bar.width}px`,
                height: '35px',
                marginRight: `${bar.gap}px`,
              }}
            />
          ))}
        </div>
        <div className="font-mono text-[10px] tracking-widest mt-1">
          {ticket.receiptNumber}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-dashed border-[#999] text-center text-[9px] text-[#888]">
        <div>יש לשמור קבלה זו עד לתשלום הזכייה</div>
        <div className="mt-0.5">www.winner.co.il</div>
      </div>
    </div>
  );
}
