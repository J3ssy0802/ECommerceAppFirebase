import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from 'firebase/auth';
import {
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export interface UserProfile {
  uid: string;
  email: string | null;
  name: string;
  address: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export async function registerUser(email: string, password: string): Promise<User> {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(
    doc(db, 'users', userCredential.user.uid),
    {
      uid: userCredential.user.uid,
      email: userCredential.user.email,
      name: '',
      address: '',
      createdAt: serverTimestamp(),
    },
    { merge: true }
  );

  return userCredential.user;
}

export async function loginUser(email: string, password: string): Promise<User> {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthChanges(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userDocRef = doc(db, 'users', uid);
  const snapshot = await getDoc(userDocRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

export async function updateUserProfile(
  uid: string,
  profile: Pick<UserProfile, 'name' | 'address'>
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    {
      ...profile,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteUserAccount(uid: string): Promise<void> {
  const currentUser = auth.currentUser;

  if (!currentUser || currentUser.uid !== uid) {
    throw new Error('You must be logged in as this user to delete the account.');
  }

  await deleteDoc(doc(db, 'users', uid));
  await deleteUser(currentUser);
}
