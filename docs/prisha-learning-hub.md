# Prisha's Learning Hub (`/prisha/`)

A family practice page for Prisha (Sr. KG). Not part of the PrintSahaj site:
no nav/footer, not linked from any page, not in any sitemap.

| What | Where |
|---|---|
| Route | `web/src/app/prisha/` (layout = noindex meta + Baloo 2 font, `prisha.css`) |
| Screens | `web/src/components/prisha/` (home, runner, editor, progress, parent corner) |
| School worksheets | `web/src/lib/prisha/worksheets.ts` |
| Exam practice (Sem 1, all 5 subjects) | `web/src/lib/prisha/exam-practice.ts` |
| Teacher's lists (30/10: fruits, animals, colours) | `web/src/lib/prisha/teacher-lists.ts`, `evs-write-learn.ts` |
| 📖 Learn flashcards | `web/src/components/prisha/Learn.tsx` |
| Storage, answer check, backup | `web/src/lib/prisha/store.ts` |
| Search-engine header | `web/public/.htaccess` (`X-Robots-Tag` for `/prisha`) |

## Data lives in the browser

Custom worksheets, progress, stars and Prisha's photo (Parent corner →
Prisha's photo; shown in the round frame on the home and result screens) are saved in that browser's
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

## Exam practice — first semester 2026-27

The school's "question paper pattern" sheets (Hindi, English, Marathi, EVS,
Maths; 50 marks each) list only question **types** and marks. Each subject
has one "Exam practice (Sem 1)" worksheet whose parts follow those types in
the printed order, one practice item per mark (50 questions per subject).
The items are our own Sr. KG-level practice, **not the actual paper**. On the
worksheet list, "One part at a time" chips (Q1, Q2 …) start a single part.

Choices made where a type cannot be done on screen as printed:
- "Match / join / circle" → tap the right one of 2–4 choices.
- EVS "Color the fruits" → "Which colour is a banana?" etc.
- EVS "Circle the vegetables": tomato counted as a vegetable (as in class).
- Maths "Write Table" → table of 2 (missing number in 2, 4, 6 …). If the
  teacher means a different table, change it in `exam-practice.ts`.
- Marathi Q10 "चार वर्ण वाले शब्द": अननस, सरबत, मखमल, करवत, हरभरा.
- EVS Q3/Q4/Q5 use the teacher's 30/10 lists: 12 animals (Pig, Goat, Sheep,
  Horse, Cow, Lion, Elephant, Zebra, Deer, Monkey, Giraffe, Tiger), 9 fruits
  (Strawberry, Mango, Apple, Papaya, Banana, Watermelon, Orange, Grapes,
  Pineapple) and 5 colours (Yellow, Blue, Red, Brown, Green). Papaya has no
  emoji, so it is a small SVG drawing in `teacher-lists.ts`.

## 📖 Learn

Each subject page has Learn / Practice / Test. Learn shows flashcards
(picture, word, its letters) with 🔊 Say it and 🔤 Spell it; nothing is
scored, and the last card leads into practice of the same questions.

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
