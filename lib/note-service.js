import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const saveNote = async (userId, bookId, chapter, contentJson) => {
  // SAFETY: If userId is missing, stop immediately
  if (!userId || !bookId) return;

  try {
    const docId = `${bookId}_${chapter}`;
    const docRef = doc(db, 'users', userId, 'notes', docId);
    await setDoc(docRef, { content: contentJson }, { merge: true });
  } catch (err) {
    console.error("Error saving note:", err);
  }
};

export const loadNote = async (userId, bookId, chapter) => {
  // SAFETY: If userId is missing, return null instead of crashing
  if (!userId || !bookId) return null;

  try {
    const docId = `${bookId}_${chapter}`;
    const docRef = doc(db, 'users', userId, 'notes', docId);
    const snap = await getDoc(docRef);
    return snap.exists() ? snap.data().content : null;
  } catch (err) {
    console.error("Error loading note:", err);
    return null;
  }
};