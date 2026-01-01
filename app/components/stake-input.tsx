'use client';

interface StakeInputProps {
  stake: number;
  onStakeChange: (stake: number) => void;
}

const presetAmounts = [50, 100, 200, 500, 1000];

export function StakeInput({ stake, onStakeChange }: StakeInputProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm text-zinc-400">סכום הימור (₪)</label>
      
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">
        {presetAmounts.map(amount => (
          <button
            key={amount}
            onClick={() => onStakeChange(amount)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              stake === amount
                ? 'bg-green-500 text-white'
                : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
            }`}
          >
            ₪{amount}
          </button>
        ))}
      </div>

      {/* Custom Input */}
      <div className="relative">
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500">₪</span>
        <input
          type="number"
          min="1"
          value={stake || ''}
          onChange={(e) => onStakeChange(parseInt(e.target.value) || 0)}
          className="w-full bg-zinc-800 text-white text-xl font-bold text-center rounded-lg 
                   px-4 py-4 pr-10 focus:outline-none focus:ring-2 focus:ring-green-500
                   placeholder:text-zinc-600"
          placeholder="או הקלד סכום אחר..."
        />
      </div>
    </div>
  );
}

