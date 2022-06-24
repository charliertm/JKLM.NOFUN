![title](./logo.svg)

## About

A simple suite for spawning bots to play [jklm.fun](https://jklm.fun/) party games. Bots have selectable difficulty and will auto-rejoin until deleted.

![Bot Creation Screen](https://imgur.com/VMvrDsc.png)

## How to run

The best way to run the suite is with Docker.

First, clone the repo:

```console
git clone https://github.com/charliertm/JKLM.NOFUN.git
```

Then spin up the containers with docker:

```console
docker-compose up
```

This will build the images and spin up containers for the client and api on ports 3000 and 5000 respectively. To visit the client and start spawning bots just visit `http://localhost:3000/`.

## How it works

The logic for the bots is implemented using [xstate](https://xstate.js.org/docs/) and [puppeteer](https://developers.google.com/web/tools/puppeteer). The bots are modeled as finite state machines which are interpreted as services and exposed via a lightweight express api. The state machine _(seen below)_ can be visualized and interacted with on Stately [here](https://stately.ai/registry/editor/share/dad6c170-27e8-4667-a506-f4fdcfa0b382).

![State Machine](https://i.imgur.com/w53FaEb.png?1)

The machine is almost entirely self-perpetuating - consisting mostly of transient nodes that are hanging on an invoked function that will return a promise given some change in the dom corresponding to a change in game state. The state will then automatically transition on the resolution of said promise.

## Notes

- Only the _BombParty_ game mode is supported at the moment although I may add support for _PopSauce_ in the future.

- Currently there is no GET endpoint on the api and the bots you have created are stored as temporary state in React. As a consequence, a page refresh will mean you won't see the bots that you have running on the api and won't be able to delete them. This will be changed soon but for the moment - if you refresh the page the best thing to do is just restart the server.

- Puppeteer can be quite a memory hog even when running headless so having many bots running at the same time could lead to slowdown and potentially erratic behaviour.

## Disclaimer

Only use this in private lobbies or make sure everyone is aware they are playing a bot. Don't be a weirdo.

## License

MIT @ Charlie Morris
