import type { Browser, Frame, Page } from "puppeteer";
import { assign, createMachine } from "xstate";
import type { BotConfigData, ContextData } from "./types";
import {
  gameEnded,
  gameStarted,
  getFrame,
  isOtherTurn,
  isSelfTurn,
  joinGame,
  joinRoom,
  typeWord,
} from "./utils";

export const createBotMachine = (
  browser: Browser,
  page: Page,
  nickname: string,
  roomCode: string,
  id: string,
  config: BotConfigData
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
        config,
        usedWords: [] as string[],
      },
      states: {
        preRoom: {
          invoke: {
            id: "joinRoom",
            src: (context) =>
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
                src: (context) => getFrame(context.page),
                onDone: {
                  actions: assign({
                    frame: (_context, event) => event.data,
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
                id: "gameStarted",
                src: async (context) => await gameStarted(context.frame),
                onDone: {
                  target: "#bot.game.playing",
                },
                onError: {
                  target: "joined",
                },
              },
            },
          },

          on: {
            KILL: { target: "dead" },
          },
        },
        game: {
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
                  invoke: [
                    {
                      id: "isOtherTurn",
                      src: async (context) => await isOtherTurn(context.frame),
                      onDone: {
                        target: "otherTurn",
                        cond: (_context, event) => event.data,
                      },
                    },
                    {
                      id: "typeWord",
                      src: async (context) =>
                        await typeWord(context.frame, context.usedWords),
                      onDone: {
                        actions: assign({
                          usedWords: (context: ContextData, event) => [
                            ...context.usedWords,
                            event.data,
                          ],
                        }),
                      },
                    },
                    {
                      id: "gameEnded",
                      src: (context) => gameEnded(context.frame),
                      onDone: {
                        target: "#bot.room",
                        cond: (_context, event) => event.data,
                      },
                    },
                  ],
                },
                otherTurn: {
                  invoke: [
                    {
                      id: "isSelfTurn",
                      src: async (context) => await isSelfTurn(context.frame),
                      onDone: {
                        target: "selfTurn",
                        cond: (_context, event) => event.data,
                      },
                    },
                    {
                      id: "gameEnded",
                      src: (context) => gameEnded(context.frame),
                      onDone: {
                        target: "#bot.room",
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
          entry: "closeBrowser",
        },
      },
    },
    {
      actions: {
        closeBrowser: (context) => {
          context.browser.close();
        },
      },
    }
  );
};
