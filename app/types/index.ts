// Bet types available
export type BetType = '1' | 'X' | '2' | '1X' | 'X2' | '12' | 'over' | 'under';

// Game represents a finished soccer match with predetermined result
export interface Game {
  id: string;
  homeTeam: string;      // Hebrew team name
  awayTeam: string;      // Hebrew team name
  homeScore: number;
  awayScore: number;
  date: string;          // Format: DD/MM/YYYY
  time: string;          // Format: HH:MM
  league: string;        // Hebrew league name
  winningBet: BetType;   // The winning bet type based on result
  odds: number;          // The odds for the winning bet
  // All three odds for display
  odds1: number;         // Odds for home win
  oddsX: number;         // Odds for draw
  odds2: number;         // Odds for away win
}

// A selected game for the ticket
export interface SelectedGame {
  game: Game;
}

// The complete ticket/receipt
export interface Ticket {
  receiptNumber: string;
  branchId: string;
  branchName: string;
  date: string;
  time: string;
  selections: SelectedGame[];
  stake: number;
  totalOdds: number;
  winnings: number;
}
