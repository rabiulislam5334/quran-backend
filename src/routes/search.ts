import { Hono } from "hono";
import { SURAHS, fetchSurahData } from "../data/quran";

export const searchRoutes = new Hono();

interface SearchResult {
  surah_id: number;
  surah_name: string;
  surah_transliteration: string;
  verse: number;
  text: string;
  translation: string;
  highlight: string;
}

// GET /api/search?q=query&limit=20&page=1
searchRoutes.get("/", async (c) => {
  const query = c.req.query("q")?.trim().toLowerCase();
  const limit = Math.min(parseInt(c.req.query("limit") ?? "20"), 50);
  const page = Math.max(parseInt(c.req.query("page") ?? "1"), 1);

  if (!query || query.length < 2) {
    return c.json({ error: "Query must be at least 2 characters" }, 400);
  }

  const results: SearchResult[] = [];

  // Search all 114 surahs concurrently for performance
  await Promise.all(
    SURAHS.map(async (surah) => {
      try {
        const { arabic, translation } = await fetchSurahData(surah.id);

        for (const [key, trans] of Object.entries(translation as Record<string, string>)) {
          const arabicText = (arabic as Record<string, string>)[key] ?? "";
          const transLower = trans.toLowerCase();
          const arabicLower = arabicText.toLowerCase();

          if (transLower.includes(query) || arabicLower.includes(query)) {
            const idx = transLower.indexOf(query);
            const highlight =
              idx !== -1
                ? "..." +
                  trans.substring(Math.max(0, idx - 40), idx + query.length + 40) +
                  "..."
                : trans.substring(0, 100) + "...";

            results.push({
              surah_id: surah.id,
              surah_name: surah.name,
              surah_transliteration: surah.transliteration,
              verse: parseInt(key),
              text: arabicText,
              translation: trans,
              highlight,
            });
          }
        }
      } catch {
        // Skip surahs that fail to load
      }
    })
  );

  // Sort by surah_id then verse for consistent ordering
  results.sort((a, b) =>
    a.surah_id !== b.surah_id ? a.surah_id - b.surah_id : a.verse - b.verse
  );

  const total = results.length;
  const paginated = results.slice((page - 1) * limit, page * limit);

  return c.json({
    data: paginated,
    total,
    page,
    limit,
    query,
  });
});