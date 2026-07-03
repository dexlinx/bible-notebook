import { db } from './firebase';
import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';

export const getLibraryData = async (userId) => {
  const docRef = doc(db, 'users', userId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    return {
      active: snap.data().library || [],
      archived: snap.data().archived || []
    };
  }
  return { active: [], archived: [] };
};

export const addToLibrary = async (userId, bookId) => {
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, {
    library: arrayUnion(bookId),
    archived: arrayRemove(bookId) // Remove from archive if re-adding
  }, { merge: true });
};

export const archiveBook = async (userId, bookId) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    library: arrayRemove(bookId),
    archived: arrayUnion(bookId)
  });
};

export const deleteBookPermanently = async (userId, bookId) => {
  const docRef = doc(db, 'users', userId);
  await updateDoc(docRef, {
    library: arrayRemove(bookId),
    archived: arrayRemove(bookId)
  });
};