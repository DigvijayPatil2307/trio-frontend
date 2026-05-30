import { useState, useEffect } from 'react';

export function useWikipediaImage(locationName: string, searchSuffix: string = "city landscape") {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    if (!locationName) {
      setLoading(false);
      return;
    }
    
    async function fetchImage() {
      setLoading(true);
      try {
        // First try to search for the location to get the best matching article title
        const queryTerm = locationName + (searchSuffix ? " " + searchSuffix : "");
        const searchRes = await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryTerm)}&utf8=&format=json&origin=*`);
        const searchData = await searchRes.json();
        const searchResults = searchData.query?.search;
        
        let titleToFetch = locationName;
        if (searchResults && searchResults.length > 0) {
          titleToFetch = searchResults[0].title;
        }

        // Fetch the image for that title
        const res = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=1000&titles=${encodeURIComponent(titleToFetch)}&origin=*`);
        const data = await res.json();
        
        const pages = data.query?.pages;
        if (pages) {
          const pageId = Object.keys(pages)[0];
          if (pageId !== "-1" && pages[pageId]?.thumbnail?.source) {
            if (isMounted) setImageUrl(pages[pageId].thumbnail.source);
          } else {
             // Fallback to second result
             if (searchResults && searchResults.length > 1) {
                const res2 = await fetch(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&pithumbsize=1000&titles=${encodeURIComponent(searchResults[1].title)}&origin=*`);
                const data2 = await res2.json();
                const pages2 = data2.query?.pages;
                if (pages2) {
                   const pageId2 = Object.keys(pages2)[0];
                   if (pageId2 !== "-1" && pages2[pageId2]?.thumbnail?.source) {
                     if (isMounted) setImageUrl(pages2[pageId2].thumbnail.source);
                   }
                }
             }
          }
        }
      } catch (err) {
        console.error("Failed to fetch location image from Wikipedia", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchImage();
    return () => { isMounted = false; };
  }, [locationName, searchSuffix]);

  return { imageUrl, loading };
}
