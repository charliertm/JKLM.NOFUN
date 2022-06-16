export interface BotData {
  id: string;
  nickname: string;
  roomCode: string;
}

export interface BotConfig {
  typingSpeed: number;
  errorRate: number;
  thinkTime: number;
}
