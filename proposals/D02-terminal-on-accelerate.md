# D02: The terminal console on Accelerate

- **Kind:** design spec for the terminal surface of D01. No code in ACS.
- **Target:** the console in `rust/` on `rust-port` (P09), or a TypeScript one if the owner picks that (D01 decision 2). Nothing here depends on which.
- **Mockups:** `assets/D02-mockups-80x24.md`, `-80x24-cards.md`, `-120x36.md`, `-160x48.md`. They are printed by `node assets/D01-prototype/mockups.js 80x24` from the same renderer the prototype draws, and the script fails if any screen is not exactly the stated size. Screenshots: `assets/D01-tty-120x36-now.png`, `assets/D01-tty-160x48-config-16colour.png`.
- **Status:** proposed.

## 1. The adaptation in one paragraph

Accelerate is a monospaced, lowercase, rule-and-tick system on a near-black ground with one lime signal. Most of it maps to a terminal directly: Plex Mono is already a terminal face, rules are box lines, tags are bracketed codes, the rail is a column. What does not map is its type scale (Antonio display numerals, Newsreader titles) and its hairline drawing. The console keeps the system's structure and voice exactly, replaces display type with numerals built from light box arms, and spends the lime on one thing per screen, as the system does.

## 2. Colour roles, not colours

The renderer writes cells with a **role**; the role maps to a token in each tier. Code never names a colour.

| Role | Token (Void) | Truecolor | 256 | 16 | Used for |
|---|---|---|---|---|---|
| i1 | ink-100 | `#eeefe7` | 255 | bright white | titles, selected text, values |
| i2 | ink-200 | `#a9ada1` | 145 | white | body text |
| i3 | ink-300 | `#868b80` | 102 | bright black | labels, `#seq`, hints |
| ln | line-100 | `#2a2e27` | 236 | bright black | rules |
| l2 | line-200 | `#697163` | 242 | bright black | ticks, leaders |
| sg | signal-ink | `#d9ff6c` | 191 | bright green | small signal marks: `[ ok ]`, active eyebrow square |
| sf | signal fill | `#d9ff6c` bg, `#0c0d0c` fg | 191 / 233 | green bg, black fg | **the one primary action** |
| ht | heat | `#ff9654` | 209 | bright yellow | stuck, changes requested, no reader |
| dg | danger | `#ff6b81` | 204 | bright red | failed |
| st | steel | `#86b9dc` | 110 | bright cyan | submitted, in review |
| rv | reverse chip | ink-100 bg | 255 bg | reverse video | `run r-0412`, section labels |
| se | selected row | bg-200 | 234 | reverse video | the selected row |

Paper is the same table with Paper's tokens. Tier detection: `COLORTERM=truecolor|24bit` → truecolor; `TERM` containing `256color` → 256; otherwise 16; `NO_COLOR` set → no colour, selection by reverse video and the `▍` marker only. The 16-colour tier is shown in the prototype ("16 colour" button) and in `D01-tty-160x48-config-16colour.png`.

## 3. Lime budget

One `sf` fill per screen, on the primary action of the selected row: `a accept` on a review, `y answer` on a question, `A approve` on proposed memory, `A apply v15` when config is staged. When the card is open the fill moves into the card and the keys line goes plain. When the selected row has no primary action, nothing is filled. Small `sg` marks (status codes, the active lens square, the active rail entry) are allowed because Accelerate uses signal-ink the same way.

## 4. Layouts

| Size | Layout |
|---|---|
| below 80x24 | `[ !  ] needs 80x24, this is 72x20`, and the command to use instead. Never clipped content. |
| 80 to 99 cols | header, one tab row `1 now … 8 config`, one strip of answers (needs, stuck, spent, unknown cost), main pane, two-line footer. The card replaces the main pane. |
| 100 to 139 | rail of 24 columns: run chip, `operate` and `system` groups with dotted leaders to `[1]`…`[8]`, and the answers at the rail's foot. Main pane gets display numerals. |
| 140 and up | rail, main, and the card as a 38-column aside that follows the selection. |

The footer is always two lines: a status line (`[ -- ]` hint, `[ ok ] recorded as event #413`, `[ !  ] a reason is required…`) and the keys line. Unused rows stay blank.

## 5. Glyphs

- **Rules and ticks**: light box drawing. Panels get corner ticks only (Accelerate's registration marks), not full boxes.
- **Display numerals**: Accelerate's readouts are compressed Antonio numerals. The console builds them three cells wide and three rows tall from light box arms (`┌─┐ │ │ └─┘`), so they read as the same light, condensed figures. Only at 100 columns and up, only for the four readouts at the top of a lens.
- **Lens marks**: `■ ▤ ◇ § ▍ @ ¶ $`, as in the dashboard rail.
- **Status**: `●` working, `○` offline or idle, `▍` selected row marker.
- **ASCII fallback** (`LANG` without UTF-8, or `--ascii`): `- | + +`, numerals as plain bold digits, `* o > #`. The layout is identical.

## 6. Voice

Lowercase everywhere except ids the bus owns. `/` separates a path (`aos. / r-0412 / config`). Sections are numbered eyebrows (`■ 01 / needs you`). Titles end with the accent period (`how the system runs.`). Status codes are four-wide in brackets: `[ ok ]`, `[ -- ]`, `[ !  ]`. Numbers are two digits in readouts (`05`), money always shows the budget (`$5.20 of $60`), and unknown cost is `—` with a count, never `$0`.

## 7. Keys

| Key | Action |
|---|---|
| `1`–`8` | lens |
| `j` `k` / arrows | move |
| `Enter` / `Esc` | open card / back |
| `a` `r` `u` `g` `x` `y` | accept, request changes, requeue, assign, cancel, answer |
| `A` | approve memory, or apply staged config |
| `e` | supersede memory, or stage a config value |
| `R` | roll back config |
| `p` | pause run; on the agents lens, pause the agent |
| `t` | trace: timeline filtered to the selected row |
| `:` | command line, CLI grammar (D01 section 6) |
| `?` | keys |

A verb that needs a reason opens a one-line `why ▸` prompt in the footer; `Enter` commits, `Esc` cancels, an empty reason is refused with the message the core returns. The result is reported as `[ ok ] recorded as event #N`.

## 8. Motion and redraw

The console redraws only when the bus head `seq` changes or the terminal is resized, plus one timer for the next time-based change (a task crossing the stuck threshold, an agent crossing 15 minutes unseen). Idle CPU is zero between those. No spinners. The single moving thing allowed is the `live` code in the header, and only in the dashboard; the terminal shows `live #412` and the time of the last change.

## 9. Left out

Mouse support beyond what the terminal gives for free, split panes the user can resize, colour themes beyond Void and Paper, sparklines, and any glyph outside the ranges listed in section 5.
