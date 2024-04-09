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
import { initializeEmptyBoard } from "../../tetris/useBoard";

const LOBBY_CODE_LENGTH = 6;

export const LOBBY_STATUS_OPEN = "open";
export const LOBBY_STATUS_FULL = "full";
export const LOBBY_STATUS_ONGOING = "ongoing";
export const LOBBY_STATUS_END = "end";

export const LOBBY_PLAYER_STATUS_NOT_STARTED = "not started";
export const LOBBY_PLAYER_STATUS_ONGOING = "ongoing";
export const LOBBY_PLAYER_STATUS_END = "end";

/**
 *  Player helper class to help encoding and parsing player data from/to database required format
 *  ==> Functional Requirements: FR11, FR26, FR27, FR28
 */
export class PlayerHelper {
  constructor(username) {
    this.score = 0;
    this.username = username;
    this.status = LOBBY_PLAYER_STATUS_NOT_STARTED;
  }

  /**
   * Encode player helper class data into database required format
   * ==> Functional Requirements: FR11, FR26
   */
  toFirestore() {
    return {
      score: this.score,
      username: this.username,
      status: this.status,
    };
  }

  /**
   * Parse database data into game board format
   * ==> Functional Requirements: FR28
   */
  static nestedArrayToObject(nested) {
    let rslt = {};
    for (let i = 0; i < nested.length; i++) {
      rslt[i] = nested[i];
    }

    return rslt;
  }

  /**
   * Encode game board into database required format
   * ==> Functional Requirements: FR28
   */
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

/**
 *  Lobby class to help encoding and parsing player data from/to database required format
 *  ==> Functional Requirements: FR8, FR9, FR10
 */
export class Lobby {
  constructor(code, hostUuid, uuid, playerBoards, playerPendingRows, playerPendingShapes, playerPendingShapesSize, players, spectators, status) {
    if (code && typeof code !== "string" && code.length != LOBBY_CODE_LENGTH) {
      throw new Error("invalid lobby code");
    }

    if (hostUuid && typeof hostUuid !== "string") {
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

    if (playerPendingShapesSize == null) {
      this.playerPendingShapesSize = {};
    } else {
      if (!(playerPendingShapesSize instanceof Object)) {
        throw new Error("playerPendingShapesSize is not an Object");
      }

      this.playerPendingShapesSize = playerPendingShapesSize;
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

  /**
   *  Encode lobby class data into database required format
   *  ==> Functional Requirements: FR8
   */
  toFirestore() {
    return {
      code: this.code,
      host: this.hostUuid,
      players: this.players,
      playerPendingRows: this.playerPendingRows,
      playerBoards: this.playerBoards,
      playerPendingShapes: this.playerPendingShapes,
      playerPendingShapesSize: this.playerPendingShapesSize,
      spectators: this.spectators,
      status: this.status,
    };
  }

  /**
   *  Setter method for new uuid
   *  ==> Functional Requirements: FR8
   */
  setUuid(uuid) {
    if (typeof uuid !== "string") {
      throw new Error("invalid uuid type");
    }

    this.uuid = uuid;
  }

  /**
   *  Parse lobby class data from database required format
   *  ==> Functional Requirements: FR9, FR10
   */
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
        data.playerPendingShapesSize,
        data.players,
        data.spectators,
        data.status
      );
    }
    return null;
  }
}

// Lobby actions
/**
 *  Create new lobby in database
 *  ==> Functional Requirements: FR8
 */
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

/**
 *  Get lobby instance by lobby code
 *  ==> Functional Requirements: FR9, FR10
 */
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

/**
 *  Check if a lobby exist
 *  ==> Functional Requirements: FR9, FR10
 */
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

/**
 *  Delete a lobby in database
 *  ==> Functional Requirements: FR21
 */
export async function deleteLobby(lobby) {
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

/**
 *  Add a new play to lobby in database / switch to player row
 *  ==> Functional Requirements: FR10, FR11
 */
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
    let pendingShapesSizeField = "playerPendingShapesSize." + uuid;
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

      await updateDoc(lobbyRef, {
        [pendingShapesSizeField]: 0,
      })
    } catch (e) {
      throw e;
    }
  }
}

/**
 *  Add a new spectator to lobby in database / switch to spectator role
 *  ==> Functional Requirements: FR11
 */
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

/**
 *  Delete player from lobby in database
 *  ==> Functional Requirements: FR8
 */
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
/**
 *  Update player's board in database
 *  ==> Functional Requirements: FR14, FR16, FR17, FR18, FR19, FR20
 */
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

/**
 *  Update player's score in database
 *  ==> Functional Requirements: FR26
 */
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

/**
 *  Pop a pending incompleted row from database
 *  ==> Functional Requirements: FR27
 */
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

/**
 *  Push a pending incompleted row to database
 *  ==> Functional Requirements: FR27
 */
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

/**
 *  Update size of pending shape
 *  ==> Functional Requirements: FR23, FR24, FR25
 */
export async function setPendingShapesSize(lobby, userUuid, pendingShapesSize) {
  const docRef = doc(db, "lobby", lobby.uuid);
  let uField = "playerPendingShapesSize." + userUuid;
  try {
    await updateDoc(docRef, {
      [uField]: pendingShapesSize,
    });
  } catch (e) {
    throw e;
  }
}

/**
 *  Pop a pending shape from database
 *  ==> Functional Requirements: FR23, FR25
 */
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

/**
 *  Push a pending shape to database
 *  ==> Functional Requirements: FR23, FR24, FR25
 */
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

/**
 *  Pop multiple pending shapes from database
 *  ==> Functional Requirements: FR23, FR25
 */
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

/**
 *  Read side of current player shape queue
 *  ==> Functional Requirements: FR24, FR25
 */
export async function getShapeQueueSize(lobby, userUuid) {
  const docRef = doc(db, "lobby", lobby.uuid);
  const lobbyDoc = await getDoc(docRef);
  const shapeQueueSize = lobbyDoc.data()?.playerPendingShapesSize[userUuid];
  return shapeQueueSize
}

/**
 *  Update player status to ongoing in lobby for individual game
 *  ==> Functional Requirements: FR12
 */
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

/**
 *  Update player status to end in lobby for individual game
 *  ==> Functional Requirements: FR21, FR22
 */
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

/**
 *  Check if a game is finished
 *  ==> Functional Requirements: FR21, FR22
 */
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
/**
 *  Update lobby status to open
 *  ==> Functional Requirements: FR8, FR10, FR11
 */
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

/**
 *  Update lobby status to full
 *  ==> Functional Requirements: FR10, FR11
 */
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

/**
 *  Update lobby status to ongoing
 *  ==> Functional Requirements: FR12
 */
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

/**
 *  Update lobby status to end
 *  ==> Functional Requirements: FR22
 */
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

/**
 *  Add lobby invites to user
 *  ==> Functional Requirements: FR9
 */
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

/**
 *  Remove lobby invites to user
 *  ==> Functional Requirements: FR9
 */
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
