import axios from 'axios';

const API_KEY = process.env.NEXT_PUBLIC_BIBLE_API_KEY;
const BASE_URL = 'https://api.scripture.api.bible/v1';

export const getChapterText = async (bibleId, bookId, chapter) => {
  // Guard clause: If no API key is found, don't even try the request
  if (!API_KEY) {
    console.error("Bible API Key is missing from .env.local");
    return null;
  }

  try {
    const response = await axios.get(
      `${BASE_URL}/bibles/${bibleId}/chapters/${bookId}.${chapter}`,
      {
        headers: { 
          'api-key': API_KEY,
          'accept': 'application/json' 
        },
        params: { 
          'content-type': 'json', 
          'include-notes': false,
          'include-titles': true,
          'include-chapter-numbers': false,
          'include-verse-numbers': true 
        }
      }
    );

    return response.data.data;
  } catch (error) {
    // This will help us see exactly why the 403 happened in the console
    console.error("Bible API Error Status:", error.response?.status);
    console.error("Bible API Error Message:", error.response?.data?.message || error.message);
    return null;
  }
};