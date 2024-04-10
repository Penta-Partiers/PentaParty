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


/**
 *  User class to help encoding and parsing User data from/to database required format
 *  ==> Functional Requirements: FR1, FR2, FR3, FR4, FR6, FR9
 */
export class User {
  constructor(uuid, email, username, friends, pendingFriends, highScore, lobbyInvites) {
    if (email && !validateEmail(email)) {
      throw new Error("invalid email address");
    }

    if (uuid && typeof uuid !== "string") {
      throw new Error("invalid uuid type");
    }

    if (username && typeof username !== "string") {
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

    if (lobbyInvites == null) {
      this.lobbyInvites = [];
    } else {
      if (!(lobbyInvites instanceof Array)) {
        throw new Error("pendingFriends is not an array");
      }
      this.lobbyInvites = lobbyInvites;
    }
  }

  /**
   *  Encode user class data into database required format
   *  ==> Functional Requirements: FR1
   */
  toFirestore() {
    return {
      email: this.email,
      username: this.username,
      friends: this.friends,
      pending_friends: this.pendingFriends,
      high_score: this.highScore,
      lobby_invites: this.lobbyInvites,
    };
  }

  /**
   *  Set user highest score
   *  ==> Functional Requirements: FR1, FR6
   */
  setScore(score) {
    if (typeof score !== "number") {
      throw new Error("invalid score type");
    }

    this.highScore = score;
  }

  /**
   *  Set user username
   *  ==> Functional Requirements: FR1
   */
  setUsername(username) {
    if (typeof username !== "string") {
      throw new Error("invalid username type");
    }

    this.username = username;
  }

  /**
   *  Pasre user class data from database required format
   *  ==> Functional Requirements: FR2, FR3, FR4, FR9
   */
  static fromFirestore(snapshot, options) {
    const data = snapshot.data(options);
    return new User(
      snapshot.id,
      data.email,
      data.username,
      data.friends,
      data.pending_friends,
      data.high_score,
      data.lobby_invites,
    );
  }

  /**
   *  Convert local storage data to User class
   *  ==> Functional Requirements: FR2
   */
  static fromJson(json) {
    return Object.assign(new User(), json);
  }
}

/**
 *  Create a new user in database
 *  ==> Functional Requirements: FR1
 */
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

/**
 *  Get user uuid from email in database
 *  ==> Functional Requirements: FR3
 */
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

/**
 *  Get user data from uuid in database
 *  ==> Functional Requirements: FR1, FR2, FR3, FR4, FR6, FR10, FR11
 */
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

/**
 *  Update user highest score in database
 *  ==> Functional Requirements: FR6, FR22
 */
export async function updateHighScore(userUuid, newHighScore) {
  const docRef = doc(db, "user", userUuid);
  const userDoc = await getDoc(docRef);
  const currentHighScore = userDoc.data()?.high_score;
  if (newHighScore > currentHighScore) {
    try {
      await updateDoc(docRef, {
        high_score: newHighScore,
      });
    } catch (e) {
      throw e;
    }
  }
}

/**
 *  Add a user to current user's friend list in database
 *  ==> Functional Requirements: FR4
 */
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

/**
 *  Add a user to current user's pending friend list in database
 *  ==> Functional Requirements: FR3, FR4
 */
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

/**
 *  Remove a user from current user's friend list in database
 *  ==> Functional Requirements: FR5
 */
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

/**
 *  Remove a user from current user's pending friend list in database
 *  ==> Functional Requirements: FR4
 */
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
