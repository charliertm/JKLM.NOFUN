import { Frame, Page } from "puppeteer";
import { BASE_URL } from "../constants";

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
  await page.type(inputSelector, nickname, { delay: 100 });
  await page.waitForTimeout(1000);
  await page.keyboard.press("Enter");
};

export const joinGame = async (frame: Frame) => {
  await frame.waitForSelector(".joinRound");
  await frame.click(`.joinRound`).catch((e) => console.log(e));
  console.log("Joined round");
};

export const gameJoinbale = async (frame: Frame) => {
  const checkJoinable = await frame.$eval(".seating", (el) =>
    el.getAttribute("hidden")
  );
  console.log(checkJoinable, typeof checkJoinable);
  return typeof checkJoinable !== "string";
};

export const getFrame = async (page: Page) => {
  await page.waitForSelector("iframe");

  const elementHandle = await page.$("iframe");

  console.log("finding frame");
  const frame = await elementHandle.contentFrame();
  return frame;
};
