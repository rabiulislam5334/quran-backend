import { Hono } from "hono";
import { searchFromCache } from "../data/quran";

export const searchRoutes = new Hono();

// GET /api/search?q=query&limit=20&page=1
searchRoutes.get("/", async (c) => {
  const query = c.req.query("q")?.trim().toLowerCase();
  const limit = Math.min(parseInt(c.req.query("limit") ?? "20"), 50);
  const page = Math.max(parseInt(c.req.query("page") ?? "1"), 1);

  if (!query || query.length < 2) {
    return c.json({ error: "Query must be at least 2 characters" }, 400);
  }

  // Cache থেকে সরাসরি search — instant, কোনো network call নেই
  const results = searchFromCache(query);

  const total = results.length;
  const paginated = results.slice((page - 1) * limit, page * limit);

  return c.json({ data: paginated, total, page, limit, query });
});
