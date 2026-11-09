# Greece Geography Quiz

Find Greek prefectures (55) or municipalities (326) on an interactive map, in English or Greek.

- Skip a region with **Next** and it comes back after all the others. Once only skipped regions are left, **Next** moves between them and **Give up** ends the quiz.
- The score starts at 100 and loses points for errors, skips and, when giving up, regions left unfound. The final score maps to a rank.
- Playable by keyboard: Tab to the map, arrow keys to move between regions, Enter to select.

## Development

Requires Node.js 20.9 or later.

```bash
npm install
npm run dev         # http://localhost:3000
npm run test:run    # unit tests
npm run lint
npm run build
```

## Map data

The app loads `public/data/prefectures.geojson` and `public/data/municipalities.geojson`. These are generated from the source files in `data/raw/`:

```bash
npm run data:build
```

The build script gives every region an id and clean display names in both languages (corrections are in `scripts/regionNames.mjs`), simplifies the prefecture outlines, and rounds coordinates to about 10 m.

### Sources and licensing

- `data/raw/nomoi_okxe.geojson`: Greek prefectures (pre-2011 nomoi), with ESYE codes.
- `data/raw/dimoi.json`: Greek municipalities from [GADM](https://gadm.org). GADM data is free for academic and other non-commercial use, and may not be redistributed or used commercially without permission. Check the [GADM license](https://gadm.org/license.html) before deploying this app publicly or commercially.
