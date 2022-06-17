import { Frame, Page } from "puppeteer";
import { BASE_URL, WORDS } from "../constants";
import { BotConfigData } from "./types";

// NOTE: Some of the functions here are unused but have been kept for parity

export const joinRoom = async (
  page: Page,
  roomCode: string,
  nickname: string
) => {
  const url = `${BASE_URL}${roomCode}`;
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(1000);
  const inputSelector =
    "body > div.pages > div.setNickname.page > form > div.line > input";
  await page.waitForSelector(inputSelector, {
    visible: true,
    timeout: 5000,
  });
  await page.focus(inputSelector);
  await page.type(inputSelector, nickname, { delay: 50 });
  await page.keyboard.press("Enter");
};

export const joinGame = async (frame: Frame) => {
  await frame.waitForSelector(".joinRound");
  await frame.click(`.joinRound`);
};

export const getFrame = async (page: Page) => {
  await page.waitForSelector("iframe", { timeout: 5000 });
  const elementHandle = await page.$("iframe");
  const frame = await elementHandle.contentFrame();
  return frame;
};

export const gameStarted = async (frame: Frame) => {
  const round = await frame
    .waitForSelector(".round", { visible: true })
    .catch(() => false);
  return Boolean(round);
};

export const gameEnded = async (frame: Frame) => {
  const round = await frame
    .waitForSelector(".seating", { visible: true })
    .catch(() => false);
  return Boolean(round);
};

export const isSelfTurn = async (frame: Frame) => {
  const selfTurn = await frame
    .waitForSelector(".selfTurn", { visible: true })
    .catch(() => false);
  return Boolean(selfTurn);
};

export const isOtherTurn = async (frame: Frame) => {
  const otherTurn = await frame
    .waitForSelector(".otherTurn", { visible: true })
    .catch(() => false);
  return Boolean(otherTurn);
};

const getWord = (syllable: string) => {
  const goodWords = WORDS.filter((word) => word.includes(syllable));
  const randChoice = (a: any[]) => a[Math.floor(Math.random() * a.length)];
  return randChoice(goodWords);
};

export const typeWord = async (frame: Frame, config: BotConfigData) => {
  await frame.waitForSelector("input.styled", { visible: true });
  const input = await frame.$("input.styled");

  await frame.waitForSelector(".syllable");
  const syllableElem = await frame.$(".syllable");
  const syllable = await frame.evaluate((el) => el.textContent, syllableElem);

  const initialWord = getWord(syllable);
  // WPM to ms per char
  const delayTime = 1000 / ((config.typingSpeed * 5) / 60);
  // chance for misspelling word
  const word =
    config.errorRate > Math.random() * 100
      ? misspell(initialWord)
      : initialWord;
  await input.type(word, { delay: delayTime });
  await frame.waitForTimeout(100);
  await input.press("Enter");
};

const misspell = (word: string) => {
  const misspelledWord = word.split("");
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const randLetter = alphabet[Math.floor(Math.random() * alphabet.length)];
  misspelledWord[Math.floor(Math.random() * word.length)] = randLetter;
  return misspelledWord.join("");
};

export const waitForGameStarted = async (frame: Frame) => {
  const round = await frame
    .waitForSelector(".round", { visible: true, timeout: 600000 })
    .catch(() => false);
  return Boolean(round);
};

export const waitForGameEnded = async (frame: Frame) => {
  const round = await frame
    .waitForSelector(".seating", { visible: true, timeout: 600000 })
    .catch(() => false);
  return Boolean(round);
};

export const roomDisconnected = async (page) => {
  const disconnected = await page.waitForSelector(".disconnected.page", {
    visible: true,
    timeout: 3000,
  });
  return Boolean(disconnected);
};

export const waitForSelfTurn = async (frame: Frame) => {
  const selfTurn = await frame
    .waitForSelector(".selfTurn", { visible: true, timeout: 300000 })
    .catch(() => false);
  return Boolean(selfTurn);
};

export const waitForOtherTurn = async (frame: Frame) => {
  const otherTurn = await frame
    .waitForSelector(".otherTurn", { visible: true, timeout: 300000 })
    .catch(() => false);
  return Boolean(otherTurn);
};
