import type { Frame } from "puppeteer";
import { Browser, Page } from "puppeteer";
import { assign, createMachine } from "xstate";
import { ContextData } from "./types";
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
        usedWords: [] as string[],
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
            joined: {
              invoke: {
                id: "gameStarted",
                src: async (context, event) => await gameStarted(context.frame),
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
          invoke: {
            id: "gameEnded",
            src: (context, event) => gameEnded(context.frame),
            onDone: {
              target: "room",
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
                    src: async (context, event) =>
                      await isSelfTurn(context.frame),
                    onDone: [
                      {
                        target: "selfTurn",
                        cond: (context, event) => event.data,
                      },
                      {
                        target: "otherTurn",
                        cond: (context, event) => !event.data,
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
                      src: async (context, event) =>
                        await isOtherTurn(context.frame),
                      onDone: {
                        target: "otherTurn",
                        cond: (context, event) => event.data,
                      },
                    },
                    {
                      id: "typeWord",
                      src: async (context, event) =>
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
                  ],
                },
                otherTurn: {
                  invoke: {
                    id: "isSelfTurn",
                    src: async (context, event) =>
                      await isSelfTurn(context.frame),
                    onDone: {
                      target: "selfTurn",
                      cond: (context, event) => event.data,
                    },
                  },
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
        closeBrowser: (context, event) => {
          context.browser.close();
        },
      },
      // guards: {
      //   gameStarted:
      // }
    }
  );
};
