import type { Browser, Frame, Page } from "puppeteer";
import { assign, createMachine } from "xstate";
import type { BotConfigData } from "./types";
import {
  gameStarted,
  getFrame,
  isSelfTurn,
  joinGame,
  joinRoom,
  roomDisconnected,
  typeWord,
  waitForGameEnded,
  waitForGameStarted,
  waitForOtherTurn,
  waitForSelfTurn,
} from "./utils";

export const createBotMachine = (
  browser: Browser,
  page: Page,
  nickname: string,
  roomCode: string,
  id: string,
  config: BotConfigData
) => {
  return createMachine({
    id: "bot",
    initial: "preRoom",
    context: {
      browser,
      page,
      frame: undefined as Frame | undefined,
      nickname,
      roomCode,
      id,
      config,
    },
    states: {
      preRoom: {
        invoke: {
          id: "joinRoom",
          src: (context) =>
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
        initial: "gettingFrame",
        states: {
          noFrame: {
            invoke: {
              id: "roomDisconnected",
              src: async (context) => await roomDisconnected(context.page),
              onDone: [
                {
                  target: "#bot.dead",
                  cond: (_context, event) => event.data,
                },
                {
                  target: "gettingFrame",
                },
              ],
            },
          },
          gettingFrame: {
            invoke: {
              id: "getFrame",
              src: (context) => getFrame(context.page),
              onDone: {
                actions: assign({
                  frame: (_context, event) => event.data,
                }),
                target: "loading",
              },
              onError: {
                target: "noFrame",
              },
            },
          },
          loading: {
            after: {
              1000: { target: "notJoined" },
            },
          },
          notJoined: {
            invoke: [
              {
                id: "gameStarted",
                src: async (context) => await gameStarted(context.frame),
                onDone: {
                  target: "#bot.game.sittingOut",
                  cond: (_context, event) => !event.data,
                },
              },
              {
                id: "joinGame",
                src: (context) => joinGame(context.frame),
                onDone: [{ target: "joined" }],
                onError: {
                  target: "loading",
                },
              },
            ],
          },
          joined: {
            invoke: {
              id: "waitForGameStarted",
              src: async (context) => await waitForGameStarted(context.frame),
              onDone: {
                target: "#bot.game.playing",
              },
            },
          },
        },
        on: {
          KILL: { target: "dead" },
        },
      },
      game: {
        invoke: {
          id: "waitForGameEnded",
          src: (context) => waitForGameEnded(context.frame),
          onDone: {
            target: "#bot.room",
            cond: (_context, event) => event.data,
          },
        },
        states: {
          sittingOut: {},
          playing: {
            initial: "unknown",
            states: {
              unknown: {
                invoke: {
                  id: "isSelfTurn",
                  src: async (context) => await isSelfTurn(context.frame),
                  onDone: [
                    {
                      target: "selfTurn",
                      cond: (_context, event) => event.data,
                    },
                    {
                      target: "otherTurn",
                      cond: (_context, event) => !event.data,
                    },
                  ],
                  onError: {
                    target: "unknown",
                  },
                },
              },
              selfTurn: {
                initial: "thinking",
                states: {
                  typing: {
                    invoke: {
                      id: "typeWord",
                      src: async (context) =>
                        await typeWord(context.frame, context.config),
                      onDone: {
                        target: "thinking",
                        cond: (_context, event) => !event.data,
                        internal: false,
                      },
                    },
                  },
                  thinking: {
                    after: [
                      {
                        delay: (context) => context.config.thinkTime * 1000,
                        target: "typing",
                      },
                    ],
                  },
                },
                invoke: [
                  {
                    id: "waitForOtherTurn",
                    src: async (context) =>
                      await waitForOtherTurn(context.frame),
                    onDone: {
                      target: "otherTurn",
                      cond: (_context, event) => event.data,
                    },
                  },
                ],
              },
              otherTurn: {
                invoke: [
                  {
                    id: "waitForSelfTurn",
                    src: async (context) =>
                      await waitForSelfTurn(context.frame),
                    onDone: {
                      target: "selfTurn",
                      cond: (_context, event) => event.data,
                    },
                  },
                ],
              },
            },
          },
        },
        on: {
          KILL: { target: "dead" },
        },
      },
      dead: {
        type: "final",
        invoke: {
          id: "closeBrowser",
          src: async (context) => await context.browser.close(),
        },
      },
    },
  });
};
