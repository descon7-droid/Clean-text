# WordWasher — Brand Brief

This is the living brand reference for the project: naming rationale, positioning,
voice, and the visual system. Update it whenever brand-level decisions change —
it should always match what's actually shipped in `src/`.

## Name

**WordWasher.** A washer has one job: remove what shouldn't be there, and leave
everything else exactly as it was. That's the whole product thesis in one word —
no cleverness, no reinterpretation, just mechanical removal of things that don't
belong (invisible Unicode characters, stray formatting artefacts).

**Domain:** [wordwasher.com](https://wordwasher.com) — `wordwasher.net` is also owned
and 301-redirects to it (same product, one canonical URL).

## Positioning

WordWasher is a **text hygiene tool**, not a writing assistant and not an AI
product. It doesn't read, understand, rewrite, or improve your text — it scans
character-by-character against fixed tables of known invisible/formatting
artefacts and removes or normalizes exact matches. Same input, same output,
every time.

**Explicitly out of scope, by design, not oversight:**

- No AI, no LLM, no model of any kind touches the text
- Not marketed or built as a tool for altering authorship signals or
  circumventing AI-detection systems — this has been raised twice during
  development and declined both times, on principle, not just positioning
- No account, no backend, no uploads — everything runs client-side

The in-app disclaimer (footer, all pages) states this directly:

> WordWasher cleans formatting and invisible characters. It is not designed to
> alter authorship signals or circumvent AI-detection systems. As a side effect
> of removing invisible Unicode characters, some hidden markers embedded in
> copied text may also be removed.

## Voice

Exact, plain, a little dry. No hype language ("supercharge," "unlock," "AI-powered").
Describe what the tool mechanically does, not what it promises to make you feel.
Prefer concrete nouns (zero-width space, soft hyphen, bidi control) over vague
ones ("hidden issues," "problems").

## Hero line

**"Words washed. Nothing rewritten."**

Two clean, short sentences. The first names the product action; the second is
the guarantee that matters most — nothing about your actual words changes,
only the invisible cruft around them. Rendered as the whole headline in brand
lime (`#C6FF00` in dark mode; a darker high-contrast green in light mode — see
Color below), large, in Unbounded Bold, two lines.

Supporting line (under the hero): "Strips invisible characters and formatting
artefacts from anything you paste or drop — zero-width spaces, stray Unicode,
hidden markup. Your words stay exactly yours."

Primary CTA: **"Wash text now"** — sits directly below the paste window,
centred, large. This is the one real action button in the product (it both
scrolls nothing and does nothing decorative — it triggers the actual clean).

## Color

| Token | Hex | Use |
|---|---|---|
| Ink | `#101010` | Dark-mode canvas / light-mode text |
| Lime | `#C6FF00` | Brand accent — CTA, hero (dark mode), badges |
| Sage | `#9BE15D` | Secondary accent, success states |
| Paper | `#F4FFDC` | Light-mode canvas / dark-mode text |

Lime (`#C6FF00`) and the near-black canvas are the recognisable branding pair —
lead with them in any marketing surface. Lime is a fixed brand constant and
does **not** adapt between themes (`--color-lime` is the same hex in both). Where
lime would fail contrast against a light background (e.g. hero text in light
mode), use `accent-strong` instead — a darker green (`#3D6B21` light /
`#C3F2A0` dark) tuned to pass WCAG AA at the same visual "this is the accent"
role. This was verified with a relative-luminance contrast check, not eyeballed.

## Logo & icon

The mark is a single-color icon: a checkmark-in-a-circle with four small
sparkle/star accents, filled solid lime (`#C6FF00`). The checkmark itself is
**not** a separate layer — it's a negative-space cutout in the same path
(the circle and checkmark subpaths wind in opposite directions), so it always
shows whatever's behind it rather than needing a second color. That means it
adapts automatically to any background with zero extra styling — verified
against both dark and light canvases before shipping. Source is
`public/favicon.svg`; the same path is inlined directly in `Header.tsx`.

The full lockup (icon + wordmark + tagline, as a flattened brand asset) also
exists as a standalone SVG supplied by the client, useful for social profile
images or anywhere a single flattened graphic is more appropriate than live
HTML/CSS.

**Do not add a background badge/square behind the icon** — it's already a
complete, self-contained mark. The old checkmark-in-a-rounded-square badge
was a placeholder and has been fully replaced.

## Type

- **Unbounded** (display) — bold, condensed, used only for the hero headline
  and large section headings. Loaded via Google Fonts; falls back to system
  sans-serif if the font request is blocked (e.g. restrictive network
  policies) or hasn't loaded yet.
- **Manrope** (body) — all paragraph and UI copy.
- **Space Mono** (data / code) — code points, file names, the "OR PASTE TEXT"
  divider, terminal-window chrome, and the hidden-character reference cards.
- **Pacifico** (script) — the header wordmark ("WordWasher") only, matching
  the client-supplied logo lockup. Deliberately scoped to the logo mark, not
  the rest of the UI — see Visual language below for why.
- **Orbitron Bold** — used for the tagline within the flattened logo lockup
  artwork. Loaded and tokened (`--font-tech`) for future use but **not yet
  applied** anywhere in the live page; confirm placement before using it.

## Visual language

- **Dark by default, light available.** Every first-time visitor gets dark
  regardless of OS preference (not `prefers-color-scheme` — an unconditional
  default). A synchronous inline script in `index.html` sets it before first
  paint so there's no flash of the light theme. Both themes are still
  first-class — verified for WCAG contrast, not dark-mode-as-afterthought —
  and the toggle in the header persists an explicit choice to `localStorage`
  once someone makes one.
- **Script logotype, technical UI — deliberately two different voices.** The
  Pacifico wordmark in the header is warmer and more playful than the rest of
  the product. That's intentional and scoped: it's the *logo*, not a signal to
  soften the page. Headlines, buttons, and body copy stay on Unbounded/
  Manrope/Space Mono, which carry the "precise technical tool" register this
  brand is built on.
- **Terminal / utility chrome.** The paste panel is framed like a code editor
  window: traffic-light dots, a title bar showing the active file name
  (`wordwasher — no file` / `wordwasher — <filename>`). This reinforces "this is
  a tool, not a content product."
- **Hidden-character reference cards** are styled as literal code snippets —
  fixed white background (regardless of theme), monospace type, a
  syntax-highlight-style badge for the Unicode code point, and a copy button
  that copies the character's JS escape sequence (e.g. `\u200B`). They should
  look like something copy-pasted out of an editor, because functionally they are.
- No decorative illustration, no stock photography, no gradients-for-their-own-sake.
  If something doesn't communicate what the tool does or how it works, it
  doesn't belong on the page.

## What not to do

- Don't add AI/LLM processing of any kind, even opt-in — it breaks the "same
  input, same output, every time" guarantee that's the actual product.
- Don't reposition around AI-detection evasion, watermark removal, or
  "humanizing" text — declined twice already; it's a hard no, not a maybe.
- Don't soften the hero into marketing-speak. "Words washed. Nothing
  rewritten." should stay literal.
- Don't let visual polish add fake affordances — e.g. the hidden-character
  cards' copy buttons actually copy something (the escape sequence); nothing
  on the page should look interactive without being interactive.

## Naming note

Internal code identifiers (`cleanText()`, `CleanResult`, `cleanJson.ts`, etc.)
describe what the code does and are intentionally left unchanged regardless of
product branding — see the README's Project Structure section.
