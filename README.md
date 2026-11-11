# API Trainer
Learn APIs and HTTP by doing. Plain HTML/CSS/JS, no build step, no dependencies.

- **Primer**: 2-minute interactive intro.
- **Journey**: 16 star-rated missions (1 easy, 5 hard) on real public APIs, in 3 modes (Beginner coach / Refresher / Practice) plus a Debug Lab of broken requests.
- **Academy**: 8 classroom-style lessons with examples, use cases and knowledge checks.
- **Playground**: generate a whole API system (or invent your own), build a tiny app on it, watch requests fly to the server and the database change, take on 11 quests, and turn on chaos (API key lock, slow, flaky, rate limit).

## Run locally
Open `index.html`, or `npx serve .`

## Deploy (Vercel)
Push to Git, import the repo. Framework Preset: **Other**. No build command, no output directory.

## Files
    index.html   layout          levels.js / debug.js   missions and Debug Lab
    app.js       request builder coach.js             coach, story, journey map, tour
    features.js  XP, badges      ux.js                tooltips, token wallet
    academy.js   lessons         sandbox.js           mock server + Playground
    extras.js    status codes, recaps, primer          style.css  dark UI

## Add content
- Mission: add an object to `levels.js` (or `debug.js`), plus a `NEED` entry and `KAI` line in `coach.js`.
- Lesson: add an object to `LESSONS` in `academy.js`.
- Playground system: add an entry to `SB_SYS` in `sandbox.js`.
# ProteronTrainer
