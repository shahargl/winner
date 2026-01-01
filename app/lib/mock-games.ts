import { Game, BetType } from '../types';

// Mock finished soccer games with Hebrew team names
// Each game has a predetermined result and realistic odds for 1/X/2
export const mockGames: Game[] = [
  {
    id: '1',
    homeTeam: 'מכבי תל אביב',
    awayTeam: 'הפועל באר שבע',
    homeScore: 2,
    awayScore: 1,
    date: '31/12/2025',
    time: '20:00',
    league: 'ליגת העל',
    winningBet: '1',
    odds: 1.85,
    odds1: 1.85,
    oddsX: 3.40,
    odds2: 4.20,
  },
  {
    id: '2',
    homeTeam: 'מכבי חיפה',
    awayTeam: 'בית"ר ירושלים',
    homeScore: 3,
    awayScore: 3,
    date: '31/12/2025',
    time: '17:30',
    league: 'ליגת העל',
    winningBet: 'X',
    odds: 3.40,
    odds1: 2.10,
    oddsX: 3.40,
    odds2: 3.20,
  },
  {
    id: '3',
    homeTeam: 'הפועל תל אביב',
    awayTeam: 'בני סכנין',
    homeScore: 1,
    awayScore: 0,
    date: '30/12/2025',
    time: '19:00',
    league: 'ליגת העל',
    winningBet: '1',
    odds: 2.10,
    odds1: 2.10,
    oddsX: 3.25,
    odds2: 3.50,
  },
  {
    id: '4',
    homeTeam: 'ריאל מדריד',
    awayTeam: 'ברצלונה',
    homeScore: 2,
    awayScore: 2,
    date: '29/12/2025',
    time: '22:00',
    league: 'לה ליגה - ספרד',
    winningBet: 'X',
    odds: 4.20,
    odds1: 2.30,
    oddsX: 4.20,
    odds2: 2.50,
  },
  {
    id: '5',
    homeTeam: 'ליברפול',
    awayTeam: 'מנצ\'סטר סיטי',
    homeScore: 3,
    awayScore: 1,
    date: '29/12/2025',
    time: '18:30',
    league: 'פרמייר ליג - אנגליה',
    winningBet: '1',
    odds: 2.75,
    odds1: 2.75,
    oddsX: 3.60,
    odds2: 2.40,
  },
  {
    id: '6',
    homeTeam: 'באיירן מינכן',
    awayTeam: 'דורטמונד',
    homeScore: 4,
    awayScore: 2,
    date: '28/12/2025',
    time: '20:30',
    league: 'בונדסליגה - גרמניה',
    winningBet: '1',
    odds: 1.55,
    odds1: 1.55,
    oddsX: 4.50,
    odds2: 5.20,
  },
  {
    id: '7',
    homeTeam: 'יובנטוס',
    awayTeam: 'אינטר מילאן',
    homeScore: 1,
    awayScore: 1,
    date: '28/12/2025',
    time: '21:45',
    league: 'סריה A - איטליה',
    winningBet: 'X',
    odds: 3.25,
    odds1: 2.60,
    oddsX: 3.25,
    odds2: 2.70,
  },
  {
    id: '8',
    homeTeam: 'פריז סן ז\'רמן',
    awayTeam: 'מרסיי',
    homeScore: 2,
    awayScore: 0,
    date: '27/12/2025',
    time: '21:00',
    league: 'ליג 1 - צרפת',
    winningBet: '1',
    odds: 1.45,
    odds1: 1.45,
    oddsX: 4.80,
    odds2: 6.50,
  },
  {
    id: '9',
    homeTeam: 'אתלטיקו מדריד',
    awayTeam: 'סביליה',
    homeScore: 3,
    awayScore: 0,
    date: '27/12/2025',
    time: '19:00',
    league: 'לה ליגה - ספרד',
    winningBet: '1',
    odds: 1.90,
    odds1: 1.90,
    oddsX: 3.50,
    odds2: 4.00,
  },
  {
    id: '10',
    homeTeam: 'צ\'לסי',
    awayTeam: 'ארסנל',
    homeScore: 0,
    awayScore: 2,
    date: '26/12/2025',
    time: '17:30',
    league: 'פרמייר ליג - אנגליה',
    winningBet: '2',
    odds: 2.60,
    odds1: 2.80,
    oddsX: 3.40,
    odds2: 2.60,
  },
  {
    id: '11',
    homeTeam: 'מכבי נתניה',
    awayTeam: 'הפועל חיפה',
    homeScore: 2,
    awayScore: 2,
    date: '26/12/2025',
    time: '20:00',
    league: 'ליגת העל',
    winningBet: 'X',
    odds: 3.15,
    odds1: 2.40,
    oddsX: 3.15,
    odds2: 2.90,
  },
  {
    id: '12',
    homeTeam: 'אשדוד',
    awayTeam: 'מכבי פ"ת',
    homeScore: 1,
    awayScore: 3,
    date: '25/12/2025',
    time: '19:30',
    league: 'ליגת העל',
    winningBet: '2',
    odds: 3.50,
    odds1: 2.20,
    oddsX: 3.30,
    odds2: 3.50,
  },
];

// Generate a random receipt number (10 digits)
export function generateReceiptNumber(): string {
  const digits = Array.from({ length: 10 }, () => Math.floor(Math.random() * 10)).join('');
  return digits;
}

// Generate a random branch ID and name
export function generateBranchInfo(): { id: string; name: string } {
  const branches = [
    { id: '0137', name: 'תל אביב - דיזנגוף' },
    { id: '0089', name: 'ירושלים - מרכז' },
    { id: '0234', name: 'חיפה - כרמל' },
    { id: '0156', name: 'באר שבע - קניון' },
    { id: '0312', name: 'ראשון לציון' },
    { id: '0078', name: 'נתניה - מרכז' },
    { id: '0445', name: 'אשדוד - סיטי' },
    { id: '0567', name: 'פתח תקווה' },
  ];
  return branches[Math.floor(Math.random() * branches.length)];
}

// Get current date and time in Israeli format
export function getCurrentDateTime(): { date: string; time: string } {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  const date = `${day}/${month}/${year}`;
  
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const time = `${hours}:${minutes}`;

  return { date, time };
}

// Get bet type label in Hebrew
export function getBetTypeLabel(betType: BetType): string {
  const labels: Record<BetType, string> = {
    '1': '1',
    'X': 'X',
    '2': '2',
    '1X': '1X',
    'X2': 'X2',
    '12': '12',
    'over': 'מעל',
    'under': 'מתחת',
  };
  return labels[betType];
}
