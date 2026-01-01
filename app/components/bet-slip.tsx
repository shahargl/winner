'use client';

import { SelectedGame } from '../types';
import { getBetTypeLabel } from '../lib/mock-games';

interface BetSlipProps {
  selections: SelectedGame[];
  stake: number;
  onStakeChange: (stake: number) => void;
  onRemoveGame: (gameId: string) => void;
}

const presetAmounts = [10, 50, 100, 200, 500];

export function BetSlip({ 
  selections, 
  stake, 
  onStakeChange, 
  onRemoveGame,
}: BetSlipProps) {
  const totalOdds = selections.reduce((acc, sel) => acc * sel.game.odds, 1);
  const potentialWinnings = stake * totalOdds;

  return (
    <div className="bg-[#2a2a2a] rounded-lg overflow-hidden border border-[#3a3a3a]">
      {/* Header */}
      <div className="bg-[#cc0000] px-4 py-3 flex items-center justify-between">
        <h3 className="text-white font-bold">הטופס שלי</h3>
        <span className="bg-[#ffcc00] text-black text-xs font-bold px-2 py-1 rounded">
          {selections.length}
        </span>
      </div>

      <div className="p-4 space-y-4">
        {selections.length === 0 ? (
          <div className="text-center py-6 text-[#666]">
            <div className="text-3xl mb-2">⚽</div>
            <p className="text-sm">בחר משחקים מהרשימה</p>
          </div>
        ) : (
          <>
            {/* Selected Games */}
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selections.map(sel => (
                <div 
                  key={sel.game.id}
                  className="bg-[#1f1f1f] rounded p-3 relative group border border-[#3a3a3a]"
                >
                  <button
                    onClick={() => onRemoveGame(sel.game.id)}
                    className="absolute top-2 left-2 w-5 h-5 rounded-full bg-[#cc0000]/20 text-[#cc0000] 
                             text-xs flex items-center justify-center hover:bg-[#cc0000]/40 transition-colors"
                  >
                    ×
                  </button>
                  
                  <div className="text-[10px] text-[#666] mb-1">{sel.game.league}</div>
                  <div className="text-xs text-white mb-1">
                    {sel.game.homeTeam} - {sel.game.awayTeam}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-bold">
                        {sel.game.homeScore}-{sel.game.awayScore}
                      </span>
                      <span className="bg-[#4CAF50] text-white text-[10px] px-1.5 py-0.5 rounded font-bold">
                        {getBetTypeLabel(sel.game.winningBet)}
                      </span>
                    </div>
                    <span className="text-[#ffcc00] font-bold">{sel.game.odds.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stake Presets */}
            <div className="flex flex-wrap gap-2">
              {presetAmounts.map(amount => (
                <button
                  key={amount}
                  onClick={() => onStakeChange(amount)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                    stake === amount
                      ? 'bg-[#ffcc00] text-black'
                      : 'bg-[#3a3a3a] text-white hover:bg-[#444]'
                  }`}
                >
                  ₪{amount}
                </button>
              ))}
            </div>

            {/* Stake Input */}
            <div>
              <label className="block text-xs text-[#888] mb-1">סכום הימור</label>
              <div className="relative">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666]">₪</span>
                <input
                  type="number"
                  min="1"
                  value={stake || ''}
                  onChange={(e) => onStakeChange(parseInt(e.target.value) || 0)}
                  className="w-full bg-[#1f1f1f] text-white text-lg font-bold text-center rounded 
                           px-4 py-3 pr-8 focus:outline-none focus:ring-2 focus:ring-[#ffcc00]
                           border border-[#3a3a3a]"
                  placeholder="הזן סכום"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="bg-[#1f1f1f] rounded p-3 space-y-2 border border-[#3a3a3a]">
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">שער כולל:</span>
                <span className="text-[#ffcc00] font-bold">x{totalOdds.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[#888]">סכום:</span>
                <span className="text-white font-bold">₪{stake}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-[#3a3a3a] pt-2">
                <span className="text-[#ffcc00]">זכייה:</span>
                <span className="text-[#4CAF50]">
                  ₪{potentialWinnings.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
