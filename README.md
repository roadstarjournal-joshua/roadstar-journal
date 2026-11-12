# RoadStar Journal

The roadstarjournal.com website: news, reviews and opinion, the Ten Tenth's daily car game, and the writer's desk.

## Stage: preview

This version runs on a stand-in data layer, `js/runtime-test.js`, that saves everything in each visitor's own browser. Use it to check the site on Vercel before the live database is connected.

- Stories, drafts and scores are visible only on the device that made them.
- The **Test version** button (bottom left) switches between reader, writer, editor and owner.
- Search engines are told not to index it (`noindex` in `index.html` and `vercel.json`).

Keep it on its `.vercel.app` address. Point roadstarjournal.com at it only after the live stage below.

## What's in the folder

| Path | What it is |
| --- | --- |
| `index.html` | The page |
| `css/site.css` | All styles |
| `js/data.js` | Ten Tenth's car data and the news photo library |
| `js/game.js` | Ten Tenth's |
| `js/site.js` | The news site, page routing and the writer's desk |
| `js/runtime-test.js` | Stand-in data layer for the preview stage |
| `brand/` | RoadStar logos (use the SVG on screen) |
| `news/`, `photos/` | Story photos and game photos; credits live in the site data |
| `parked/meets/` | The Meets section, kept for later; the site doesn't load it |
| `vercel.json` | Vercel settings |

## Put it on GitHub

**GitHub Desktop**

1. Unzip `roadstar-journal.zip`.
2. File, Add Local Repository, choose the `roadstar-journal` folder.
3. When it says the folder isn't a repository yet, choose **create a repository**, keep the name `roadstar-journal`, and click Create Repository.
4. Click **Publish repository**, leave **Keep this code private** ticked, and publish.

**GitHub website**

1. On github.com, create a new **private** repository named `roadstar-journal`, without a README.
2. On the empty repository page, click **uploading an existing file**.
3. Drag in everything *inside* the `roadstar-journal` folder (not the folder itself), then click **Commit changes**.

## Deploy on Vercel

1. In Vercel, choose Add New, Project, and import `roadstar-journal`.
2. Framework Preset: **Other**. Leave the build command and output directory empty.
3. Click Deploy. Every later push to `main` redeploys; every other branch gets a preview link.

## Next stage: live data

`js/runtime-live.js` will replace `js/runtime-test.js`: server functions in an `api/` folder, the Neon database, Neon Auth for staff login and Vercel Blob for photo uploads. The rest of the site doesn't change, because it reads and saves data only through `window.claude.use('db' | 'user' | 'assets')`.

At launch, remove the two `noindex` lines (in `index.html` and `vercel.json`). See the RoadStar Journal launch guide, walkthrough 1.
