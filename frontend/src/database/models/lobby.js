//@ts-check
import {
  collection,
  deleteDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  addDoc,
  arrayRemove,
  deleteField,
  QueryDocumentSnapshot,
  increment,
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { User } from "./user.js";
import { initializeEmptyBoard } from "../../tetris/useBoard";

const LOBBY_CODE_LENGTH = 6;
const LOBBY_BOARD_ROWS_LENGTH = 25;
const LOBBY_BOARD_COLS_LENGTH = 13;

export const LOBBY_STATUS_OPEN = "open";
export const LOBBY_STATUS_FULL = "full";
export const LOBBY_STATUS_ONGOING = "ongoing";
export const LOBBY_STATUS_END = "end";

export const LOBBY_PLAYER_STATUS_NOT_STARTED = "not started";
export const LOBBY_PLAYER_STATUS_ONGOING = "ongoing";
export const LOBBY_PLAYER_STATUS_END = "end";

export class PlayerHelper {
  constructor(username) {
    this.score = 0;
    this.username = username;
    this.status = LOBBY_PLAYER_STATUS_NOT_STARTED;
  }

  toFirestore() {
    return {
      score: this.score,
      username: this.username,
      status: this.status,
    };
  }

  static nestedArrayToObject(nested) {
    let rslt = {};
    for (let i = 0; i < nested.length; i++) {
      rslt[i] = nested[i];
    }

    return rslt;
  }

  static objectToNestedArray(obj) {
    let rslt = [];
    let idx = 0;
    while (idx in obj) {
      rslt.push(obj[idx]);
      idx++;
    }

    return rslt;
  }
}

export class Lobby {
  constructor(code, hostUuid, uuid, playerBoards, playerPendingRows, playerPendingShapes, players, spectators, status) {
    if (typeof code !== "string" && code.length != LOBBY_CODE_LENGTH) {
      throw new Error("invalid lobby code");
    }

    if (typeof hostUuid !== "string") {
      throw new Error("invalid hostUuid type");
    }

    this.code = code;
    this.hostUuid = hostUuid;
    if (uuid == null) {
      this.uuid = null;
    } else {
      if (typeof uuid !== "string") {
        throw new Error("invalid uuid type");
      }

      this.uuid = uuid;
    }

    if (playerBoards == null) {
      this.playerBoards = {};
    } else {
      if (!(playerBoards instanceof Object)) {
        throw new Error("playerBoards is not an Object");
      }

      this.playerBoards = playerBoards;
    }

    if (playerPendingRows == null) {
      this.playerPendingRows = {};
    } else {
      if (!(playerPendingRows instanceof Object)) {
        throw new Error("playerPendingRows is not an Object");
      }

      this.playerPendingRows = playerPendingRows;
    }

    if (playerPendingShapes == null) {
      this.playerPendingShapes = {};
    } else {
      if (!(playerPendingShapes instanceof Object)) {
        throw new Error("playerPendingShapes is not an Object");
      }

      this.playerPendingShapes = playerPendingShapes;
    }

    if (players == null) {
      this.players = {};
    } else {
      if (!(players instanceof Object)) {
        throw new Error("players is not an Object");
      }

      this.players = players;
    }

    if (spectators == null) {
      this.spectators = {};
    } else {
      if (!(spectators instanceof Object)) {
        throw new Error("spectators is not an Object");
      }

      this.spectators = spectators;
    }

    if (status == null) {
      this.status = LOBBY_STATUS_OPEN;
    } else {
      if (
        status != LOBBY_STATUS_OPEN &&
        status != LOBBY_STATUS_ONGOING &&
        status != LOBBY_STATUS_FULL &&
        status != LOBBY_STATUS_END
      ) {
        throw new Error("invalid status: " + status);
      } else {
        this.status = status;
      }
    }
  }

  toString() {
    return (
      "uuid: " +
      this.uuid +
      ", " +
      "code: " +
      this.code +
      ", " +
      "hostUuid: " +
      this.hostUuid +
      ", " +
      "players: [" +
      this.players +
      "]" +
      ", " +
      "spectators: [" +
      this.spectators +
      "]" +
      ", " +
      "status: " +
      this.status
    );
  }

  toFirestore() {
    return {
      code: this.code,
      host: this.hostUuid,
      players: this.players,
      playerPendingRows: this.playerPendingRows,
      playerBoards: this.playerBoards,
      playerPendingShapes: this.playerPendingShapes,
      spectators: this.spectators,
      status: this.status,
    };
  }

  setHost(hostUuid) {
    if (typeof hostUuid !== "string") {
      throw new Error("invalid hostUuid type");
    }

    this.hostUuid = hostUuid;
  }

  setUuid(uuid) {
    if (typeof uuid !== "string") {
      throw new Error("invalid uuid type");
    }

    this.uuid = uuid;
  }

  setStatus(status) {
    if (
      status != LOBBY_STATUS_OPEN &&
      status != LOBBY_STATUS_ONGOING &&
      status != LOBBY_STATUS_FULL &&
      status != LOBBY_STATUS_END
    ) {
      throw new Error("invalid status: " + status);
    }

    this.status = status;
  }

  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    if (data) {
      // console.log("fromFirestore received data: ", data);
      return new Lobby(
        data.code,
        data.host,
        snapshot.id,
        data.playerBoards,
        data.playerPendingRows,
        data.playerPendingShapes,
        data.players,
        data.spectators,
        data.status
      );
    }
    return null;
  }

  static fromFirestorePlayerData(snapshot, options) {
    const data = snapshot.data(options);
    if (data) {
      console.log(data);
      return data; // Object {"uuid": Shape / Board} or Number of pendingRows: number
    }
    return null;
  }
}

// Lobby actions
export async function createLobby(lobby) {
  if (!(lobby instanceof Lobby)) {
    throw new Error("lobby is not an instance of Lobby class");
  }

  try {
    const docRef = await addDoc(collection(db, "lobby"), lobby.toFirestore());
    lobby.setUuid(docRef.id);
  } catch (e) {
    throw e;
  }
}

export async function getLobbyByCode(code) {
  if (typeof code !== "string" && code.length != LOBBY_CODE_LENGTH) {
    throw new Error("invalid lobby code");
  }

  const lobbyRef = collection(db, "lobby");
  const q = query(lobbyRef, where("code", "==", code));
  try {
    const querySnapShot = await getDocs(q);
    if (querySnapShot.size == 0) {
      return null;
    } else if (querySnapShot.size > 1) {
      throw new Error("found more than one lobby with code " + code);
    } else {
      return Lobby.fromFirestore(querySnapShot.docs[0]);
    }
  } catch (e) {
    throw e;
  }
}

export async function isLobbyCodeExist(code) {
  if (typeof code !== "string" && code.length != LOBBY_CODE_LENGTH) {
    throw new Error("invalid lobby code");
  }

  const lobbyRef = collection(db, "lobby");
  const q = query(lobbyRef, where("code", "==", code));
  try {
    const querySnapShot = await getDocs(q);
    if (querySnapShot.size == 0) {
      return false;
    } else return true;
  } catch (e) {
    throw e;
  }
}

export async function updateHost(lobby, hostUuid) {
  if (!(lobby instanceof Lobby)) {
    throw new Error("lobby is not an instance of Lobby class");
  }

  if (typeof hostUuid !== "string") {
    throw new Error("invalid hostUuid type");
  }

  const newHostRef = doc(db, "user", hostUuid);
  try {
    const newHostDoc = await getDoc(newHostRef);
    if (!newHostDoc.exists()) {
      throw new Error("new host uuid does not exist");
    }
  } catch (e) {
    throw e;
  }

  if (lobby.uuid == null) {
    throw new Error("missing lobby uuid");
  }

  const docRef = doc(db, "lobby", lobby.uuid);
  try {
    await updateDoc(docRef, {
      host: hostUuid,
    });
  } catch (e) {
    throw e;
  }
}

export async function deleteLobby(lobby) {
  if (!(lobby instanceof Lobby)) {
    throw new Error("lobby is not an instance of Lobby class");
  }

  if (lobby.uuid == null) {
    throw new Error("missing lobby uuid");
  }

  const lobbyRef = doc(db, "lobby", lobby.uuid);
  try {
    const lobbyDoc = await getDoc(lobbyRef);
    if (!lobbyDoc.exists()) {
      throw new Error("lobby does not exist");
    }

    await deleteDoc(lobbyRef);
  } catch (e) {
    throw e;
  }
}

export async function joinPlayers(lobby, uuid, username) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  const lobbyDoc = await getDoc(lobbyRef);
  const players = lobbyDoc.data()?.players;

  // If they are already in the players array, do nothing
  if (uuid in players) {
    return;
  } else {
    // Remove from spectators if they are in there
    let dField = "spectators." + uuid;
    try {
      await updateDoc(lobbyRef, {
        [dField]: deleteField(),
      });
    } catch (e) {
      throw e;
    }

    // Add them to the players list
    let nField = "players." + uuid;
    let boardField = "playerBoards." + uuid;
    let pendingShapeField = "playerPendingShapes." + uuid;
    let pendingRowsField = "playerPendingRows." + uuid;
    try {
      await updateDoc(lobbyRef, {
        [nField]: new PlayerHelper(username).toFirestore(),
      });

      await updateDoc(lobbyRef, {
        [boardField]: PlayerHelper.nestedArrayToObject(initializeEmptyBoard()),
      });

      await updateDoc(lobbyRef, {
        [pendingShapeField]: [],
      });

      await updateDoc(lobbyRef, {
        [pendingRowsField]: 0,
      });
    } catch (e) {
      throw e;
    }
  }
}

export async function joinSpectators(lobby, uuid, username) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  const lobbyDoc = await getDoc(lobbyRef);
  const spectators = lobbyDoc.data()?.spectators;

  // If they are already in the spectators array, do nothing
  if (uuid in spectators) {
    return;
  } else {
    // Remove from players if they are in there
    let dField = "players." + uuid;
    let boardField = "playerBoards." + uuid;
    let pendingShapeField = "playerPendingShapes." + uuid;
    let pendingRowsField = "playerPendingRows." + uuid;

    try {
      await updateDoc(lobbyRef, {
        [dField]: deleteField(),
      });
      await updateDoc(lobbyRef, {
        [boardField]: deleteField(),
      });
      await updateDoc(lobbyRef, {
        [pendingShapeField]: deleteField(),
      });
      await updateDoc(lobbyRef, {
        [pendingRowsField]: deleteField(),
      });
    } catch (e) {
      throw e;
    }

    // Add them to the spectators list
    let nField = "spectators." + uuid;
    try {
      await updateDoc(lobbyRef, {
        [nField]: { username: username },
      });
    } catch (e) {
      throw e;
    }
  }
}

export async function leaveLobby(lobby, uuid) {
  if (lobby == null) {
    return;
  }

  const lobbyRef = doc(db, "lobby", lobby.uuid);
  const lobbyDoc = await getDoc(lobbyRef);
  const players = lobbyDoc.data()?.players;
  const spectators = lobbyDoc.data()?.spectators;

  // Remove from players if they are in there
  if (uuid in players) {
    let dField = "players." + uuid;
    let boardField = "playerBoards." + uuid;
    let pendingShapeField = "playerPendingShapes." + uuid;
    let pendingRowsField = "playerPendingRows." + uuid;

    try {
      await updateDoc(lobbyRef, {
        [dField]: deleteField(),
      });

      await updateDoc(lobbyRef, {
        [boardField]: deleteField(),
      });

      await updateDoc(lobbyRef, {
        [pendingShapeField]: deleteField(),
      });

      await updateDoc(lobbyRef, {
        [pendingRowsField]: deleteField(),
      });
    } catch (e) {
      throw e;
    }
  }

  // Remove from spectators if they are in there
  if (uuid in spectators) {
    let dField = "spectators." + uuid;
    try {
      await updateDoc(lobbyRef, {
        [dField]: deleteField(),
      });
    } catch (e) {
      throw e;
    }
  }
}

// Game communications
export async function updateBoard(lobby, uuid, board) {
  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "playerBoards." + uuid;
  try {
    await updateDoc(docRef, {
      [uField]: PlayerHelper.nestedArrayToObject(board),
    });
  } catch (e) {
    throw e;
  }
}

export async function updateScore(lobby, uuid, score) {
  if (typeof score !== "number") {
    throw new Error("score is not a number");
  }

  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "players." + uuid + ".score";
  try {
    await updateDoc(docRef, {
      [uField]: score,
    });
  } catch (e) {
    throw e;
  }
}

export async function popPendingRows(lobby, myUuid, rowsCount) {
  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "playerPendingRows." + myUuid;
  try {
    await updateDoc(docRef, {
      [uField]: increment(-1 * rowsCount),
    });
  } catch (e) {
    throw e;
  }
}

export async function pushPendingRows(lobby, userUuid, rowsCount) {
  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "playerPendingRows." + userUuid;
  try {
    await updateDoc(docRef, {
      [uField]: increment(rowsCount),
    });
  } catch (e) {
    throw e;
  }
}

export async function popPendingShapes(lobby, myUuid) {
  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "playerPendingShapes." + myUuid;
  try {
    await updateDoc(docRef, {
      [uField]: arrayRemove(0),
    });
  } catch (e) {
    throw e;
  }
}

export async function pushPendingShapes(lobby, userUuid, shape) {
  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "playerPendingShapes." + userUuid;
  try {
    await updateDoc(docRef, {
      [uField]: arrayUnion(PlayerHelper.nestedArrayToObject(shape)),
    });
  } catch (e) {
    throw e;
  }
}

export async function popShapeQueue(lobby, userUuid, poppedShapesCount) {
  const docRef = doc(db, "lobby", lobby.uuid);
  const lobbyDoc = await getDoc(docRef);
  const shapeQueue = lobbyDoc.data()?.playerPendingShapes[userUuid];
  shapeQueue.splice(0, poppedShapesCount)
  let uField = "playerPendingShapes." + userUuid;
  try {
    await updateDoc(docRef, {
      [uField]: shapeQueue,
    });
  } catch (e) {
    throw e;
  }
}

export async function startPlayerIndividualGame(lobby, playerUuid) {
  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "players." + playerUuid + ".status";
  try {
    await updateDoc(docRef, {
      [uField]: LOBBY_PLAYER_STATUS_ONGOING,
    });
  } catch (e) {
    throw e;
  }
}

export async function endPlayerIndividualGame(lobby, playerUuid) {
  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "players." + playerUuid + ".status";
  try {
    await updateDoc(docRef, {
      [uField]: LOBBY_PLAYER_STATUS_END,
    });
  } catch (e) {
    throw e;
  }
}

export async function isGameFinished(lobby) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  const lobbyDoc = await getDoc(lobbyRef);
  const players = lobbyDoc.data()?.players;
  const playerCount = Object.keys(players).length;

  const endedPlayers = Object.entries(players).filter(
    ([playerUuid, playerData]) => playerData.status == LOBBY_PLAYER_STATUS_END
  );
  if (endedPlayers.length == playerCount) {
    return true;
  } else {
    return false;
  }
}

// Lobby status
export async function openLobby(lobby) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  try {
    await updateDoc(lobbyRef, {
      status: LOBBY_STATUS_OPEN,
    });
  } catch (e) {
    throw e;
  }
}

export async function fullLobby(lobby) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  try {
    await updateDoc(lobbyRef, {
      status: LOBBY_STATUS_FULL,
    });
  } catch (e) {
    throw e;
  }
}

export async function startGameForLobby(lobby) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  try {
    await updateDoc(lobbyRef, {
      status: LOBBY_STATUS_ONGOING,
    });
  } catch (e) {
    throw e;
  }
}

export async function endGameForLobby(lobby) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  try {
    await updateDoc(lobbyRef, {
      status: LOBBY_STATUS_END,
    });
  } catch (e) {
    throw e;
  }
}

export async function inviteFriendToLobby(friendUuid, lobbyCode) {
  if (typeof friendUuid !== "string") {
    throw new Error("invalid friendUuid type");
  }

  const friendRef = doc(db, "user", friendUuid);
  try {
    await updateDoc(friendRef, {
      lobby_invites: arrayUnion(lobbyCode),
    });
  } catch (e) {
    throw e;
  }
}

export async function removeLobbyInvite(user, lobbyCode) {
  if (typeof lobbyCode !== "string") {
    throw new Error("invalid lobbyCode type");
  }

  const userRef = doc(db, "user", user.uuid);
  try {
    await updateDoc(userRef, {
      lobby_invites: arrayRemove(lobbyCode),
    });
  } catch (e) {
    throw e;
  }
}
