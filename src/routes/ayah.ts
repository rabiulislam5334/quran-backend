import { Hono } from "hono";
import { fetchSurahData } from "../data/quran";

export const ayahRoutes = new Hono();

// GET /api/ayahs/:surah/:verse — get a single ayah
ayahRoutes.get("/:surah/:verse", async (c) => {
  const surahId = parseInt(c.req.param("surah"));
  const verseNum = parseInt(c.req.param("verse"));

  if (isNaN(surahId) || surahId < 1 || surahId > 114) {
    return c.json({ error: "Invalid surah id" }, 400);
  }

  try {
    const { arabic, translation } = await fetchSurahData(surahId);
    const key = String(verseNum);
    const text = (arabic as Record<string, string>)[key];
    const trans = (translation as Record<string, string>)[key];

    if (!text) {
      return c.json({ error: "Ayah not found" }, 404);
    }

    return c.json({
      data: {
        id: verseNum,
        surah: surahId,
        verse: verseNum,
        text,
        translation: trans ?? "",
      },
    });
  } catch (err) {
    return c.json({ error: "Failed to fetch ayah" }, 500);
  }
});
