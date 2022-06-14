import { Browser, Page } from "puppeteer";
import { createMachine } from "xstate";
import { joinRoom } from "./bot";

export const createBotMachine = (
  browser: Browser,
  page: Page,
  nickname: string,
  roomCode: string,
  id: string
) => {
  return createMachine(
    {
      id: "bot",
      initial: "preRoom",
      context: {
        browser,
        page,
        nickname,
        roomCode,
        id,
      },
      states: {
        preRoom: {
          invoke: {
            id: "joinRoom",
            src: (context, event) =>
              joinRoom(context.page, context.roomCode, context.nickname),
            onDone: {
              target: "room",
            },
          },
          on: {
            KILL: { target: "dead" },
          },
        },
        room: {
          initial: "loading",
          states: {
            loading: {},
            waiting: {},
          },
          on: {
            KILL: { target: "dead" },
          },
        },
        dead: {
          type: "final",
          entry: "closeBrowser",
        },
      },
    },
    {
      actions: {
        closeBrowser: (context, event) => {
          context.browser.close();
        },
      },
    }
  );
};
