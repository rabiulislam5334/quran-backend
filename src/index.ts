import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handle } from 'hono/vercel';

import { surahRoutes } from "./routes/surah.js";     
import { ayahRoutes } from "./routes/ayah.js";
import { searchRoutes } from "./routes/search.js";

const app = new Hono();

app.use("*", logger());

app.use(
  "*",
  cors({
    origin: "*",
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/", (c) => c.json({ 
  message: "Quran API is running 🕌", 
  version: "1.0.0" 
}));

app.route("/api/surahs", surahRoutes);
app.route("/api/ayahs", ayahRoutes);
app.route("/api/search", searchRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.notFound((c) => c.json({ error: "Not Found" }, 404));

export default handle(app);
export const GET = handle(app);