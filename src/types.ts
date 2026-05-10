export interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  duration: number;
  cover?: string;
}

export type RadioState = 'IDLE' | 'DJ' | 'MUSIC';
