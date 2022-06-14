import crypto from "crypto";
import { Browser, ElementHandle, Frame, Page } from "puppeteer";
import { BASE_URL } from "./constants";

export class Bot {
  browser: Browser;
  page: Page;
  id: string;
  status: string;

  constructor(browser: Browser, page: Page) {
    this.browser = browser;
    this.page = page;
    this.id = crypto.randomUUID();
    this.status = "PREROOM";
  }

  joinRoom = async (roomCode: string, nickname: string) => {
    const url = `${BASE_URL}${roomCode}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
    await this.page.waitForTimeout(1000);
    const inputSelector =
      "body > div.pages > div.setNickname.page > form > div.line > input";
    await this.page.waitForSelector(inputSelector, {
      visible: true,
      timeout: 5000,
    });
    await this.page.focus(inputSelector);
    await this.page.type(inputSelector, nickname, { delay: 100 });
    await this.page.waitForTimeout(1000);
    await this.page.keyboard.press("Enter");
    this.status = "ROOM";
  };

  joinGame = async () => {
    await this.page.waitForSelector("iframe");

    const elementHandle = (await this.page.$(
      "iframe"
    )) as ElementHandle<Element>;

    console.log("finding frame");
    const frame = (await elementHandle.contentFrame()) as Frame;
    await this.page.waitForTimeout(3000);

    while (true) {
      const checkJoinable = await frame.$eval(".seating", (el) =>
        el.getAttribute("hidden")
      );
      console.log(checkJoinable, typeof checkJoinable);
      if (typeof checkJoinable === "string") continue;
      break;
    }

    await frame.click(`.joinRound`);
    console.log("Joined round");
  };

  kill = async () => {
    this.browser.close();
    this.status = "DEAD";
  };
}

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
