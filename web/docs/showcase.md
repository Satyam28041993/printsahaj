# Showcase media

Drop real screenshots or screen recordings here. Nothing else to build: add the
file, then flip its flag in `web/src/data/showcase.ts`
(`SHOWCASE_MEDIA.<slug> = { webp: true, mp4: true }`). Until a flag is set, the
site keeps showing its animated mock-up.

| Slug | Where it shows |
|---|---|
| `flexora` | Homepage showcase tab "Flexora ERP" |
| `website` | Showcase tab "Websites" and help tab "Website Building" |
| `crm` | Showcase tab "CRM Suite" and help tab "Customized CRM" |
| `erp` | Help tab "ERP" |
| `automation` | Help tab "Automation Tools" |
| `marketing` | Help tab "Marketing & Lead Generation" |
| `aivy` | Showcase tab "Aivy" |
| `printverify` | Showcase tab "PrintVerify" and the varnish-plate story |

## Files per slug

- `<slug>.webp` (or `<slug>.png`): **1024 × 525 px** (current screenshots; same ratio for new ones), a screenshot of the real screen. Poster for the video too.
- `<slug>.mp4`: optional screen recording, **10–15 s, under 3 MB**, no sound needed (it plays muted, looping).

Use demo or anonymised data only. No client names, phone numbers, rates or job numbers.

PrintVerify, Flexora and CRM use sharp demo screens in `public/showcase/hd/`
(wired from `SHOWCASE_COLLAGES` / `HELP_COLLAGES` and `content/productSlides.ts`).
Those files are full dummy UIs, not blurred client shots. Website and Aivy stay
on the 1024 × 525 crops above.
