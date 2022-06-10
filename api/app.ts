import cors from "cors";
import express from "express";
import puppeteer from "puppeteer";
import { Bot } from "./bot";

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json());

const PORT = 3333;

let bots: Bot[] = [];

app.post("/bots", async (req, res) => {
  const roomCode = req.body.roomCode as string;
  const nickname = req.body.nickname as string;
  if (!roomCode) {
    const e = new Error("You must specify a Room Code");
    res.status(400).json({ error: e });
  }
  if (!nickname) {
    const e = new Error("You must specify a Nickname");
    res.status(400).json({ error: e });
  }
  try {
    const browser = await puppeteer.launch({
      headless: false,
    });
    const page = await browser.newPage();
    const bot = new Bot(page);
    bots.push(bot);
    await bot.joinRoom(roomCode, nickname);
    res
      .status(201)
      .json({ id: bot.id, roomCode: roomCode, nickname: nickname });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.delete("/bot/:id", async (req, res) => {
  if (bots.filter((bot) => bot.id === req.params.id).length === 0) {
    const e = new Error("That is not a vaild id to delete");
    res.status(400).json({ error: e });
  }
  try {
    const bot = bots.filter((bot) => bot.id === req.params.id)[0];
    await bot.kill();
    bots = bots.filter((bot) => bot.id !== req.params.id);
    res.status(200).json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}!`);
});
