//@ts-check
import 'dotenv/config'
import express from 'express'

export class WebServer {
  constructor(port, logger){
    this.port = Number(port);
    this.logger = logger
  }
  
  async startServer() {
    this.logger.addContext("func", "startServer");
    let app = express();
    app.get('/', (_req, res) => {
      res.send('Hello World!');
    })
    
    app.listen(this.port, () => {
      this.logger.info(`Listening on port ${this.port}`);
    })
  }
}