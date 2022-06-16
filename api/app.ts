import cors from "cors";
import crypto from "crypto";
import express from "express";
import puppeteer from "puppeteer";
import { AnyInterpreter, interpret } from "xstate";
import { createBotMachine } from "./bot/machine";
import { BotConfigData } from "./bot/types";

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json());

const PORT = 3333;

let bots: AnyInterpreter[] = [];
let botServices: { [id: string]: AnyInterpreter } = {};

app.post("/bots", async (req, res) => {
  const roomCode = req.body.roomCode as string;
  const nickname = req.body.nickname as string;
  const config = req.body.config as BotConfigData;
  if (!roomCode) {
    const e = new Error("You must specify a Room Code");
    res.status(400).json({ error: e });
    return;
  }
  if (!nickname) {
    const e = new Error("You must specify a Nickname");
    res.status(400).json({ error: e });
    return;
  }
  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
      ],
    });
    const [page] = await browser.pages();
    const id = crypto.randomUUID();
    const botMachine = createBotMachine(
      browser,
      page,
      nickname,
      roomCode,
      id,
      config
    );
    const botService = interpret(botMachine);
    botService.start();
    botService.onTransition((state) => {
      console.log(
        "\nplayer: ",
        botService.machine.context.nickname,
        "\nstate: ",
        state.value
      );
    });
    botServices[id] = botService;
    res.status(201).json({ id: id, roomCode: roomCode, nickname: nickname });
  } catch (err) {
    res.status(500).json({ error: err.name });
    console.log(err);
  }
});

app.delete("/bot/:id", async (req, res) => {
  const { id } = req.params;
  const botService = botServices[id];
  if (!botService) {
    const e = new Error("That is not a vaild id to delete");
    res.status(400).json({ error: e });
    return;
  }
  try {
    botService.send("KILL");
    botService.stop();
    delete botServices[id];
    res.status(200).json({ id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}!`);
});
