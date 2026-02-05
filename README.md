# Dive Logs Web

This is a dive log viewer and analyzer website.

## Demo

Real demo can be found at https://divelogs.me.

## Tech

- React
- TypeScript
- Vite
- Tailwind CSS
- Recharts
- Zustand

## URL Parameters

| Parameter | Values | Description |
|-----------|--------|-------------|
| `layout` | `mobile` / `desktop` | Force mobile or desktop layout |
| `diveNumber` | Number (e.g., `25`) | Auto-select a specific dive |
| `diver` | Diver name | Filter by diver (case-insensitive) |

Examples:
- `/?layout=desktop` - Force desktop layout on mobile
- `/?diveNumber=25` - Open dive #25
- `/?diver=Yiqu` - Show only Yiqu's dives

## Quick Start

```bash
npm install
npm run dev
```

## License

MIT
