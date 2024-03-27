//@ts-check
import WebSocket, { WebSocketServer } from 'ws';
import log4js from 'log4js';
import {getEnvOrExit} from '../config/config.js';
import 'dotenv/config'

const logLevel = getEnvOrExit("LOG_LEVEL")
const wsPort = getEnvOrExit("WS_PORT")

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
  categories: { default: { appenders: ["out"], level: logLevel} },
});

const logger = log4js.getLogger()
logger.addContext("func", "ws server");

const wss = new WebSocketServer({ port: Number(wsPort) });

logger.info("start running websocket server")
wss.on('connection', function connection(ws) {
  logger.info("New client connected");
  ws.on('error', logger.error);

  ws.on('message', function message(data, isBinary) {
    logger.debug(`Received message :[${data.toString()}]`)
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(data, { binary: isBinary });
      }
    });
  });

  ws.on("close", (code, reason) => {
    logger.info(`Client disconnected, code [${code}], reason: [${reason.toString()}]`)
  } )

});