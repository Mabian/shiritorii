export interface ChatMessage {
  readonly id: number;
  readonly side: 'opponent' | 'player' | 'system';
  readonly text: string;
  readonly meaning?: string;
  readonly invalid?: boolean;
  /** The score badge on a valid answer */
  readonly points?: number;
  readonly multiplier?: number;
}
