import { Browser, Frame, Page } from "puppeteer";

export type ContextData = {
  browser: Browser;
  page: Page;
  frame: Frame;
  nickname: string;
  roomCode: string;
  id: string;
  usedWords: string[];
};

export type BotConfigData = {
  typingSpeed: number;
  errorRate: number;
  thinkTime: number;
};
