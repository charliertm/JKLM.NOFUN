import type { Frame } from "puppeteer";
import { Browser, Page } from "puppeteer";
import { assign, createMachine } from "xstate";
import { getFrame, joinGame, joinRoom } from "./utils";

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
        frame: undefined as Frame | undefined,
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
            // TODO: handle onError with some kind of top level loading state
            onDone: {
              target: "room",
            },
          },
          on: {
            KILL: { target: "dead" },
          },
        },
        room: {
          initial: "gettingFrame",
          states: {
            gettingFrame: {
              invoke: {
                id: "getFrame",
                src: (context, event) => getFrame(context.page),
                onDone: {
                  actions: assign({
                    frame: (context, event) => event.data,
                  }),
                  target: "loading",
                },
                onError: {
                  target: "gettingFrame",
                  internal: true,
                },
              },
            },
            loading: {
              // TODO: replace this delay with a conditional to check if the join button exists
              after: {
                3000: { target: "notJoined" },
              },
            },
            notJoined: {
              invoke: {
                id: "joinGame",
                src: (context, event) => joinGame(context.frame),
                onDone: {
                  target: "joined",
                },
                onError: {
                  target: "loading",
                },
              },
            },
            full: {},
            joined: {},
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
