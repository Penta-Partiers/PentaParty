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
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { User } from "./user.js";

const LOBBY_CODE_LENGTH = 6;

export class Lobby {
  constructor(code, hostUuid, uuid, users) {
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
    if (users == null) {
      this.users = [];
    } else {
      if (!(users instanceof Array)) {
        throw new Error("users is not an array");
      }

      this.users = users;
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
      "users: [" +
      this.users +
      "]"
    );
  }

  toFirestore() {
    return {
      code: this.code,
      host: this.hostUuid,
      users: this.users,
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
    return new Lobby(data.code, data.host, snapshot.id, data.user);
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

export async function addUser(lobby, user) {
  if (!(lobby instanceof Lobby)) {
    throw new Error("lobby is not an instance of Lobby class");
  }

  if (!(user instanceof User)) {
    throw new Error("user is not an instance of User class");
  }

  if (lobby.uuid == null) {
    throw new Error("missing lobby uuid");
  }

  const docRef = doc(db, "lobby", lobby.uuid);
  try {
    await updateDoc(docRef, {
      users: arrayUnion(user.uuid),
    });
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
