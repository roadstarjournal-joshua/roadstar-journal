# RoadStar Journal (live version)

roadstarjournal.com: news, reviews and opinion, the Ten Tenth's daily car game, and the writer's desk.

This version is connected for real. Nothing is stored in the visitor's browser and there is no Test version button.

| What | Where it lives |
| --- | --- |
| Stories, drafts, profiles, scores | Your Neon database, table `rs_docs` (created automatically on first visit) |
| Staff roles | Neon, table `rs_roles`; the owner is the account made admin in Neon |
| Sign-in | Neon Auth (Better Auth), through `/api/auth` on this site |
| Photos uploaded in the desk | Your public Vercel Blob store |

The first time the site runs on an empty database, it loads the 8 sample stories so the front page isn't blank. Delete them from the writer's desk once real stories are in; they don't come back.

## Before you upload (one time)

1. **Neon, Settings, Better Auth, Domains:** add `https://roadstarjournal.com`, `https://www.roadstarjournal.com` and your project's `.vercel.app` address. Sign-in is refused from any address not listed.
2. **Same page:** set Application Name to `RoadStar`, and turn on **Verify at Sign-up** with **Verification code**. Keep **Sign-up with Email** on until you've created your own account.
3. **Vercel, Storage:** make sure there's a **public** Blob store connected to this project. Without it, photo uploads show an error; everything else works.

## Upload

1. Unzip `roadstar-journal-live.zip`.
2. On github.com, open `roadstar-journal`, choose **Add file, Upload files**, drag in everything inside the unzipped folder, choose **Commit directly to the main branch** and click **Commit changes**. Vercel publishes it in a minute or two.
3. Delete the old test file: open `js/runtime-test.js` in GitHub, click the menu (three dots), **Delete file**, and commit. Nothing uses it any more.

## Check it's connected

Open **roadstarjournal.com/api/health**. You should see:

- `"database": { "provider": "Neon", "connected": true, ... "counts": { "posts": 8 ... } }`
- `"signIn": { "configured": true, "reachable": true }`
- `"photos": { "configured": true }`

If `signIn.configured` is false, Vercel hasn't picked up `NEON_AUTH_BASE_URL` yet: in Vercel open **Deployments**, then the menu on the latest one, then **Redeploy**.

## Become the owner

1. Go to **roadstarjournal.com/staff**, choose **Create your account**, and confirm your email with the code that's sent.
2. In the Neon Console open **Better Auth, Users**, click the menu next to your email and choose **Make admin**.
3. Back on the site, sign out and sign in again. You're the owner: the writer's desk opens, with a **Team** tab.
4. In Neon, **Settings, Better Auth**, turn off **Sign-up with Email**. From then on, only you add accounts, from **Writer's desk, Team, Add a staff account**.

(Alternative to step 2: add an environment variable `OWNER_EMAIL` with your email in Vercel, then redeploy.)

## Page addresses

Pages have real addresses: `/story/<slug>`, `/news`, `/reviews`, `/opinion`, `/features`, `/ten-tenths`, `/staff`, `/desk`. Old `#` links still work and move to the new address. `vercel.json` sends every address that isn't a file to the site.

## Folder

| Path | What it is |
| --- | --- |
| `index.html`, `css/`, `js/` | The site. `js/runtime-live.js` connects it to the server functions |
| `api/` | Server functions: `db` (stories and profiles), `auth` (sign-in), `me` (who's signed in), `team` (owner's staff access), `upload` (photos), `health` (connection check) |
| `api/_lib/` | Shared server code: database, sign-in checks, access rules, sample stories |
| `brand/`, `news/`, `photos/` | Logos, sample story photos, Ten Tenth's photos |
| `parked/meets/` | The Meets section, kept for later; not loaded |
| `package.json` | The two libraries Vercel installs: Neon's database driver and Vercel Blob |
| `vercel.json` | Page addresses, and `noindex` until launch |

Search engines are still told not to index the site (`noindex` in `index.html` and `vercel.json`). Remove both lines when real stories are in and you want Google to find the site.
