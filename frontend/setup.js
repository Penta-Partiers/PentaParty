import { collection, addDoc } from "firebase/firestore"; 
import { db } from "./src/firebase.js";
import 'dotenv/config'

try {
  await addDoc(collection(db, "user"), {});
  await addDoc(collection(db, "lobby"), {});
} catch (e) {
  console.error("Error adding document: ", e);
}

console.log("Database initialized!");
process.exit(0);