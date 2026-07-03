import { db } from './firebase';
import { doc, setDoc, collection, query, getDocs, arrayUnion, arrayRemove, updateDoc } from 'firebase/firestore';

export const addWordHighlight = async (userId, verseId, text, start, end) => {
  if (!userId || !verseId) return;
  try {
    const highlightRef = doc(db, 'users', userId, 'highlights', verseId);
    await setDoc(highlightRef, {
      verseId,
      highlights: arrayUnion({ start, end }) 
    }, { merge: true });
  } catch (e) {
    console.error("Firebase Save Error:", e);
  }
};

export const removeWordHighlight = async (userId, verseId, highlightObj) => {
  if (!userId || !verseId) return;
  try {
    const highlightRef = doc(db, 'users', userId, 'highlights', verseId);
    // Ensure we only send the core data for matching
    const cleanObj = { start: highlightObj.start, end: highlightObj.end };
    await updateDoc(highlightRef, {
      highlights: arrayRemove(cleanObj)
    });
  } catch (e) {
    console.error("Firebase Remove Error:", e);
  }
};

export const getChapterHighlights = async (userId, bookId, chapter) => {
  if (!userId) return {};
  const highlights = {};
  try {
    const highlightsRef = collection(db, 'users', userId, 'highlights');
    const q = query(highlightsRef);
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      if (doc.id.startsWith(`${bookId}.${chapter}.`)) {
        highlights[doc.id] = doc.data().highlights;
      }
    });
  } catch (error) {
    console.error("Firebase Load Error:", error);
  }
  return highlights;
};