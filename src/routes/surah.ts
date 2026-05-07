import { Hono } from "hono";
import { SURAHS, fetchSurahData } from "../data/quran";

export const surahRoutes = new Hono();

// GET /api/surahs — list all 114 surahs
surahRoutes.get("/", (c) => {
  return c.json({ data: SURAHS, total: SURAHS.length });
});

// GET /api/surahs/:id — get single surah metadata
surahRoutes.get("/:id", (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id) || id < 1 || id > 114) {
    return c.json({ error: "Invalid surah id. Must be 1–114." }, 400);
  }
  const surah = SURAHS.find((s) => s.id === id);
  return c.json({ data: surah });
});

// GET /api/surahs/:id/ayahs — get all ayahs for a surah
surahRoutes.get("/:id/ayahs", async (c) => {
  const id = parseInt(c.req.param("id"));
  if (isNaN(id) || id < 1 || id > 114) {
    return c.json({ error: "Invalid surah id. Must be 1–114." }, 400);
  }

  try {
    const surah = SURAHS.find((s) => s.id === id)!;
    const { arabic, translation } = await fetchSurahData(id);

    const ayahs = Object.entries(arabic).map(([key, text]) => {
      const verseNum = parseInt(key);
      return {
        id: verseNum,
        surah: id,
        verse: verseNum,
        text: text as string,
        translation: (translation as Record<string, string>)[key] ?? "",
        audio_url: `https://cdn.islamic.network/quran/audio/128/ar.alafasy/${
          getGlobalVerseNumber(id, verseNum)
        }.mp3`,
      };
    });

    return c.json({
      data: {
        surah,
        ayahs,
        total: ayahs.length,
      },
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to fetch ayahs" }, 500);
  }
});

// Helper: calculate global verse number for audio URLs
function getGlobalVerseNumber(surahId: number, verseNum: number): number {
  const SURAHS_VERSE_COUNT: number[] = [
    7, 286, 200, 176, 120, 165, 206, 75, 129, 109, 123, 111, 43, 52, 99, 128,
    111, 110, 98, 135, 112, 78, 118, 64, 77, 227, 93, 88, 69, 60, 34, 30, 73,
    54, 45, 83, 182, 88, 75, 85, 54, 53, 89, 59, 37, 35, 38, 29, 18, 45, 60,
    49, 62, 55, 78, 96, 29, 22, 24, 13, 14, 11, 11, 18, 12, 12, 30, 52, 52,
    44, 28, 28, 20, 56, 40, 31, 50, 40, 46, 42, 29, 19, 36, 25, 22, 17, 19,
    26, 30, 20, 15, 21, 11, 8, 8, 19, 5, 8, 8, 11, 11, 8, 3, 9, 5, 4, 7, 3,
    6, 3, 5, 4, 5, 6,
  ];
  let globalNum = 0;
  for (let i = 0; i < surahId - 1; i++) {
    globalNum += SURAHS_VERSE_COUNT[i] ?? 0;
  }
  return globalNum + verseNum;
}