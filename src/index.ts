import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { handle } from 'hono/vercel';

import { surahRoutes } from "./routes/surah";
import { ayahRoutes } from "./routes/ayah";
import { searchRoutes } from "./routes/search";

const app = new Hono();

// Middleware
app.use("*", logger());

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://*.vercel.app", "*"], // "*" পরে সরাতে পারো
    allowMethods: ["GET", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  })
);

// Routes
app.get("/", (c) => c.json({ 
  message: "Quran API is running 🕌", 
  version: "1.0.0" 
}));

app.route("/api/surahs", surahRoutes);
app.route("/api/ayahs", ayahRoutes);
app.route("/api/search", searchRoutes);

// Error Handling
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal Server Error" }, 500);
});

app.notFound((c) => c.json({ error: "Not Found" }, 404));

// ✅ Vercel এর জন্য সঠিক export
export default handle(app);

// Optional: Development এ চালানোর জন্য
export const GET = handle(app);
export const POST = handle(app);