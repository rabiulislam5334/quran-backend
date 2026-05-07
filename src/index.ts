import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { surahRoutes } from "./routes/surah";
import { ayahRoutes } from "./routes/ayah";
import { searchRoutes } from "./routes/search";
import { handle } from 'hono/vercel'

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://*.vercel.app"],
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

app.get("/", (c) => c.json({ message: "Quran API is running 🕌", version: "1.0.0" }));

app.route("/api/surahs", surahRoutes);
app.route("/api/ayahs", ayahRoutes);
app.route("/api/search", searchRoutes);

app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.notFound((c) => c.json({ error: "Not Found" }, 404));

export const runtime = 'edge' ;
export default handle(app);
console.log("🕌 Quran API server running on http://localhost:4000");