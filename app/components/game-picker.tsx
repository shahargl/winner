'use client';

import { Game } from '../types';

interface GamePickerProps {
  games: Game[];
  selectedGameIds: Set<string>;
  onGameToggle: (game: Game) => void;
}

export function GamePicker({ games, selectedGameIds, onGameToggle }: GamePickerProps) {
  // Group games by league
  const gamesByLeague = games.reduce((acc, game) => {
    if (!acc[game.league]) {
      acc[game.league] = [];
    }
    acc[game.league].push(game);
    return acc;
  }, {} as Record<string, Game[]>);

  return (
    <div className="space-y-0">
      {Object.entries(gamesByLeague).map(([league, leagueGames]) => (
        <div key={league}>
          {/* League Header */}
          <div className="bg-[#2a2a2a] px-4 py-2 flex items-center gap-2 border-b border-[#3a3a3a]">
            <span className="text-white text-sm font-medium">{league}</span>
          </div>
          
          {/* Games */}
          {leagueGames.map(game => {
            const isSelected = selectedGameIds.has(game.id);
            
            return (
              <div
                key={game.id}
                onClick={() => onGameToggle(game)}
                className={`
                  bg-[#1f1f1f] border-b border-[#2a2a2a] cursor-pointer transition-all
                  hover:bg-[#252525]
                  ${isSelected ? 'bg-[#252525] border-r-4 border-r-[#ffcc00]' : ''}
                `}
              >
                {/* Game Info Row */}
                <div className="px-4 py-3">
                  {/* Date/Time and Score */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <div className="w-5 h-5 rounded bg-[#ffcc00] flex items-center justify-center">
                          <span className="text-black text-xs font-bold">✓</span>
                        </div>
                      )}
                      <span className="text-[#888] text-xs">{game.date} | {game.time}</span>
                    </div>
                    <div className="text-white font-bold text-lg">
                      {game.homeScore} - {game.awayScore}
                    </div>
                  </div>
                  
                  {/* Teams */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex-1 text-right">
                      <span className="text-white text-sm">{game.homeTeam}</span>
                    </div>
                    <div className="px-4 text-[#666] text-xs">VS</div>
                    <div className="flex-1 text-left">
                      <span className="text-white text-sm">{game.awayTeam}</span>
                    </div>
                  </div>
                  
                  {/* 1 X 2 Odds Row */}
                  <div className="flex items-center justify-center gap-3">
                    {/* 1 - Home Win */}
                    <div className="flex flex-col items-center">
                      <span className="text-[#888] text-[10px] mb-1">1</span>
                      <div className={`
                        odds-btn
                        ${game.winningBet === '1' 
                          ? (isSelected ? 'odds-btn-selected' : 'odds-btn-winner')
                          : 'odds-btn-loser'
                        }
                      `}>
                        {game.odds1.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* X - Draw */}
                    <div className="flex flex-col items-center">
                      <span className="text-[#888] text-[10px] mb-1">X</span>
                      <div className={`
                        odds-btn
                        ${game.winningBet === 'X' 
                          ? (isSelected ? 'odds-btn-selected' : 'odds-btn-winner')
                          : 'odds-btn-loser'
                        }
                      `}>
                        {game.oddsX.toFixed(2)}
                      </div>
                    </div>
                    
                    {/* 2 - Away Win */}
                    <div className="flex flex-col items-center">
                      <span className="text-[#888] text-[10px] mb-1">2</span>
                      <div className={`
                        odds-btn
                        ${game.winningBet === '2' 
                          ? (isSelected ? 'odds-btn-selected' : 'odds-btn-winner')
                          : 'odds-btn-loser'
                        }
                      `}>
                        {game.odds2.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
