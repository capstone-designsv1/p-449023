
export interface TimerState {
  totalMinutes: number;
  secondsRemaining: number;
  isActive: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface UseChallengeTimerProps {
  challengeId: string;
  designLevel: string;
  industry: string;
  title: string;
  description: string;
  onTimeExpired: () => void;
}

export interface TimerFormatters {
  formatTimeRemaining: () => string;
  getTimeRemainingPercentage: () => number;
}
