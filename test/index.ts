import "dotenv/config";
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

function main() {
  signInWithEmailAndPassword(auth, "michael.inman29@gmail.com", "123456")
    .then((userRecord: any) => {
      console.dir({ userRecord }, { depth: null });
      // See the UserRecord reference doc for the contents of userRecord.
      console.log(`Successfully fetched user data: ${userRecord}`);
    })
    .catch((error: any) => {
      console.log("Error fetching user data:", error);
    });
}

main();
