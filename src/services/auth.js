import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { getAuthInstance } from '../config/firebase';

export const loginUser = async (email, password) => {
  const auth = getAuthInstance();
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const registerUser = async (email, password) => {
  const auth = getAuthInstance();
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const logoutUser = async () => {
  const auth = getAuthInstance();
  await signOut(auth);
};

export const subscribeToAuthState = (callback) => {
  const auth = getAuthInstance();
  return onAuthStateChanged(auth, callback);
};

