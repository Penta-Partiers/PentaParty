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
import * as rl from 'readline';

const logLevel = getEnvOrExit("LOG_LEVEL");
const wsPort = getEnvOrExit("WS_PORT");

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

const ws = new WebSocket("ws://localhost:" + wsPort);

const r = rl.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: true
});

r.on('line', (line) => {
  if (line == "board") {
    sendBoardMessage(ws, "test_uuid_line_ms", [[1,1,1,1], [2,2,2,2], [3,3,3,3]])
  } else if (line == "start") {
    sendStartMessage(ws)
  } else if (line == "end") {
    sendEndMessage(ws, "test_uuid_end_ms")
  } else if (line == "new_line") {
    sendNewLineMessage(ws, "test_uuid_new_line_ms", [[1,1], [2,2], [3,3], [4,4]])
  } else if (line == "score") {
    sendScoreMessage(ws, "test_uuid_score_ms", 99999)
  } else if (line == "shape") {
    sendShapeMessage(ws, "test_uuid_shape_ms", [[1,1], [2,2], [3,3], [4,4]])
  }
});


ws.on('open', () => {
  logger.info('Connected to server');
});

// TODO: Filters
ws.on('message', (message) => {
  logger.info(`Received message from server: ${message}`);
});

ws.on('close', () => {
  logger.info('Disconnected from server');
});
