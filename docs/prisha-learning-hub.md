# Prisha's Learning Hub (`/prisha/`)

A family practice page for Prisha (Sr. KG). Not part of the PrintSahaj site:
no nav/footer, not linked from any page, not in any sitemap.

| What | Where |
|---|---|
| Route | `web/src/app/prisha/` (layout = noindex meta + Baloo 2 font, `prisha.css`) |
| Screens | `web/src/components/prisha/` (home, runner, editor, progress, parent corner) |
| School worksheets | `web/src/lib/prisha/worksheets.ts` |
| Storage, answer check, backup | `web/src/lib/prisha/store.ts` |
| Search-engine header | `web/public/.htaccess` (`X-Robots-Tag` for `/prisha`) |

## Data lives in the browser

Custom worksheets, progress and stars are saved in that browser's
localStorage only. Nothing is uploaded and there is no backend. Clearing
browser data, a private window, or another device starts empty — use
**Parent corner → Download backup / Restore backup**.

## Worksheet transcription (09/10/2026)

Printed on the photo and copied as is: vowels अ इ ऊ ऐ अं, consonants
क ख ङ च ज ञ ठ ड ण, words क+म+ळ, त+ब+ला, स+का+ळ, उ+पा+शी, ऐ+र+ण, the
12-fruit word bank, 9 fruit and 12 animal pictures in order.

Worked out (check against the sheet the teacher marks):
- 13 vowel flowers fit the printed letters only with ऋ in the row:
  अ आ इ ई उ ऊ **ऋ** ए ऐ ओ औ अं अः.
- Fruit 6 read as **Peach**, fruit 8 as **Pear**, fruit 4 as **Watermelon** (slice).
- Animal 12 (curled horns) is **Sheep**; "Ram" is also accepted.
- Pictures are colour emoji of the same items, in the same order (the photo
  copies are grey and the photo shows the child's name, so it is not published).

## Voice answers (🎤 Say it · बोला)

`web/src/lib/prisha/speech.ts`. The browser's speech recogniser (Chrome,
Edge, Android Chrome, Safari; not Firefox) listens in Marathi (`mr-IN`) or
English (`en-IN`) per worksheet. The heard text is matched to the closest
answer on screen (कमल / कमळ / "Kamal" all match कमळ). If nothing is clearly
closest it asks her to say it again — a mishearing never counts as wrong. A
clearly said wrong option does count. The mic button is hidden where the
browser has no recogniser.

Chrome sends the audio to Google's speech service while the mic is on (the
browser asks for microphone permission the first time). Nothing is stored by
the hub. Single letters (अ/आ, इ/ई) are hard for any recogniser; when unsure it
asks again, and tapping still works.

## Privacy

`noindex, nofollow` meta tag plus an `X-Robots-Tag` header. Not in
`robots.txt` on purpose (a Disallow line advertises the path and hides the
noindex from crawlers). **noindex is not privacy**: anyone with the link can
open the page. For family-only access, password-protect the folder:

Hostinger hPanel → Websites → printsahaj.com → Advanced → **Password Protect
Directories** → folder `public_html/prisha` → set a username/password.

hPanel writes its own `.htaccess`/`.htpasswd` in that folder. The export has
no `prisha/.htaccess`, so website deploys never overwrite it.
