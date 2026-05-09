# QuranMazid — Backend API

Hono.js REST API server for the QuranMazid application. Serves Quran data including Surah metadata, Ayah text with translations, and full-text search.

---

## Tech Stack

- **Framework**: [Hono](https://hono.dev/) (lightweight, fast)
- **Runtime**: Node.js
- **Language**: TypeScript
- **Data**: Local JSON (Quran text + translations)

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Install & Run

```bash
npm install
npm run dev
```

Server runs at **http://localhost:4000**

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `4000` | Port for the API server |

```bash
# Custom port example
PORT=5000 npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## Project Structure

```
back/
└── src/
    ├── index.ts          # App entry — middleware, routes, error handling
    ├── data/
    │   └── quran.ts      # Quran data loader (SURAHS list + fetchSurahData)
    └── routes/
        ├── surah.ts      # /api/surahs routes
        ├── ayah.ts       # /api/ayahs routes
        └── search.ts     # /api/search routes
```

---

## API Reference

### Base URL

```
http://localhost:4000
```

---

### Health Check

```
GET /
```

**Response**
```json
{
  "message": "Quran API is running 🕌",
  "version": "1.0.0"
}
```

---

### Surahs

#### List all Surahs

```
GET /api/surahs
```

**Response**
```json
{
  "data": [
    {
      "id": 1,
      "name": "الفاتحة",
      "transliteration": "Al-Fatiha",
      "translation": "The Opening",
      "type": "meccan",
      "total_verses": 7
    },
    ...
  ],
  "total": 114
}
```

---

#### Get Surah metadata

```
GET /api/surahs/:id
```

| Param | Type | Description |
|-------|------|-------------|
| `id` | number | Surah number (1–114) |

**Response**
```json
{
  "data": {
    "id": 1,
    "name": "الفاتحة",
    "transliteration": "Al-Fatiha",
    "translation": "The Opening",
    "type": "meccan",
    "total_verses": 7
  }
}
```

---

#### Get all Ayahs of a Surah

```
GET /api/surahs/:id/ayahs
```

**Response**
```json
{
  "data": {
    "surah": { ... },
    "ayahs": [
      {
        "id": 1,
        "surah": 1,
        "verse": 1,
        "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
        "translation": "In the name of Allah, the Entirely Merciful, the Especially Merciful.",
        "audio_url": "https://cdn.islamic.network/quran/audio/128/ar.alafasy/1.mp3"
      },
      ...
    ],
    "total": 7
  }
}
```

---

### Ayahs

#### Get a single Ayah

```
GET /api/ayahs/:surah/:verse
```

| Param | Type | Description |
|-------|------|-------------|
| `surah` | number | Surah number (1–114) |
| `verse` | number | Verse number |

**Response**
```json
{
  "data": {
    "id": 1,
    "surah": 1,
    "verse": 1,
    "text": "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ",
    "translation": "In the name of Allah, the Entirely Merciful, the Especially Merciful."
  }
}
```

---

### Search

#### Full-text search

```
GET /api/search?q=:query&page=:page&limit=:limit
```

| Query Param | Default | Description |
|-------------|---------|-------------|
| `q` | required | Search term — min 2 characters (Arabic or English) |
| `page` | `1` | Page number |
| `limit` | `20` | Results per page (max 50) |

**Response**
```json
{
  "data": [
    {
      "surah_id": 2,
      "surah_name": "البقرة",
      "surah_transliteration": "Al-Baqarah",
      "verse": 45,
      "text": "وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ ...",
      "translation": "And seek help through patience and prayer ...",
      "highlight": "...seek help through patience and prayer..."
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 20,
  "query": "patience"
}
```

---

## Error Responses

All errors follow this shape:

```json
{ "error": "Error message here" }
```

| Status | Meaning |
|--------|---------|
| `400` | Bad request (invalid ID, short query, etc.) |
| `404` | Resource not found |
| `500` | Internal server error |

---

## CORS

CORS is enabled for all origins (`*`) with `GET` and `OPTIONS` methods allowed. Adjust in `src/index.ts` for production.

---

## Audio URLs

Audio is served from the Islamic Network CDN. URLs are computed using global verse numbers:

```
https://cdn.islamic.network/quran/audio/128/ar.alafasy/{globalVerseNumber}.mp3
```

Reciter: **Mishary Rashid Al-Afasy**, 128 kbps.
