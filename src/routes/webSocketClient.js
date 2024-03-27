//@ts-check
import WebSocket from "ws";
import log4js from "log4js";
import { getEnvOrExit } from "../config/config.js";
import "dotenv/config";
import {
  sendBoardMessage,
  sendEndMessage,
  sendNewLineMessage,
  sendScoreMessage,
  sendShapeMessage,
  sendStartMessage,
} from "../utils/webSocketMessages.js";
import * as rl from "readline";
import { sleep } from "../utils/utils.js";

// env
const logLevel = getEnvOrExit("LOG_LEVEL");
const wsPort = getEnvOrExit("WS_PORT");
// logger
log4js.configure({
  appenders: {
    out: {
      type: "stdout",
      layout: {
        type: "pattern",
        pattern: "%p [%X{func}] %m",
      },
    },
  },
  categories: { default: { appenders: ["out"], level: logLevel } },
});
const logger = log4js.getLogger();
logger.addContext("func", "ws client");

// constants
const NUMBER_OF_RECEIVERS_OF_NEW_LINE = 1;
const NUMBER_OF_RECEIVERS_OF_SHAPE = 1;
const SHAPE_DIMENTION = 2;
const SLEEP_INTERVAL_FOR_RECONNECTION = 1000; // 1 second
const SLEEP_INTERVAL_WAITING_FOR_CONNECTION = 100; // 0.1 second
const WS_HANDSHAPE_TIMEOUT = 5000; // 50 second

var ws = new WebSocket("ws://localhost:" + wsPort, {handshakeTimeout: WS_HANDSHAPE_TIMEOUT});
var wsTerminate = false;

const r = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true,
});

r.on("line", (line) => {
  if (line == "board") {
    sendBoardMessage(ws, "test_uuid_line_ms", [
      [1, 1, 1, 1],
      [2, 2, 2, 2],
      [3, 3, 3, 3],
    ]);
  } else if (line == "start") {
    sendStartMessage(ws);
  } else if (line == "end") {
    sendEndMessage(ws, "test_uuid_end_ms");
  } else if (line == "new_line") {
    sendNewLineMessage(ws, "test_uuid_new_line_ms", [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ]);
  } else if (line == "score") {
    sendScoreMessage(ws, "test_uuid_score_ms", 99999);
  } else if (line == "shape") {
    sendShapeMessage(ws, "test_uuid_shape_ms", [
      [1, 1],
      [2, 2],
      [3, 3],
      [4, 4],
    ]);
  } else if (line == "cut off") {
    logger.info("cutting off connection unexpectedly");
    ws.terminate();
  } else if (line == "terminate") {
    logger.info("quit connection");
    wsTerminate = true;
    ws.terminate();
}
});

const listener = async () => {
  if (ws != undefined) {
    while (ws.readyState == WebSocket.CONNECTING) {
      logger.info("ws in connecting state, waiting");
      await sleep(SLEEP_INTERVAL_WAITING_FOR_CONNECTION);
    }
  }

  while (ws == undefined || ws.readyState != WebSocket.OPEN) {
    logger.info("ws not in open state, trying to reconnect");
    ws = new WebSocket("ws://localhost:" + wsPort, {handshakeTimeout: WS_HANDSHAPE_TIMEOUT});
    await sleep(SLEEP_INTERVAL_FOR_RECONNECTION);
  }

  logger.info("Connected to server");

  let myRole = "SPECTAOR";
  let myUuid = "test_uuid";

  // For all
  let scoreMap = {
    player1Uuid: null,
    player2Uuid: null,
  };

  // For spectators
  let boardMap = {
    player1Uuid: null,
    player2Uuid: null,
  };

  ws.on("error", (e) => {
    logger.error(e);
    setTimeout(listener, SLEEP_INTERVAL_FOR_RECONNECTION);
  });

  ws.on("message", (msg) => {
    let parsed = JSON.parse(msg.toString());
    let rcvs = parsed["receivers"];
    let cmd = parsed["command"];
    let data = parsed["msg"];

    if (typeof cmd !== "string") {
      throw new Error("command is not a string");
    }

    if (!Array.isArray(rcvs)) {
      throw new Error("receivers is not an array");
    }

    if (cmd == "board") {
      if (myRole != "SPECTATOR") {
        return;
      }

      let uuid = data["UUID"];
      let board = data["board"];
      if (!(uuid in boardMap)) {
        throw new Error("board msg uuid not in boardMap: " + uuid);
      }

      if (
        !Array.isArray(board) ||
        !Array.isArray(board[0]) ||
        board[0].length == 0
      ) {
        throw new Error("invalid board format");
      }
      // update player's board here, no deadlock if we wrap the lister to a async background task
      boardMap[uuid] = board;
    } else if (cmd == "score") {
      let uuid = data["UUID"];
      let score = data["score"];

      if (typeof score !== "number") {
        throw new Error("score is not a number");
      }

      if (!(uuid in boardMap)) {
        throw new Error("score msg uuid not in scoreMap: " + uuid);
      }

      scoreMap[uuid] = score;
    } else if (cmd == "new_line") {
      if (rcvs.length !== NUMBER_OF_RECEIVERS_OF_NEW_LINE) {
        throw new Error(
          `wrong number of receivers of new line, got [${rcvs.length}], expected [${NUMBER_OF_RECEIVERS_OF_NEW_LINE}]`
        );
      }

      if (!rcvs.includes(myUuid)) {
        return;
      }

      let shape = data["shape"];
      if (
        !Array.isArray(shape) ||
        !Array.isArray(shape[0]) ||
        shape[0].length != SHAPE_DIMENTION
      ) {
        throw new Error("invalid shape of new line");
      }

      // Call function to add new line at the bottom here
    } else if (cmd == "shape") {
      if (rcvs.length !== NUMBER_OF_RECEIVERS_OF_SHAPE) {
        throw new Error(
          `wrong number of receivers of spectator created shape, got [${rcvs.length}], expected [${NUMBER_OF_RECEIVERS_OF_SHAPE}]`
        );
      }

      if (!rcvs.includes(myUuid)) {
        return;
      }

      let shape = data["shape"];
      if (
        !Array.isArray(shape) ||
        !Array.isArray(shape[0]) ||
        shape[0].length != SHAPE_DIMENTION
      ) {
        throw new Error("invalid shape of new line");
      }

      // Call function to spectator created shape here
    } else if (cmd == "start") {
      // Call function to start the game here
    } else if (cmd == "end") {
      let uuid = data["UUID"];
      if (!(uuid in scoreMap)) {
        throw new Error("end msg uuid not in scoreMap: " + uuid);
      }

      // Call function to handle end player base on role here
    } else {
      throw new Error("invalid command: " + cmd);
    }

    logger.info(`Received message from server: ${msg}`);
  });

  ws.on("close", () => {
    logger.info("Disconnected from server");
    if (!wsTerminate) {
      setTimeout(listener, SLEEP_INTERVAL_FOR_RECONNECTION);
    }
  });
};

listener();
