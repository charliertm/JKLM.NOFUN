import cors from "cors";
import crypto from "crypto";
import express from "express";
import puppeteer from "puppeteer";
import { AnyInterpreter, interpret } from "xstate";
import { waitFor } from "xstate/lib/waitFor";
import { createBotMachine } from "./bot/machine";
import { BotConfigData } from "./bot/types";

const app = express();

app.use(cors());
app.options("*", cors());

app.use(express.json());

let botServices: { [id: string]: AnyInterpreter } = {};

app.post("/bots", async (req, res) => {
  const roomCode = req.body.roomCode as string;
  const nickname = req.body.nickname as string;
  const config = req.body.config as BotConfigData;
  try {
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/chromium-browser",
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
    let validRoomCode = true;
    await waitFor(botService, (state) => state.matches("room.loading")).catch(
      () => {
        res.status(400).json({ error: "invalid room code" });
        validRoomCode = false;
      }
    );
    if (!validRoomCode) {
      return;
    }
    botServices[id] = botService;
    res.status(201).json({ id: id, roomCode: roomCode, nickname: nickname });
  } catch (e) {
    res.status(500).json({ error: "Server error" });
    console.log(e);
  }
});

app.delete("/bot/:id", async (req, res) => {
  const { id } = req.params;
  const botService = botServices[id];
  if (!botService) {
    res.status(400).json({ error: "Invalid ID for delete" });
    return;
  }
  try {
    botService.send("KILL");
    botService.stop();
    delete botServices[id];
    res.status(200).json({ id: req.params.id });
  } catch (e) {
    res.status(500).json({ error: "Server Error" });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`The application is listening on port ${PORT}!`);
});
