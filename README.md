# Glyphora Icon Gallery

A responsive, English-language gallery for the [Glyphora](https://www.npmjs.com/package/glyphora-icon) React icon pack. Browse 6,870 original outline icons across 40+ categories, search by name or tag, filter by category, preview and customize size, color, and stroke weight, and copy a ready-to-paste React component tag or SVG markup with those settings applied. The page also shows how to install the pack with npm, bun, pnpm, or yarn, plus a usage example. Click any icon card to open an accessible preview modal; it is centered on larger screens and appears as a bottom sheet on mobile. Close it with the close button, Escape, or a tap outside the card.

The icon records are read directly from the published `glyphora-icon` package, so the site always matches the shipped data.

## Install the pack

```bash
npm install glyphora-icon
# or
bun add glyphora-icon
```

```jsx
import { ServerIcon } from 'glyphora-icon';

<ServerIcon size={48} strokeWidth={1.8} style={{ color: '#7657f6' }} />
```

Copying a React snippet from the gallery copies only the component tag (for example `<ServerIcon size={48} strokeWidth={1.8} style={{ color: '#7657f6' }} />`), not the import statement, because the component is already imported once per file.

## Development

```bash
bun install
bun dev
```

## Production build

```bash
bun run build
```

## Add or update an icon

The gallery has no icon data of its own. `src/icons.ts` imports `icons.json` from the published `glyphora-icon` package, which is the same file the React components are generated from. Each record includes a stable ID, display name, React component export name, category, description, searchable tags, and SVG path data.

To add or change an icon, edit `icons.json` in the [glyphora-icon](https://github.com/asmmbd/glyphora-icon) repository, run `bun run release`, and publish a new version. Then update this site with `bun update glyphora-icon` and rebuild. Because the gallery reads the published records directly, the site and the package can never drift apart. Each package icon accepts the standard SVG `strokeWidth` prop.
