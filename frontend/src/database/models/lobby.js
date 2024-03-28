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
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { User } from "./user.js";

const LOBBY_CODE_LENGTH = 6;

export class Lobby {
  constructor(code, hostUuid, uuid, players, spectators, started) {
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
    if (players == null) {
      this.players = [];
    } else {
      if (!(players instanceof Array)) {
        throw new Error("players is not an array");
      }

      this.players = players;
    }
    if (spectators == null) {
      this.spectators = [];
    } else {
      if (!(spectators instanceof Array)) {
        throw new Error("spectators is not an array");
      }

      this.spectators = spectators;
    }

    this.started = started;
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
      "started: " + 
      this.started
    );
  }

  toFirestore() {
    return {
      code: this.code,
      host: this.hostUuid,
      players: this.players,
      spectators: this.spectators,
      started: this.started,
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

  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    if (data) {
      return new Lobby(data.code, data.host, snapshot.id, data.players, data.spectators, data.started);
    }
    return null;
  }
}

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
  const spectators = lobbyDoc.data()?.spectators;

  // If they are already in the players array, do nothing
  if (players.find(p => p.uuid == uuid)) {
    return;
  }
  else {
    // Remove from spectators if they are in there
    let removeSpectator = spectators.find(s => s.uuid == uuid);
    if (removeSpectator) {
      try {
        await updateDoc(lobbyRef, {
          spectators: arrayRemove(removeSpectator)
        });
      } catch (e) {
        throw e;
      }
    }

    // Add them to the players list
    try {
      await updateDoc(lobbyRef, {
        players: arrayUnion({uuid: uuid, username: username})
      }) 
    } catch (e) {
      throw e;
    }
  }
}

export async function joinSpectators(lobby, uuid, username) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  const lobbyDoc = await getDoc(lobbyRef);
  const players = lobbyDoc.data()?.players;
  const spectators = lobbyDoc.data()?.spectators;

  // If they are already in the spectators array, do nothing
  if (spectators.find(s => s.uuid == uuid)) {
    return;
  }
  else {
    // Remove from players if they are in there
    let removePlayer = players.find(s => s.uuid == uuid);
    if (removePlayer) {
      try {
        await updateDoc(lobbyRef, {
          players: arrayRemove(removePlayer)
        });
      } catch (e) {
        throw e;
      }
    }

    // Add them to the spectators list
    try {
      await updateDoc(lobbyRef, {
        spectators: arrayUnion({uuid: uuid, username: username})
      }) 
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
  let removePlayer = players.find(s => s.uuid == uuid);
  if (removePlayer) {
    try {
      await updateDoc(lobbyRef, {
        players: arrayRemove(removePlayer)
      });
    } catch (e) {
      throw e;
    }
  }

  // Remove from spectators if they are in there
  let removeSpectator = spectators.find(s => s.uuid == uuid);
  if (removeSpectator) {
    try {
      await updateDoc(lobbyRef, {
        spectators: arrayRemove(removeSpectator)
      });
    } catch (e) {
      throw e;
    }
  }
}

export async function startGameForLobby(lobby) {
  const lobbyRef = doc(db, "lobby", lobby.uuid);
  try {
    await updateDoc(lobbyRef, {
      started: true
      });
    } catch (e) {
      throw e;
    }
}