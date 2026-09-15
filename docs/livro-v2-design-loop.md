# Livro V2 - Design Loop

Reference: existing Aquarelada /livro/ page; user chose the brand's own site.
Output: /livro-v2/, a separate test variant. Original routes remain available.

## Visual Bar

1. Book title, real book media and Amazon action are visible in the first desktop/mobile viewport; the next section begins within reach.
2. Retain Baloo 2 headings, Nunito body, coral actions and blue/yellow/green illustration accents.
3. Use an unframed media opening; show the whole cover rather than cropping the product.
4. Headings have a restrained outline, with readable counters; body copy remains crisp on solid backgrounds.
5. Play illustrations move gently, without moving captions or changing layout dimensions; pause and reduced-motion are supported.
6. Videos have named keyboard-operable controls, posters and stable aspect ratios; pause off screen.
7. At 360, 390 and 1440 pixels, no text is clipped and the page has no horizontal overflow.

## Pieces

- Opening: expanded sequence and playback interaction.
- Cover and back: motion video made from the existing real photograph.
- Typography and play illustrations: outlines, subtle animation and responsive layout.

## Preflight

- Local reference rendered and captured in tmp/v2-reference-desktop.png.
- Existing source and optimized video: both 14.433 seconds, silent.
- Actual front/back photograph available. New cover video uses photo motion, not new filmed footage.
- FFmpeg, browser automation and image inspection available.
- Independent brief, system and craft critics will judge screenshots and rendered behavior.

## Reviews

| Piece | Brief | System | Craft | Rounds |
| --- | --- | --- | --- | --- |
| Opening video | PASS | PASS | PASS | 1 |
| Cover/back presentation | PASS | PASS | PASS | 1 |
| Typography and play illustrations | PASS | PASS | PASS | 3 |

- Craft round 1: reduce heading stroke and remove raised carousel card surfaces. Fixed.
- Craft round 2: floating purchase action obscured mobile bonus copy. Disabled the floating action in V2; opening and closing purchase links remain. Fixed.
- Craft round 3: mobile evidence at 390 and 360 pixels confirms readable text and separated controls. PASS.
- System and brief critics independently passed all three pieces across desktop/mobile.
- Critics inspected rendered screenshots only. Motion behavior is supported by browser observations rather than inferred from still images.

## Verification

- Playwright browser checks passed at 1440x900, 390x844 and 360x740.
- Opening duration: 22.433 seconds (4-second cover introduction, original 14.433-second reading clip, 4-second cover ending).
- Additional cover/back video: 12 seconds, animated from the supplied photograph.
- Video play/pause, offscreen pause, carousel navigation, illustration movement, animation pause and reduced-motion behavior passed.
- No missing images, horizontal page overflow, overflowing headings or browser page errors.
- Follow-up after the final overlay fix: no visible fixed overlays at 390 pixels; original obstruction absent in fresh 390/360 screenshots; opening/closing purchase links remain present.
- Verification script: tools/verify-livro-v2.cjs (pass bundled Node package directory as first argument).
- Evidence: tmp/livro-v2-review/results.json and screenshots. These local diagnostic artifacts are not published.
- Local preview: http://127.0.0.1:4177/livro-v2/
- V2 uses noindex while under comparison. No production push or ClickUp status/comment changes were made.
