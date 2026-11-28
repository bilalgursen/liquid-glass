# Liquid Glass UI

**Docs:** https://liquidglass.onemorethink.dev · [Türkçe](https://liquidglass.onemorethink.dev/tr) · **For AI:** [llms.txt](https://liquidglass.onemorethink.dev/llms.txt)

Glass components for React, drawn in WebGL2, with behaviour from UI SDK. Each is named for the one thing it does: **press**, **merge**, **travel**, **flow**, **drag**, **hold**. Copy a file, get exactly what the demo shows. MIT.

## Install

```sh
npx shadcn@latest add https://liquidglass.onemorethink.dev/r/liquid-glass.json
```

or copy `src/components/liquid-glass/` into your project as `components/liquid-glass/`. Requirements: React 19, Tailwind CSS v4, an `@/` alias.

```tsx
import { GlassButton } from '@/components/liquid-glass'

<GlassButton>Get started</GlassButton>
<GlassButton material="tinted" className="bg-sky-500 text-white">Save</GlassButton>
<GlassButton asChild><Link href="/docs">Read the docs</Link></GlassButton>
```

## The set

One verb each. Nothing overlaps, so picking one takes a second.

| Verb | Component | What it does |
| --- | --- | --- |
| Press | `GlassButton` | Clear or tinted glass button that swells under the pointer. `asChild` puts it on your own `<Link>`. Needs `@ui-sdk/core` and `@ui-sdk/react`. |
| Merge | `GlassActionButton` | Async action button: its arrow is a separate droplet that melts into the body when pressed and stays merged through Deploying… → Deployed ✓. The kit's only gooey effect. |
| Travel | `GlassTabs` | Segmented control whose selection travels as a lens. Ships `GlassLens` for your own Radix Tabs. Needs `@ui-sdk/core` and `@ui-sdk/react`. |
| Flow | `GlassBadge` | One-word badge with its text flowing through the glass. |
| Drag | `GlassSlideToConfirm` | Slide-to-confirm track: drag the glass thumb to the end to run one deliberate action (Sending… → Sent ✓); let go early and it springs back. |
| Hold | `GlassCard` | A frosted glass card that holds your content while its rim bends what slides behind. `live` for moving backdrops. |
| Share | `GlassButtonGroup` | Related actions in one body of glass, side by side or stacked, with separators and text. The whole body swells under the pointer. |
| Open | `GlassDropdownMenu` | Menu of actions that swells out of its button, or out of a whole `GlassButtonGroup`, as one body of glass. Needs `@ui-sdk/core` and `@ui-sdk/react`. |
| Unfold | `GlassPopover` | Small surface its button unfolds into, right where the button is. Needs `@ui-sdk/core` and `@ui-sdk/react`. |
| Grow | `GlassMenu` | Menu its button grows into, on any side, with submenus, checkbox and radio items, groups and shortcuts. Needs `@ui-sdk/core` and `@ui-sdk/react`. |
| Slide | `RangeSlider` | Range slider whose glass pill opens into a wide lens that bends the track while it is held. Needs `three`, `@ui-sdk/core` and `@ui-sdk/react`. |
| Flip | `Switch` | On/off switch whose knob swells into clear glass as it crosses the track. Needs `three`, `@ui-sdk/core` and `@ui-sdk/react`. |
| Tick | `Checkbox` | Checkbox under a cap of clear glass, at rest too. Needs `three`, `@ui-sdk/core` and `@ui-sdk/react`. |
| Find | `GlassSearch` | Search field that looks in several layers at once: left empty, its layers bud off its end as droplets; typed in, it grows down into its results. Needs `@ui-sdk/core` and `@ui-sdk/react`. |
| Stretch | `GlassSelect` | Select whose list swells out of its button as one body of glass, on a neck that stretches and snaps. Ships `GlassPopup` for your own menu or popover. Needs `@ui-sdk/core` and `@ui-sdk/react`. |

No npm dependencies, except the components marked "Needs …". Every component has its own docs page with live examples, the exact demo source, "use it for / not for", props and an install command.

## AI assistants

Point your assistant at `llms.txt`, or install the skill:

```sh
npx skills add bilalgursen/liquid-glass
```

The skill (`skills/liquid-glass/`) tells agents which component to use, how to install it, and to copy files verbatim instead of re-implementing the glass.

## Develop

```sh
pnpm install
pnpm dev     # Vite dev server
pnpm build   # prerenders every page in English and Turkish, generates llms.txt, Markdown and the registry
```

See `AGENTS.md` for the repo layout and rules. Deploys to Cloudflare Pages (`.output/public`).

## License

MIT — see `LICENSE`.
