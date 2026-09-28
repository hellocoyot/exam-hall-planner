# Exam Hall Planner — Coyot AI demo

A browser-only demo that seats Higher Secondary (Plus One / Plus Two) students in exam halls so that **no two students writing the same subject paper sit beside, in front of, or behind each other**. It prints seating charts, door notices, attendance sheets and a master list.

Everything runs in the browser. No server, no login, and student data never leaves the computer.

## Run it

- **Online:** open the GitHub Pages link.
- **Locally:** double-click `index.html`. Uploading Excel/CSV needs internet once, to load the file-reader library.
- **Shortcut:** add `#demo` to the link (e.g. `…/index.html#demo`) to open with the demo plan already generated.

## File format

One row per student. The first sheet (or the CSV) needs these columns:

| Register No | Student Name | Class | Stream | Subject |
|---|---|---|---|---|
| 1501001 | Aparna T K | Plus One Science A | Science | Physics |

- **Register No** and **Subject** are required. Subject means the paper the student writes in *this* session.
- If your headings are different, the app asks which column is which.
- An Excel file may also include a **Halls** sheet (`Hall Name, Rows, Benches per Row, Students per Bench`). The halls load automatically.

Samples are in `sample-data/`: `exam-demo-data.xlsx` (240 students + 6 halls) and `students-demo.csv`.

## Demo script (on stage)

1. **Open the link.** Point to the rule card: same subject never beside, in front of, or behind. Halls follow the Kerala layout: two benches per row (A and B), two students per bench.
2. **Click "Sample Excel"** to download the file. Open it and show the teachers it's an ordinary class list with a Halls sheet.
3. **Drag the Excel file onto the upload box.** Point to the 240 students, 6 classes and the subject chips. Mention that Economics comes from both Commerce and Humanities and is treated as one paper.
4. **Show Step 2.** Change a hall's rows and watch the capacity bar update live. Delete two halls to show the "short by N seats" warning, then click "Use demo data" to restore them.
5. **Click "Generate seating plan".** Point to 240/240 seated and **0 same-subject neighbours**.
6. **Walk through the hall tabs.** Hover a seat to see the student's name, class and subject, and point out the colour plus the pattern and code on each seat.
7. **Type a register number** (e.g. `2503015`) in the search box. The app jumps to the hall and highlights the seat.
8. **Click "Reshuffle"** to get a new, still-valid plan for the next exam day.
9. **Print → Door notices**, then **Seating charts**, then **Attendance sheets** (print preview is enough).
10. **Click "Download Excel list"** and open it in Excel.
11. Finish with the footer: *student data never leaves this computer.*

## Hosting (GitHub Pages)

The app is static files only. Push to a public GitHub repo, then go to Settings → Pages → Deploy from branch → `main` / root. GitHub Pages serves it from a CDN, so hundreds of people can open it at once.

## Tests

```bash
node tests/engine.test.js
```

The tests check zero same-subject neighbours across 500 random inputs, shared subjects across streams, repeatable results, and that a capacity shortfall is reported.

## Known limits (it's a demo)

- A subject that is more than half of all students can't be fully separated. The app says so and leaves the extra students unseated rather than breaking the rule.
- Diagonal neighbours are avoided where possible but not guaranteed.
- No save/load of hall setups. Halls reset when the page reloads.
- Excel upload needs the SheetJS library from the CDN, so it needs internet once.
