'use client';

import { useState, useCallback } from 'react';
import { Game, SelectedGame } from './types';
import { mockGames } from './lib/mock-games';
import { GamePicker } from './components/game-picker';
import { BetSlip } from './components/bet-slip';

export default function Home() {
  const [selectedGames, setSelectedGames] = useState<SelectedGame[]>([]);
  const [stake, setStake] = useState<number>(100);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedGameIds = new Set(selectedGames.map(sg => sg.game.id));

  const handleGameToggle = useCallback((game: Game) => {
    setSelectedGames(prev => {
      const exists = prev.some(sg => sg.game.id === game.id);
      if (exists) {
        return prev.filter(sg => sg.game.id !== game.id);
      } else {
        return [...prev, { game }];
      }
    });
  }, []);

  const handleRemoveGame = useCallback((gameId: string) => {
    setSelectedGames(prev => prev.filter(sg => sg.game.id !== gameId));
  }, []);

  const handleGenerateReceipt = async () => {
    if (selectedGames.length === 0) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await fetch('/api/generate-receipt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selections: selectedGames,
          stake,
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate receipt');
      }

      setGeneratedImageUrl(data.imageUrl);
    } catch (err) {
      console.error('Error generating receipt:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate receipt');
    } finally {
      setIsGenerating(false);
    }
  };

  const totalOdds = selectedGames.reduce((acc, sel) => acc * sel.game.odds, 1);
  const potentialWinnings = stake * totalOdds;

  return (
    <div className="min-h-screen bg-[#1a1a1a] pb-20" dir="rtl">
      {/* Header - Winner Style with logo on LEFT */}
      <header className="winner-header sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Right side - Potential winnings and button */}
          {selectedGames.length > 0 ? (
            <div className="flex items-center gap-4">
              <button
                onClick={handleGenerateReceipt}
                disabled={isGenerating}
                className="btn-winner disabled:opacity-50"
              >
                {isGenerating ? 'מייצר...' : 'צור טופס 🎫'}
              </button>
              <div className="text-left">
                <div className="text-[10px] text-white/60">זכייה פוטנציאלית</div>
                <div className="text-lg font-bold text-[#ffcc00]">
                  ₪{potentialWinnings.toLocaleString('he-IL', { maximumFractionDigits: 0 })}
                  <span className="text-xs text-white/60 mr-1">(x{totalOdds.toFixed(2)})</span>
                </div>
              </div>
            </div>
          ) : (
            <div />
          )}
          
          {/* Left side - Winner Logo */}
          <div className="winner-logo-text text-2xl">Winner</div>
        </div>
      </header>

      {/* Sub Header */}
      <div className="bg-[#2a2a2a] border-b border-[#3a3a3a]">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <h1 className="text-xl font-bold text-white">
            יוצר טפסים מנצחים 🏆
          </h1>
          <p className="text-[#888] text-sm mt-1">
            בחר משחקים שכבר נגמרו וצור טופס זכייה מושלם עם AI
          </p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto">
        {/* Games List */}
        <GamePicker
          games={mockGames}
          selectedGameIds={selectedGameIds}
          onGameToggle={handleGameToggle}
        />

        {/* Bet Slip - Always visible at bottom when games selected */}
        {selectedGames.length > 0 && (
          <div className="p-4">
            <BetSlip
              selections={selectedGames}
              stake={stake}
              onStakeChange={setStake}
              onRemoveGame={handleRemoveGame}
            />
            
            <button
              onClick={handleGenerateReceipt}
              disabled={isGenerating}
              className="w-full btn-winner mt-4 py-4 text-lg disabled:opacity-50"
            >
              🎫 צור טופס זכייה עם AI
            </button>

            {error && (
              <div className="mt-4 p-3 bg-[#cc0000]/20 border border-[#cc0000]/50 rounded text-[#ff6666] text-sm text-center">
                {error}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Loading Modal */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="bg-[#2a2a2a] rounded-2xl p-8 max-w-sm w-full mx-4 text-center border border-[#3a3a3a] shadow-2xl">
            {/* Animated Spinner */}
            <div className="relative w-20 h-20 mx-auto mb-6">
              <div className="absolute inset-0 border-4 border-[#3a3a3a] rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-[#ffcc00] rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-t-[#cc0000] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }}></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🎫</span>
              </div>
            </div>
            
            {/* Text */}
            <h3 className="text-xl font-bold text-white mb-2">
              מייצר את הטופס שלך
            </h3>
            <p className="text-[#888] text-sm mb-4">
              זה עלול לקחת מספר שניות...
            </p>
            
            {/* Animated dots */}
            <div className="flex justify-center gap-1">
              <div className="w-2 h-2 bg-[#ffcc00] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-[#ffcc00] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-[#ffcc00] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            
            {/* Info */}
            <p className="text-[#555] text-xs mt-6">
              ה-AI מייצר תמונה מותאמת אישית עבורך
            </p>
          </div>
        </div>
      )}

      {/* Generated Image Modal */}
      {generatedImageUrl && !isGenerating && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 overflow-auto"
          onClick={() => setGeneratedImageUrl(null)}
        >
          <div 
            className="animate-fade-in-up max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Generated Image */}
            <div className="bg-white rounded-lg overflow-hidden shadow-2xl">
              <img 
                src={generatedImageUrl} 
                alt="Generated Winner Receipt"
                className="w-full h-auto"
              />
            </div>
            
            {/* Actions */}
            <div className="mt-4 flex justify-center gap-3">
              <button
                onClick={() => setGeneratedImageUrl(null)}
                className="px-5 py-2.5 bg-[#3a3a3a] text-white rounded font-medium hover:bg-[#444] transition-colors text-sm"
              >
                חזור
              </button>
              <a
                href={generatedImageUrl}
                download="winner-receipt.png"
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#4CAF50] text-white rounded font-medium hover:bg-[#45a049] transition-colors text-sm"
              >
                📥 הורד תמונה
              </a>
              <button
                onClick={handleGenerateReceipt}
                disabled={isGenerating}
                className="px-5 py-2.5 bg-[#cc0000] text-white rounded font-medium hover:bg-[#dd1111] transition-colors text-sm disabled:opacity-50"
              >
                🔄 צור חדש
              </button>
            </div>
            
            <p className="text-center text-[#666] text-xs mt-4 mb-8">
              שמור את התמונה ושתף עם החברים! 📸
            </p>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="py-6 border-t border-[#2a2a2a] bg-[#1f1f1f]">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-[#666] text-xs">
            🎰 זה רק בשביל הכיף - אל תנסו להונות אף אחד!
          </p>
          <p className="text-[#444] text-[10px] mt-1">
            הטפסים מיועדים לבדיחות בלבד ואינם תקפים להימורים אמיתיים
          </p>
        </div>
      </footer>
    </div>
  );
}
