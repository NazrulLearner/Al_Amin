# Only if cards/borders look unstyled
Your existing tabs use shadcn-style class names (`border-border`, `bg-card`, `bg-muted`, `text-muted-foreground`, `bg-primary/10`, `text-foreground`).
If your tailwind.config.js does not define them, add (Tailwind v3) under `theme.extend.colors`:

```js
border: '#e2e8f0',
card: '#ffffff',
foreground: '#0f172a',
muted: { DEFAULT: '#f1f5f9', foreground: '#64748b' },
primary: { DEFAULT: '#065f46', foreground: '#ffffff' },
```
