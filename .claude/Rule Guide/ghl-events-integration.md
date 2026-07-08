# GHL Events Integration Rules

This rule file documents how campaign events are fetched from GoHighLevel (GHL)
and surfaced on the website. Events are stored in GHL as **Custom Object records**
(not the native Calendars API), then normalized and served through local API routes.

---

## Architecture Overview

```
GHL Custom Object (custom_objects.events)
        ↓
  src/lib/ghl.js  →  fetchGHLEvents() / fetchGHLEvent(id)
        ↓
  /api/events       /api/events/[id]
        ↓
  Events pages / components (Server Components)
```

- Events live in a GHL **Custom Object** with schema key `custom_objects.events`
- All fetching happens server-side in `src/lib/ghl.js` — never call GHL from the client
- API routes wrap the helpers and apply 60s ISR caching
- Pages/components consume `/api/events` — they never import `ghl.js` directly
  from client code

---

## CRITICAL RULES

### 1. Use the Custom Object Search Endpoint — NOT the Calendars API

Events are NOT stored in GHL's native calendar system. They are records on a
custom object schema. Fetch them via:

```
POST /objects/custom_objects.events/records/search
```

Do **not** try `/calendars/events` or `/calendars/{id}/appointments` for listing
campaign events — those are used only for RSVP appointment creation (see
`ghl-forms-webhooks.md` §4).

### 2. Schema Key Is Hardcoded

```js
const EVENTS_SCHEMA_KEY = 'custom_objects.events'
```

This is the GHL custom object schema key for campaign events. Do not change
unless the object is recreated in GHL.

### 3. Event Data Lives in `record.properties`

GHL returns custom object records in this shape:

```js
{
  id: 'record_id',
  properties: {
    event_name: '...',
    event_date: 'YYYY-MM-DD',
    event_end_date: 'YYYY-MM-DD',
    select_time: '600_pm',         // slug-encoded time
    end_time: '800_pm',
    event_location: '...',
    event_description: '...',
    event_category: 'rally',       // slug-encoded category
    event_image: [{ url: '...' }], // array of media objects
  },
}
```

Always read from `record.properties` — never from the record root.

### 4. Time and Category Values Are Slugs — Map Them to Labels

GHL stores time and category as slugs (`600_pm`, `town_hall`). The client
expects human-readable labels (`6:00 PM`, `Town Hall`). Use the `TIME_LABELS`
and `CATEGORY_LABELS` maps in `ghl.js` for conversion. If a slug isn't in the
map, fall back to the raw value so new options don't break rendering.

### 5. Always Normalize Before Returning

Never return raw GHL records to API consumers. Pass every record through
`normalizeEvent()` so the shape stays stable even if GHL field names change.

### 6. Sort by Start Date Ascending

`fetchGHLEvents()` sorts chronologically (earliest first). Records with a
missing/unparseable `event_date` fall to the top (epoch 0) — treat that as a
signal the record is malformed in GHL.

---

## 1. Configuration (`src/lib/ghl.js`)

Same shared GHL config used by products and contacts:

```js
const GHL_BASE_URL = 'https://services.leadconnectorhq.com'
const GHL_API_KEY = process.env.GHL_API_KEY
const GHL_LOCATION_ID = process.env.GHL_LOCATION_ID

const headers = {
  Authorization: `Bearer ${GHL_API_KEY}`,
  Version: '2021-07-28',
  Accept: 'application/json',
}

const EVENTS_SCHEMA_KEY = 'custom_objects.events'
```

---

## 2. Slug → Label Maps

### `TIME_LABELS` — 30-minute increments, 6:00 AM through 9:00 PM

```js
const TIME_LABELS = {
  '600_am': '6:00 AM',  '630_am': '6:30 AM',
  '700_am': '7:00 AM',  '730_am': '7:30 AM',
  // ... every 30 min up to ...
  '900_pm': '9:00 PM',
}
```

**Slug format:** `{h}{mm}_{am|pm}` — hour is NOT zero-padded (`100_pm` not
`0100_pm`), minutes ARE zero-padded. Add new slots here if GHL introduces them.

### `CATEGORY_LABELS`

```js
const CATEGORY_LABELS = {
  rally: 'Rally',
  town_hall: 'Town Hall',
  fundraiser: 'Fundraiser',
  debate: 'Debate',
  press_conference: 'Press Conference',
  community_meetup: 'Community Meetup',
  volunteer_drive: 'Volunteer Drive',
  doortodoor_campaign: 'Door-to-Door Campaign',
  victory_celebration: 'Victory Celebration',
  protest__march: 'Protest / March',   // double underscore — GHL slugifies '/' this way
  other: 'Other',
}
```

Note `protest__march` has a **double underscore** — that's how GHL encodes the
slash in "Protest / March". Match GHL's slug exactly when adding categories.

---

## 3. Date Parsing — `parseDate(dateStr)`

GHL returns dates as `YYYY-MM-DD` strings. `parseDate` converts them to a
pre-split object the UI consumes directly:

```js
{
  month: 'Apr',     // 3-letter English abbreviation
  day: '12',        // zero-padded day
  year: '2026',
  raw: '2026-04-12',
}
```

**Rules:**

- Always parse with `new Date(dateStr + 'T00:00:00')` — the `T00:00:00` suffix
  avoids UTC/local timezone drift that would otherwise shift the day
- Return `null` for missing/invalid input — callers must handle null
- `raw` is retained so sorting can reuse it as a `Date()` input

---

## 4. Event Normalization — `normalizeEvent(record)`

Converts a raw GHL custom object record into the shape consumed by the UI:

```js
{
  id: string,                          // record.id
  title: string,                       // properties.event_name
  description: string,                 // properties.event_description
  date: {                              // parsed start date (never null — fallback object)
    month: string, day: string, year: string, raw: string,
  },
  endDate: { ... } | null,             // parsed end date, or null
  time: string,                        // mapped from select_time
  endTime: string,                     // mapped from end_time
  location: string,                    // properties.event_location
  address: string,                     // same as location (alias for form consumers)
  image: string,                       // first event_image url or '/placeholder-event.svg'
  type: string,                        // mapped from event_category
  source: 'ghl',                       // origin tag
}
```

**Rules:**

- `image` falls back to `/placeholder-event.svg` — ship a real placeholder in `public/`
- `type` falls back to the raw category slug if not in `CATEGORY_LABELS` — never return undefined
- `date` is always an object, never null — use `{ month: '', day: '', year: '', raw: '' }` as a safe default so the UI can render without a guard
- `endDate` MAY be null — UI must handle single-day events
- `location` and `address` are the same value — two aliases exist because some
  UI components read `location`, others (like RSVP) read `address`

---

## 5. `fetchGHLEvents()` — List All Events

```js
const fetchGHLEvents = async () => {
  const res = await fetch(
    `${GHL_BASE_URL}/objects/${EVENTS_SCHEMA_KEY}/records/search`,
    {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        locationId: GHL_LOCATION_ID,
        page: 1,
        pageLimit: 50,
        query: '',
        searchAfter: [],
      }),
      next: { revalidate: 60 },
    },
  )

  if (!res.ok) return []

  const data = await res.json()
  const records = data.records ?? []

  return records
    .map(normalizeEvent)
    .sort((a, b) => {
      const da = a.date.raw ? new Date(a.date.raw) : new Date(0)
      const db = b.date.raw ? new Date(b.date.raw) : new Date(0)
      return da - db
    })
}
```

**Rules:**

- **It's a `POST`, not a `GET`** — even though it's a "search" and no filters are
  applied. GHL's custom object search endpoint requires POST with a JSON body.
- `query: ''` + `searchAfter: []` returns all records unfiltered
- `pageLimit: 50` is enough for the campaign calendar. If events grow past 50,
  implement pagination by setting `searchAfter` from the last record's cursor
- `next: { revalidate: 60 }` — 60-second ISR cache, same as products
- Returns `[]` on non-2xx — never throws. Pages degrade gracefully to "no events"
- Sorting uses epoch 0 as the fallback so malformed dates surface at the top

---

## 6. `fetchGHLEvent(eventId)` — Single Event

```js
const fetchGHLEvent = async (eventId) => {
  const res = await fetch(
    `${GHL_BASE_URL}/objects/${EVENTS_SCHEMA_KEY}/records/${eventId}`,
    { headers, next: { revalidate: 60 } },
  )

  if (!res.ok) return null

  const data = await res.json()
  const record = data.record ?? data
  if (!record?.id && !record?.properties) return null

  return normalizeEvent(record)
}
```

**Rules:**

- Single-record fetch is a plain `GET` — different verb from the list endpoint
- Response shape varies: sometimes `{ record: {...} }`, sometimes the record is
  the root. Handle both with `data.record ?? data`
- Guard against empty/stub responses — require either `id` or `properties`
- Returns `null` (not `[]`) on failure — the page renders a 404

---

## 7. API Routes

### GET `/api/events` — All Events

`src/app/api/events/route.js`

```js
import { NextResponse } from 'next/server'
import { fetchGHLEvents } from '@/lib/ghl'

export const revalidate = 60

export const GET = async () => {
  try {
    const events = await fetchGHLEvents()
    return NextResponse.json({ events, total: events.length })
  } catch (error) {
    console.error('[Events API]:', error)
    return NextResponse.json({ events: [], total: 0 }, { status: 500 })
  }
}
```

### GET `/api/events/[id]` — Single Event

`src/app/api/events/[id]/route.js`

```js
import { NextResponse } from 'next/server'
import { fetchGHLEvent } from '@/lib/ghl'

export const revalidate = 60

export const GET = async (request, { params }) => {
  try {
    const { id } = await params
    const event = await fetchGHLEvent(id)
    return event
      ? NextResponse.json({ event })
      : NextResponse.json({ event: null }, { status: 404 })
  } catch (error) {
    console.error('[Event API]:', error)
    return NextResponse.json({ event: null }, { status: 500 })
  }
}
```

**Rules:**

- `export const revalidate = 60` on both routes mirrors the helper cache
- Error logs use the `[Events API]` / `[Event API]` prefix for easy filtering
- Response envelopes always include the expected key even on error (`events: []`
  or `event: null`) — consumers never need to null-check the envelope itself
- `params` is awaited — Next.js 15 App Router requirement

---

## 8. Relationship to RSVP Flow

Event RSVPs are a **separate system** documented in `ghl-forms-webhooks.md` §4:

- Listing/reading events = custom object records (this file)
- RSVP submission = webhook trigger + GHL **Calendar** appointment creation
  (calendar ID `UTM5EkrGwiZjQyc19WGN`)

These two systems do NOT share IDs. The custom object record ID is used in the
website URL (`/events/[id]`), while the RSVP appointment is written to a
different GHL calendar and linked to the contact — not the event record.

---

## 9. Adding a New Event Field (Checklist)

When a new property is added to the GHL events custom object:

1. **Add the field to the GHL schema** in the GHL UI (custom objects editor)
2. **Read it in `normalizeEvent()`** — pull from `record.properties.new_field`
3. **Add a fallback** — never let undefined leak into the normalized object
4. **If it's a slug field**, add a `{SLUG}_LABELS` map and map it the same way
   `TIME_LABELS` / `CATEGORY_LABELS` work
5. **Update the event type documentation** in §4 above
6. **Update consumer components** (`event-card`, `event-detail`, etc.) to render it

---

## 10. GHL Custom Object Endpoints Reference

| Action             | Method | Endpoint                                                    |
| ------------------ | ------ | ----------------------------------------------------------- |
| List/search events | POST   | `/objects/custom_objects.events/records/search`             |
| Get single event   | GET    | `/objects/custom_objects.events/records/{recordId}`         |

**Base URL:** `https://services.leadconnectorhq.com`
**Auth Header:** `Authorization: Bearer {GHL_API_KEY}`
**Version Header:** `Version: 2021-07-28`
**Location scoping:** `locationId` goes in the POST body for search — NOT as a
query param like the products endpoint.
