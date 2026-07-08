# GHL Forms & Webhook Integration Rules

This rule file documents all form implementations across the campaign website,
including field definitions, validation, API routes, and GHL webhook payloads.
Reuse these patterns when adding new forms.

---

## Architecture Overview

All forms follow the same flow:

```
Client (React form)  →  Local API Route (/api/*)  →  GHL Webhook (POST)
                              ↓
                     Validate required fields
                     Build webhook payload
                     Forward to GHL webhook URL
                     Return success/error to client
```

- Forms are client components (`'use client'`) with local state
- Client-side validation runs before submission
- Server-side validation in the API route catches anything missed
- Data is forwarded to GHL via webhook trigger URLs (NOT the REST API)
- All webhooks use the same GHL location hook: `HK7KWJYbw33yisOBMGEO`
- Each form type has its own workflow trigger UUID

---

## CRITICAL RULES

### 1. Webhooks, Not REST API

Forms use **GHL webhook trigger URLs** — NOT the GHL REST API used by the shop.
The webhook base pattern is:

```
https://services.leadconnectorhq.com/hooks/HK7KWJYbw33yisOBMGEO/webhook-trigger/{workflow-uuid}
```

Each form type maps to a different `{workflow-uuid}` that triggers a specific
GHL workflow/automation.

### 2. SMS Consent Is Mandatory

Every form that collects phone numbers MUST include two A2P-compliant SMS consent
checkboxes with full legal text:

```jsx
// SMS Updates checkbox
"By checking this box, I consent to receive campaign updates from Dr Kahl for
Congress via automated text messages at the phone number provided. Message
frequency may vary. Message and data rates may apply. Text STOP to opt out
or HELP for help. View our Privacy Policy and Terms of Service."

// SMS Promotions checkbox
"By checking this box, I consent to receive promotional messages, event
invitations, and fundraising communications from Dr Kahl for Congress via
automated text messages. Message frequency may vary. Message and data rates
may apply. Text STOP to opt out or HELP for help."
```

Send consent as `'Yes'` or `'No'` strings in the payload — never booleans.

### 3. All Payloads Must Include These Base Fields

Every webhook payload MUST include:

```js
{
  type: 'Form_Type_Name',       // Identifies the form in GHL
  source: 'src_formname',       // Tag for CRM segmentation
  submitted_at: new Date().toISOString(),  // UTC timestamp
}
```

### 4. API Route Response Codes

| Code | When |
|------|------|
| 200  | Webhook accepted (GHL returned 2xx) |
| 400  | Required fields missing (client validation missed) |
| 502  | GHL webhook returned non-2xx (upstream failure) |
| 500  | Internal server error (catch block) |

### 5. FormField Component for Consistent Styling

All forms use the shared `FormField` component (`src/components/ui/form-field.jsx`)
for consistent label, input, and error message rendering. Use it instead of
building custom input markup.

---

## 1. Contact Form

### Files

| Purpose | Path |
|---------|------|
| Form UI | `src/components/contact/contact-form.jsx` |
| API Route | `src/app/api/contact/route.js` |
| Page | `src/app/contact/page.jsx` |

### GHL Webhook URL

```
https://services.leadconnectorhq.com/hooks/HK7KWJYbw33yisOBMGEO/webhook-trigger/cf2eced9-14ad-4109-ba4f-fd244858af10
```

### Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First Name | text input | Yes | |
| Last Name | text input | Yes | |
| Email | email input | Yes | |
| Phone | tel input | No | |
| Message | textarea (5 rows) | Yes | |
| SMS Updates | checkbox | No | A2P consent for campaign updates |
| SMS Promo | checkbox | No | A2P consent for promotions |

### Client-Side Validation

```js
// Required: firstName, lastName, email, message
// Email: must match /^[^\s@]+@[^\s@]+\.[^\s@]+$/
```

### Webhook Payload

```js
{
  type: 'Contact_Form',
  firstName: string,
  lastName: string,
  email: string,
  phone: string,              // empty string if not provided
  message: string,
  sms_updates: 'Yes' | 'No',
  sms_promo: 'Yes' | 'No',
  source: 'src_contact',
  submitted_at: '2026-04-12T10:30:00.000Z'  // ISO 8601 UTC
}
```

### API Route Validation

```js
// Server validates: firstName, lastName, email, message are non-empty after trim
// Returns 400 with { error: 'Missing required fields' } if any are empty
```

---

## 2. Volunteer Signup Form

### Files

| Purpose | Path |
|---------|------|
| Form UI | `src/components/volunteer/volunteer-signup.jsx` |
| API Route | `src/app/api/volunteer/route.js` |
| Page | `src/app/volunteer/page.jsx` |

### GHL Webhook URLs (3 Parallel Webhooks)

The volunteer form sends to **three** GHL webhooks simultaneously using
`Promise.all`. Each triggers a different GHL workflow:

```
1. https://services.leadconnectorhq.com/hooks/HK7KWJYbw33yisOBMGEO/webhook-trigger/23834100-4e00-4579-82e7-f9ec69ed8542
2. https://services.leadconnectorhq.com/hooks/HK7KWJYbw33yisOBMGEO/webhook-trigger/df947411-0c7e-4a6c-8c2e-7f20291c333f
3. https://services.leadconnectorhq.com/hooks/HK7KWJYbw33yisOBMGEO/webhook-trigger/19e7758c-f5c5-44fa-a770-5c18cefa0645
```

**All three receive the same payload.** The API route sends the payload to all
three in parallel and checks that at least one succeeds:

```js
const results = await Promise.all(
  webhookUrls.map((url) => fetch(url, { method: 'POST', ... }))
)
const anySuccess = results.some((r) => r.ok)
```

### Form Fields

| Field | Type | Required | Options / Notes |
|-------|------|----------|-----------------|
| First Name | text input | Yes | |
| Last Name | text input | Yes | |
| Email | email input | Yes | |
| Phone | tel input | No | |
| ZIP Code | text input | No | |
| County | select dropdown | No | 36 Oregon counties |
| Region | select dropdown | Yes | Portland Metro, Willamette Valley, Oregon Coast, Central Oregon, Eastern Oregon, Southern Oregon |
| Registered to Vote in Oregon? | select | Yes | Yes, No |
| Prior Campaign Experience? | select | Yes | None, Some Volunteering, Regular Volunteer, Campaign Staff, Campaign Management, Elected/Appointed Office |
| How Would You Like to Help? | checkboxes (multi-select) | Yes (at least 1) | Host a Fundraiser, Phone Banking, Volunteer Coordination, Digital/Social Media, Door Knocking, Host a Meet & Greet, Event Planning, Media |
| Availability | select | Yes | 1-2 hours/week, 3-5 hours/week, 5-10 hours/week, 10-20 hours/week, Full-time, Remote Help Only |
| What Issue(s) Matter Most? | textarea (3 rows) | Yes | |
| Anything Else to Share? | textarea (3 rows) | No | |
| SMS Updates | checkbox | No | A2P consent |
| SMS Promo | checkbox | No | A2P consent |

### Webhook Payload

```js
{
  type: 'Volunteer_Form',
  firstName: string,
  lastName: string,
  email: string,
  phone: string,
  zipCode: string,
  county: string,
  region: string,
  registeredVoter: string,         // 'Yes' or 'No'
  campaignExperience: string,      // e.g. 'Regular Volunteer'
  helpOptions: string,             // comma-separated: 'Phone Banking, Door Knocking, Media'
  availability: string,            // e.g. '3-5 hours/week'
  issues: string,                  // free text
  anythingElse: string,            // free text, may be empty
  sms_updates: 'Yes' | 'No',
  sms_promo: 'Yes' | 'No',
  source: 'src_volunteer',
  submitted_at: '2026-04-12T10:30:00.000Z'
}
```

**Note:** `helpOptions` is sent as a **comma-separated string**, not an array.
GHL webhooks handle flat strings better than nested arrays.

### API Route Validation

```js
// Server validates: firstName, lastName, email are non-empty after trim
// Returns 400 with { error: 'Missing required fields' } if any are empty
```

---

## 3. Issue Report Form

### Files

| Purpose | Path |
|---------|------|
| Form UI | `src/components/issues/issue-form.jsx` |
| API Route | `src/app/api/issues/route.js` |
| Page | `src/app/issues/page.jsx` |

### GHL Webhook URL

```
https://services.leadconnectorhq.com/hooks/HK7KWJYbw33yisOBMGEO/webhook-trigger/3c2d23be-00aa-49d5-9d14-6597d2e93123
```

### Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Full Name | text input | Yes | Split into firstName/lastName in payload |
| Email | email input | Yes | |
| Category | select dropdown | Yes | Values from `src/constants/issues.js` |
| Location | text input | No | Street address or neighborhood |
| Subject | text input | Yes | |
| Description | textarea (6 rows) | Yes | |

### Name Splitting Logic

The issue form collects a single "Full Name" field but splits it for GHL:

```js
const nameParts = name.trim().split(' ')
const firstName = nameParts[0]
const lastName = nameParts.slice(1).join(' ') || ''
```

### Webhook Payload

```js
{
  type: 'Issue_Report',
  firstName: string,              // first word of full name
  lastName: string,               // remaining words of full name
  email: string,
  issue_category: string,         // selected category value
  issue_location: string,         // address/neighborhood, may be empty
  issue_subject: string,
  issue_description: string,
  issue_image: '',                // empty string placeholder (no upload yet)
  source: 'src_issue',
  submitted_at: '2026-04-12T10:30:00.000Z'
}
```

### API Route Validation

```js
// Server validates: name, email, subject, description are non-empty after trim
// Returns 400 with { error: 'Missing required fields' } if any are empty
```

---

## 4. Event RSVP Form

### Files

| Purpose | Path |
|---------|------|
| Form UI | `src/components/events/event-detail.jsx` (RsvpForm component inside) |
| API Route | `src/app/api/events/rsvp/route.js` |
| Page | `src/app/events/[id]/page.jsx` |

### GHL Webhook URL

```
https://services.leadconnectorhq.com/hooks/HK7KWJYbw33yisOBMGEO/webhook-trigger/b8b53720-18c4-4cde-9db9-c549de6264ee
```

### Form Fields

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| First Name | text input | Yes | Placeholder: "Barbara" |
| Last Name | text input | Yes | Placeholder: "Kahl" |
| Email | email input | Yes | Placeholder: "you@email.com" |
| Contact Number | tel input | No | Placeholder: "(503) 555-1234" |

**Note:** The RSVP form does NOT have SMS consent checkboxes — it only collects
contact info to register for a specific event.

### Webhook Payload

```js
{
  type: 'Event_RSVP',
  firstName: string,
  lastName: string,
  email: string,
  phone: string,               // empty string if not provided
  eventName: string,           // from event data, not user input
  eventDate: string,           // from event data, not user input
  eventTime: string,           // from event data, not user input
  eventCategory: string,       // from event data, not user input
  source: 'src_event',
  submitted_at: '2026-04-12T10:30:00.000Z'
}
```

**Note:** `eventName`, `eventDate`, `eventTime`, and `eventCategory` are pulled
from the event object — NOT entered by the user. The form only collects personal
info; the event context is attached automatically in the submission handler.

### API Route — Extended Flow (Webhook + Contact Search + Appointment)

The RSVP API route does **more** than other form routes. After the webhook, it
also creates a GHL calendar appointment:

```
1. POST webhook payload to GHL webhook trigger URL
2. Wait 2 seconds (for GHL workflow to create/upsert the contact)
3. Search for contact by email using GHL REST API:
   GET /contacts/search/duplicate?locationId={locId}&email={email}
4. If contact found, create appointment in GHL calendar:
   POST /calendars/events/appointments
```

### GHL Appointment Creation

```js
{
  calendarId: 'UTM5EkrGwiZjQyc19WGN',   // hardcoded campaign calendar ID
  locationId: GHL_LOCATION_ID,
  contactId: contactId,                   // from contact search
  title: `RSVP: ${eventName}`,
  appointmentStatus: 'confirmed',
  startTime: ISO8601_datetime,            // event date + time combined
  endTime: ISO8601_datetime,              // startTime + 1 hour
  timezone: 'America/Los_Angeles',
  notes: 'RSVP submitted via campaign website'
}
```

**Calendar ID:** `UTM5EkrGwiZjQyc19WGN` — this is the campaign events calendar
in GHL. Do not change unless the calendar is recreated.

### API Route Validation

```js
// Server validates: firstName, email are non-empty after trim
// Returns 400 with { error: 'Missing required fields' } if either is empty
```

### Success Response

```js
{
  success: true,
  contactId: string | null    // null if contact search failed
}
```

---

## 5. Adding a New Form (Checklist)


When creating a new form that submits to GHL:

1. **Get the webhook URL** — Create a new workflow in GHL with a webhook trigger.
   Copy the full trigger URL.

2. **Create the form component** in `src/components/[feature]/[feature]-form.jsx`:
   - `'use client'` directive
   - Local state for form fields + errors + submitting + success
   - Client-side validation before submission
   - POST to local API route (never directly to GHL from client)
   - Success/error UI states
   - Include SMS consent checkboxes if collecting phone numbers

3. **Create the API route** in `src/app/api/[feature]/route.js`:
   - Validate required fields server-side
   - Build payload with `type`, `source`, and `submitted_at` base fields
   - POST to GHL webhook URL with `Content-Type: application/json`
   - Return appropriate status codes (200, 400, 502, 500)

4. **Payload rules**:
   - All field values must be strings (no booleans, no arrays)
   - Convert checkboxes to `'Yes'` / `'No'`
   - Convert multi-select arrays to comma-separated strings
   - Include `type` for GHL workflow routing
   - Include `source` tag for CRM segmentation (`src_formname`)
   - Include `submitted_at` ISO timestamp

5. **Never expose webhook URLs to the client** — they live only in API routes
   (server-side). The client POSTs to `/api/[feature]`, the server forwards
   to GHL.

---

## 6. GHL Webhook URLs Reference

| Form | Webhook UUID | Webhook Count |
|------|-------------|---------------|
| Contact | `cf2eced9-14ad-4109-ba4f-fd244858af10` | 1 |
| Volunteer | `23834100-...`, `df947411-...`, `19e7758c-...` | 3 (parallel) |
| Issue Report | `3c2d23be-00aa-49d5-9d14-6597d2e93123` | 1 |
| Event RSVP | `b8b53720-18c4-4cde-9db9-c549de6264ee` | 1 + appointment |

**Base URL pattern:**
```
https://services.leadconnectorhq.com/hooks/HK7KWJYbw33yisOBMGEO/webhook-trigger/{uuid}
```

---

## 7. Common Payload Fields Across All Forms

```js
// Always included in every webhook payload:
{
  type: string,              // 'Contact_Form', 'Volunteer_Form', 'Issue_Report', 'Event_RSVP'
  firstName: string,         // always split from name if needed
  lastName: string,
  email: string,
  source: string,            // 'src_contact', 'src_volunteer', 'src_issue', 'src_event'
  submitted_at: string,      // ISO 8601 UTC timestamp
}
```
