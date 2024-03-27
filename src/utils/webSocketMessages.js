//@ts-check
import WebSocket from 'ws';

/**
 * 
 * @param {WebSocket} ws 
 */
export function sendStartMessage(ws) {
  let msg = {
    receivers: [],
    command: "start",
    msg: {}
  }

  ws.send(JSON.stringify(msg))
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {string} uuid 
 */ 
export function sendEndMessage(ws, uuid) {
  let msg = {
    receivers: [],
    command: "end",
    msg: {
      "UUID": uuid
    }
  }

  ws.send(JSON.stringify(msg))
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {string} uuid
 * @param {Array[Array[number]]} shape 
 */
export function sendShapeMessage(ws, uuid, shape) {
  let msg = {
    receivers: [uuid],
    command: "shape",
    msg: {
      "shape": shape
    }
  }

  ws.send(JSON.stringify(msg))
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {string} uuid
 * @param {Array[Array[number]]} board 
 */
export function sendBoardMessage(ws, uuid, board) {
  let msg = {
    receivers: ["SPECTATORS"],
    command: "board",
    msg: {
      "UUID": uuid,
      "board": board
    }
  }

  ws.send(JSON.stringify(msg))
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {string} uuid
 * @param {Array[Array[number]]} shape 
 */
export function sendNewLineMessage(ws, uuid, shape) {
  let msg = {
    receivers: [uuid],
    command: "new_line",
    msg: {
      "shape": shape
    }
  }

  ws.send(JSON.stringify(msg))
}

/**
 * 
 * @param {WebSocket} ws 
 * @param {string} uuid
 * @param {number} score 
 */
export function sendScoreMessage(ws, uuid, score) {
  let msg = {
    receivers: [],
    command: "score",
    msg: {
      "UUID": uuid,
      "score": score
    }
  }

  ws.send(JSON.stringify(msg))
}