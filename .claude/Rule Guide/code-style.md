---
description: Code style guidelines for the project — JS, JSX, Tailwind, Next.js App Router, shadcn/ui
globs: "*.js,*.jsx"
---

# Code Style Rules

## Stack

- Framework: Next.js (App Router)
- Language: JavaScript (JSX)
- Styling: Tailwind CSS only
- Component Library: shadcn/ui

## JavaScript Rules

- Use ES6+ syntax always
- `const` over `let` — never use `var`
- No unused variables or imports
- Always use optional chaining `?.` over manual null checks
- Prefer early returns over deeply nested if/else
- Example: `const name = user?.profile?.name ?? 'Guest'`

## Naming Conventions

- Components: PascalCase (`UserCard`, `AuthModal`)
- Functions: camelCase (`getUserData()`)
- Variables: camelCase (`isLoading`, `hasError`)
- Constants: UPPER_SNAKE_CASE (`MAX_RETRY_COUNT`)
- Files (components): kebab-case (`user-card.jsx`)
- Files (utils): kebab-case (`format-date.js`)
- Folders: kebab-case (`user-profile/`)

## File & Folder Structure

```
src/
├── app/               # Next.js App Router pages
├── components/
│   ├── ui/            # shadcn/ui base components (do not edit)
│   └── [feature]/     # custom components
├── lib/               # utility functions
├── hooks/             # custom React hooks
└── constants/         # app-wide constants
```

## Components

- One component per file, always
- Functional components only — no class components
- Use PropTypes for prop validation
- Export the component as default at the bottom

```jsx
import PropTypes from 'prop-types'

const FeatureCard = ({ title, description }) => {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="font-semibold">{title}</h3>
      {description && <p className="text-muted-foreground">{description}</p>}
    </div>
  )
}

FeatureCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
}

FeatureCard.defaultProps = {
  description: '',
}

export default FeatureCard
```

## Styling Rules

- Tailwind CSS only — no inline styles, no CSS files (except globals.css)
- Use shadcn/ui components before building anything custom
- Use CSS variables for colors — never hardcode hex values
- Responsive design: mobile-first (`sm:`, `md:`, `lg:`)
- Use `cn()` utility for conditional class merging

## Imports Order

Always follow this order with a blank line between each group:

1. React / Next.js
2. External libraries
3. shadcn/ui components
4. Internal components
5. Hooks, utils, constants

## Next.js Specific

- Use App Router only — no Pages Router
- Prefer Server Components by default
- Add `'use client'` only when needed (event handlers, hooks, browser APIs)
- Use `loading.jsx` and `error.jsx` for every route segment
- Use Next.js `<Image />` instead of `<img>` always
- Use Next.js `<Link />` instead of `<a>` for internal links

## Error Handling

- Always wrap async calls in `try/catch`
- Never swallow errors silently
- Show user-facing errors via shadcn/ui toast or inline messages
- Log errors with context: `console.error('[ComponentName]:', error)`

## Comments

- No obvious comments
- DO comment complex business logic
- Use JSDoc for exported utility functions

## General Rules

- Max line length: 100 characters
- Always use double quotes `"` for JSX attributes
- Always use single quotes `'` for JS strings
- No semicolons (let Prettier handle it)
- No `console.log` in production code — use `console.error` for errors only
