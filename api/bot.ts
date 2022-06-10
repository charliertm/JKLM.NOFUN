import crypto from "crypto";
import { Page } from "puppeteer";
import { BASE_URL } from "./constants";

export class Bot {
  page: Page;
  id: string;
  status: string;

  constructor(page: Page) {
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

  kill = async () => {
    this.page.close();
    this.status = "DEAD";
  };
}
