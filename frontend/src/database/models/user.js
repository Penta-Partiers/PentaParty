//@ts-check
import {
  collection,
  setDoc,
  doc,
  query,
  where,
  getDocs,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../../firebase.js";
import { validateEmail } from "../../util/util.js";

export class User {
  constructor(uuid, email, username, friends, pendingFriends, highScore) {
    if (!validateEmail(email)) {
      throw new Error("invalid email address");
    }

    if (typeof uuid !== "string") {
      throw new Error("invalid uuid type");
    }

    if (typeof username !== "string") {
      throw new Error("invalid username type");
    }

    this.uuid = uuid;
    this.email = email;
    this.username = username;
    if (friends == null) {
      this.friends = [];
    } else {
      if (!(friends instanceof Array)) {
        throw new Error("friends is not an array");
      }

      this.friends = friends;
    }

    if (pendingFriends == null) {
      this.pendingFriends = [];
    } else {
      if (!(pendingFriends instanceof Array)) {
        throw new Error("pendingFriends is not an array");
      }
      this.pendingFriends = pendingFriends;
    }

    if (highScore == null) {
      this.highScore = 0;
    } else {
      if (typeof highScore !== "number") {
        throw new Error("invalid highScore type");
      }

      this.highScore = highScore;
    }
  }

  toString() {
    return (
      "uuid: " +
      this.uuid +
      ", " +
      "email: " +
      this.email +
      ", " +
      "username: " +
      this.username +
      ", " +
      "friends: [" +
      this.friends +
      "], " +
      "pending friends: [" +
      this.pendingFriends +
      "]"
    );
  }

  toFirestore() {
    return {
      email: this.email,
      username: this.username,
      friends: this.friends,
      pending_friends: this.pendingFriends,
      high_score: this.highScore,
    };
  }

  setScore(score) {
    if (typeof score !== "number") {
      throw new Error("invalid score type");
    }

    this.highScore = score;
  }

  setUsername(username) {
    if (typeof username !== "string") {
      throw new Error("invalid username type");
    }

    this.username = username;
  }

  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return new User(
      snapshot.id,
      data.email,
      data.username,
      data.friends,
      data.pending_friends,
      data.high_score
    );
  }
}

export async function createUser(user) {
  if (!(user instanceof User)) {
    throw new Error("user is not an instance of User class");
  }

  try {
    await setDoc(doc(db, "user", user.uuid), user.toFirestore());
  } catch (e) {
    throw e;
  }
}

export async function getUuidByEmail(email) {
  if (!validateEmail(email)) {
    throw new Error("invalid email address");
  }

  const userRef = collection(db, "user");
  const q = query(userRef, where("email", "==", email));
  try {
    const querySnapShot = await getDocs(q);
    if (querySnapShot.size == 0) {
      return null;
    } else if (querySnapShot.size > 1) {
      throw new Error("found more than one documents with email " + email);
    } else {
      return querySnapShot.docs[0].id;
    }
  } catch (e) {
    throw e;
  }
}

export async function getUser(uuid) {
  const docRef = doc(db, "user", uuid);
  try {
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return User.fromFirestore(docSnap);
    } else {
      return null;
    }
  } catch (e) {
    throw e;
  }
}

export async function updateHighScore(user) {
  if (!(user instanceof User)) {
    throw new Error("user is not an instance of User class");
  }

  const docRef = doc(db, "user", user.uuid);
  try {
    await updateDoc(docRef, {
      high_score: user.highScore,
    });
  } catch (e) {
    throw e;
  }
}

export async function addFriend(user, friendUuid) {
  if (!(user instanceof User)) {
    throw new Error("user is not an instance of User class");
  }

  if (typeof friendUuid !== "string") {
    throw new Error("invalid friendUuid type");
  }

  const friendRef = doc(db, "user", friendUuid);
  try {
    const friendDoc = await getDoc(friendRef);
    if (!friendDoc.exists()) {
      throw new Error("friend uuid does not exist");
    }
  } catch (e) {
    throw e;
  }

  const docRef = doc(db, "user", user.uuid);
  try {
    await updateDoc(docRef, {
      friends: arrayUnion(friendUuid),
    });
  } catch (e) {
    throw e;
  }
}

export async function addPendingFriend(requester, receiverUuid) {
  if (!(requester instanceof User)) {
    throw new Error("requester is not an instance of User class");
  }

  if (typeof receiverUuid !== "string") {
    throw new Error("invalid receiverUuid type");
  }

  const receiverRef = doc(db, "user", receiverUuid);
  try {
    const receiverDoc = await getDoc(receiverRef);
    if (!receiverDoc.exists()) {
      throw new Error("receiver uuid does not exist");
    }

    updateDoc(receiverRef, {
      pending_friends: arrayUnion(requester.uuid),
    });
  } catch (e) {
    throw e;
  }
}

export async function updateUsername(user) {
  if (!(user instanceof User)) {
    throw new Error("user is not an instance of User class");
  }

  const docRef = doc(db, "user", user.uuid);
  try {
    await updateDoc(docRef, {
      username: user.username,
    });
  } catch (e) {
    throw e;
  }
}

export async function removeFriend(user, friendUuid) {
  if (!(user instanceof User)) {
    throw new Error("user is not an instance of User class");
  }

  if (typeof friendUuid !== "string") {
    throw new Error("invalid friendUuid type");
  }

  const friendRef = doc(db, "user", friendUuid);
  try {
    const friendDoc = await getDoc(friendRef);
    if (!friendDoc.exists()) {
      throw new Error("friend uuid does not exist");
    }
  } catch (e) {
    throw e;
  }

  const docRef = doc(db, "user", user.uuid);
  try {
    await updateDoc(docRef, {
      friends: arrayRemove(friendUuid),
    });
  } catch (e) {
    throw e;
  }
}

export async function removePendingFriend(user, friendUuid) {
  if (!(user instanceof User)) {
    throw new Error("user is not an instance of User class");
  }

  if (typeof friendUuid !== "string") {
    throw new Error("invalid friendUuid type");
  }

  const friendRef = doc(db, "user", friendUuid);
  try {
    const friendDoc = await getDoc(friendRef);
    if (!friendDoc.exists()) {
      throw new Error("friend uuid does not exist");
    }
  } catch (e) {
    throw e;
  }

  const docRef = doc(db, "user", user.uuid);
  try {
    await updateDoc(docRef, {
      pending_friends: arrayRemove(friendUuid),
    });
  } catch (e) {
    throw e;
  }
}
