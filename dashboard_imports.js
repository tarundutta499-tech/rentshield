// Required Firebase imports for Dashboard
import { getAuth } from "firebase/auth";
import { getFirestore, collection, query, where, orderBy, onSnapshot, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getDownloadURL, ref } from "firebase/storage";
