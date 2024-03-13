//@ts-check
import {WebServer} from './src/routes/webServer.js'
import log4js from 'log4js';
import {getEnvOrExit} from './src/config/config.js';
import {sleep} from './src/utils/utils.js';

const logLevel = getEnvOrExit("LOG_LEVEL")
const port = getEnvOrExit("WEBSITE_PORT")

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
logger.addContext("func", "main");

( async () => {
  logger.info("Starting main async function")
  let ws = new WebServer(port, logger)
  ws.startServer()
  while (true) {
    await sleep(10000)
  }
})();
