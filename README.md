# Wedding Invitation

Static Soria-Lite wedding invitation page.

## Edit The Invitation

- Names, date, location, schedule, story, questions, and English/Korean copy live in `content.js`.
- The countdown date is `weddingDateTime` near the top of `content.js`.
- Hero, story, and gallery image paths live under `assets` near the top of `content.js`.
- Colors and typography live in `styles.css` under `:root`.
- Replace photos in `assets/` with your own files, or update the image paths in `content.js`.
- The Pictures section is generated from the `galleryImages` list in `content.js`.
- The page loads optimized web copies from `assets/optimized/`; original full-size photos remain in `assets/` and `assets/photos/`.
- To change the contact email, edit `email` near the top of `content.js`.

## Preview

Open `index.html` directly in a browser, or run:

```sh
python3 -m http.server 4173 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:4173/`.

If that port is already busy, change `4173` to another port such as `4174`.
