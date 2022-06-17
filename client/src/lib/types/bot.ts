export interface BotData {
  id: string;
  nickname: string;
  roomCode: string;
  difficultyToken: string;
}

export interface BotConfig {
  typingSpeed: number;
  errorRate: number;
  thinkTime: number;
}
