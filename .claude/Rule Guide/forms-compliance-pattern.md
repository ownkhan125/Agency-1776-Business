# Forms Compliance Pattern

Applies to all forms that collect a phone number. On this project that is
the four core forms:

- **Contact** (`/contact`)
- **Volunteer** (`/volunteer`)
- **RSVP** (`/events/[id]`)
- **Ask [websitename]** (e.g. `/ask-jenny`)

This rule covers three coupled behaviors that always ship together for
these forms:

1. An additional compliance webhook fan-out
2. A canonical phone field format
3. Consent checkboxes whose enabled/required state is driven by the phone
   field

Keep all three in sync. If a form collects a phone number, it gets all
three — no exceptions.

---

## 1. Additional Compliance Webhook

Each of the four forms fans out its payload to **two** webhooks in
parallel from its API route:

1. The form's **primary workflow webhook** — drives the usual CRM
   workflow for that form (contact, volunteer, RSVP, or Ask intake).
2. The **compliance webhook** — a single URL shared across all four
   forms that drives the consent / subscription workflow.

### CRITICAL

- The compliance webhook URL is **identical across all four forms** on a
  single site. Store it alongside the primary URL in a `WEBHOOK_URLS`
  array at the top of each API route.
- Both webhooks receive **the same payload**. Do not strip fields for
  the compliance webhook — the compliance workflow decides what to read.
- Fan out with `Promise.all` and individual `.catch` on each fetch so a
  single webhook's failure does not block the other.
- The route returns `502` **only** when every webhook fails. A partial
  failure (primary up, compliance down, or vice versa) still returns
  `200` to the client.

### Pattern

```js
const WEBHOOK_URLS = [
  'https://services.leadconnectorhq.com/.../primary-webhook-trigger/...',
  'https://services.leadconnectorhq.com/.../compliance-webhook-trigger/...',
]

const results = await Promise.all(
  WEBHOOK_URLS.map((url) =>
    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('[X API] webhook error:', err)
      return { ok: false }
    })
  )
)

if (!results.some((r) => r.ok)) {
  return Response.json({ error: 'Webhook delivery failed' }, { status: 502 })
}
```

The Volunteer form fans out to more than two webhooks (its primary
workflow uses three parallel URLs). The compliance webhook is simply
appended to the array — the pattern is the same.

---

## 2. Phone Field

Every form in scope exposes an **optional** phone field.

### CRITICAL

1. **The field value is always formatted `+1 (xxx) xxx-xxxx`.** The
   `+1` must be visible in the input as soon as the user types any
   digit. The user does not type the `+1` themselves — we pre-set it.

2. **If the user types or pastes a `+1` / leading `1`, it is stripped.**
   We own the country code. `+1 (555) 555-0100`, `15555550100`, and
   `+15555550100` all normalize to the same value. We strip the user's
   `+1` and rely on our pre-set `+1`.

3. **The server always receives `+1 (xxx) xxx-xxxx`**, or an empty
   string if the user left the field blank. Server-side normalization
   is defensive — the client formatter is the primary mechanism, but
   the API route must re-normalize rather than trust the inbound
   string.

4. **The field stays optional.** `required` must not be set on the
   phone input, and API routes must not reject submissions that omit
   it.

### Implementation

Two helpers live in `src/lib/phone.js`:

```js
// Live client-side formatter — bind to the phone input's onChange
formatPhoneInput('5555550100')        → '+1 (555) 555-0100'
formatPhoneInput('15555550100')       → '+1 (555) 555-0100'
formatPhoneInput('+1 (555) 555-0100') → '+1 (555) 555-0100'
formatPhoneInput('+15555550100')      → '+1 (555) 555-0100'
formatPhoneInput('555')               → '+1 (555'          // partial
formatPhoneInput('+1')                → ''                 // strips
formatPhoneInput('')                  → ''

// Server-side canonical producer — use in API route payloads
normalizePhoneForSubmit('5555550100')        → '+1 (555) 555-0100'
normalizePhoneForSubmit('+1 (555) 555-0100') → '+1 (555) 555-0100'
normalizePhoneForSubmit('555555')            → ''   // partial → empty
normalizePhoneForSubmit('')                  → ''
```

**Wiring in the form:**

```jsx
import { formatPhoneInput } from '@/lib/phone'

<input
  type="tel"
  value={formData.phone}
  onChange={(e) => {
    setFormData((prev) => ({ ...prev, phone: formatPhoneInput(e.target.value) }))
    setError('')
  }}
  placeholder="+1 (503) 555-0123"
/>
```

**Wiring in the API route:**

```js
import { normalizePhoneForSubmit } from '@/lib/phone'

const payload = {
  // ...
  phone: normalizePhoneForSubmit(phone),
  // ...
}
```

### Rules

- Never render a separate `+1` label/prefix element outside the input.
  The `+1` is part of the input value itself so copy/paste of the
  whole field yields a complete phone number.
- Never set a raw fallback on the payload
  (`phone: phone?.trim() || ''`). Always route through
  `normalizePhoneForSubmit`.
- The placeholder must show the full format: `+1 (xxx) xxx-xxxx`.
- Partial entries (fewer than 10 digits after the country code)
  normalize to empty string on the server side.

---

## 3. Consent Checkboxes

Every form in scope renders one or more consent checkboxes. The exact
**number of checkboxes and their copy are site-specific** — do not
hardcode assumptions about which regime they satisfy. This rule
governs only the enable / required / reset mechanics.

### CRITICAL

1. **Checkboxes are disabled when the phone field is empty.**
   Use `disabled={!hasPhone}` on every consent checkbox.

2. **Checkboxes are required when the phone field has a value.**
   Use `required={hasPhone}`. The browser's built-in form validation
   will block submit until the user either ticks the boxes or clears
   the phone field.

3. **Checkboxes auto-clear when the user empties the phone.**
   A user who checks the boxes with a phone entered and then deletes
   the phone must not ship stale consent state. Use a `useEffect` on
   `hasPhone` to reset every consent flag to `false` whenever
   `hasPhone` flips from true to false.

4. **Style the disabled state** so users understand why the boxes
   cannot be interacted with: dim the label text, switch the cursor
   to `not-allowed`, and show a one-line helper above the group —
   `"Enter a phone number above to opt in to SMS messages."`

### Pattern

```jsx
'use client'

import { useEffect, useState } from 'react'

// ...

const [formData, setFormData] = useState({
  phone: '',
  smsConsent: false,
  promoConsent: false,
  // ...
})

const hasPhone = formData.phone.trim().length > 0

useEffect(() => {
  if (!hasPhone) {
    setFormData((prev) => ({ ...prev, smsConsent: false, promoConsent: false }))
  }
}, [hasPhone])

// ...

{!hasPhone && (
  <p className="text-xs italic text-warm-400">
    Enter a phone number above to opt in to SMS messages.
  </p>
)}

<label className={hasPhone ? 'cursor-pointer' : 'cursor-not-allowed'}>
  <input
    type="checkbox"
    checked={formData.smsConsent}
    onChange={handleChange('smsConsent')}
    disabled={!hasPhone}
    required={hasPhone}
    className="accent-patriot-red disabled:opacity-40 disabled:cursor-not-allowed"
  />
  <span className={hasPhone ? 'text-warm-400' : 'text-warm-400/50'}>
    {/* consent copy — specific to this site, do not hardcode assumptions */}
  </span>
</label>
```

### What the payload looks like

The consent flags travel as `'Yes'` / `'No'` strings (per
`ghl-forms-webhooks.md` CRITICAL rule 2):

```js
const payload = {
  // ...
  phone: normalizePhoneForSubmit(phone),
  sms_updates: smsConsent ? 'Yes' : 'No',
  sms_promo: promoConsent ? 'Yes' : 'No',
  // ...
}
```

When `phone` normalizes to empty, both consent flags are `'No'` (the
client auto-clears them on phone delete, so this is guaranteed).

---

## 4. Adding the Pattern to a New Form (Checklist)

When bringing a new form under this pattern — or adding phone collection
to an existing form — verify all of the following:

1. [ ] Phone input uses `formatPhoneInput` in its `onChange` and has
       the `+1 (xxx) xxx-xxxx` placeholder.
2. [ ] Form state includes a `phone` string and one boolean per consent
       checkbox.
3. [ ] `hasPhone` derived from `formData.phone.trim().length > 0`.
4. [ ] `useEffect` resets every consent flag to `false` whenever
       `hasPhone` is false.
5. [ ] Each consent checkbox has `disabled={!hasPhone}` and
       `required={hasPhone}`; label styles react to `hasPhone`; the
       helper line appears while `!hasPhone`.
6. [ ] API route's `WEBHOOK_URLS` array includes both the form's
       primary webhook and the shared compliance webhook.
7. [ ] API route uses `Promise.all` fan-out with per-URL `.catch`;
       returns `502` only if `!results.some((r) => r.ok)`.
8. [ ] API route payload runs `phone` through
       `normalizePhoneForSubmit`.

---

## 5. Non-goals

- **This rule does not name the compliance regime** the checkboxes
  satisfy. The exact checkbox copy, count, and legal disclosures are
  site-specific and live in each site's form-specific rules (e.g.
  `ghl-forms-webhooks.md`). This rule stays at the mechanic layer.
- **This rule does not cover forms without a phone field** — newsletter
  signup, donation, petition, etc. follow their own flow unless they
  also collect phone, in which case this pattern applies.
