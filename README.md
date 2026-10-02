# FamilyTreeApp

**Turn your family list into one tree everyone can open, laid out generation by generation, that only your admin can change.**

For the person in a big family who keeps "the list", and wants relatives to look it up themselves instead of asking in the group chat.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Backend-Google%20Apps%20Script-4285F4?logo=googleappsscript&logoColor=white)
[![License: Apache-2.0](https://img.shields.io/badge/license-Apache--2.0-blue.svg)](LICENSE)

![Illustration. A family group chat asks "Who was Grandpa Sam's dad again?", "Ask Aunt Nora, she has the list", "It's in the spreadsheet. Tab 3, or 4?". The chat slides away and a tree builds row by row: Gen 1 Arthur and Rose, Gen 2 Nora, Sam and Dina, Gen 3 Owen, Maya and Theo, Gen 4 Ivy and Jack, with pink lines joining couples. Two labels land: "Everyone can browse" and "Only the admin edits, with a password"](docs/hero.gif)

## The problem

Dina's family has four living generations and one person, Aunt Nora, who knows how everyone is connected. Nora's knowledge lives in a spreadsheet with a tab per branch, a few photos of a hand-drawn chart, and years of group-chat messages.

- **Every gathering starts with the same questions.** "Whose son is Theo?" "Is Owen Maya's brother or cousin?" Someone scrolls back through the chat, or asks Nora again.
- **A spreadsheet is not a tree.** Parents are typed as text ("Sam/Dina", "same as Ivy"), so you cannot see the shape of the family at a glance.
- **Big families stop fitting.** Once there are four generations and several branches, a paper chart or a single image becomes unreadable.
- **Everyone wants to look, few should edit.** Share the sheet with edit rights and someone overwrites a row. Lock it and Nora is the only one who can answer questions.

## Who it is for

**Good fit if you...**

- keep a family list (in a spreadsheet, a notebook or your head) and want it on one link the whole family can open
- have several generations, couples where both sides matter, or people with more than one spouse
- want one or two trusted people to edit, and everyone else to only look
- are happy to use a Google Sheet as the database and deploy a small web app (the [setup guide](docs/setup.md) walks through it)

**Not for you if...**

- you need the tree **private behind a login**. Viewing needs no account: anyone with the link can see the members. Only edits are password-checked.
- you want genealogy research features: sources, GEDCOM import or export, DNA matching, record search
- you need zoom controls, search or a mobile-first layout. The tree scrolls (pan) inside a fixed desktop layout, and there is no zoom or search yet.
- you want per-person accounts or an edit history. There is one shared admin password, checked by your Apps Script.

## Before and after

| Before | After |
| :--- | :--- |
| Parents written as text in a sheet: "Sam/Dina", "same as Ivy" | Each person links to a father and mother picked from the tree |
| One tab per branch, nobody sure which is current | One sheet, one tree, every branch in its own generation row |
| "Ask Nora" for every relationship question | Anyone opens the link, scrolls, and clicks a person to see their parents and spouse |
| Couples and second marriages hard to show | Couples sit side by side with a pink marriage line; several spouses per person are supported |
| Whoever has edit rights can break it | Saving a change needs the admin password; viewers cannot save |

![Before: illustration of a family spreadsheet with parents typed as text ("Arthur?", "same as Ivy", "ask Nora"), tabs named Hale, Price, Lane, old list, old list (2), and chat bubbles asking which tab has Grandma Dina's side. A lime bar wipes across to After: a real screenshot of this app with the fictional sample family, four generation rows from Arthur and Rose down to Ivy and Jack, next to three notes: 4 generations one row each, one link anyone can open, saving needs the admin password](docs/before-after.gif)

## How it works

1. **Google Sheet.** One row per person: name, gender, birth date, father, mother, spouses.
2. **Apps Script web app.** A `GET` returns everyone as JSON. A `POST` adds, edits or deletes a row, and your script checks the admin password first.
3. **Layout engine** (`src/components/FamilyTree/Tree.jsx`, in the browser). A person's generation is how many parents up the longest line goes. Each generation is one row. Couples are grouped side by side, found both from the `spouses` field and from shared children, and a person with several spouses is placed in the middle of them. Then it draws pink dashed marriage lines and grey parent-to-child lines.
4. **Your family.** Everyone browses the tree and the member list. The admin adds, edits or deletes people through a form, with the password. After a save the tree reloads from the sheet.

![Illustration. Four cards draw in with arrows between them: 1 Google Sheet, one row per person; 2 Apps Script web app, GET returns everyone as JSON, POST adds, edits or deletes a row if the password is right; 3 Layout engine, generation equals how many parents up, couples side by side, lines drawn; 4 Your family, VIEW everyone browses, EDIT admin only. A dot travels along the arrows, then a return arrow from 4 to 2 is labelled "Admin saves: POST {action, password, data}. Your Apps Script checks the password, writes the sheet, and the tree reloads."](docs/how-it-works.gif)

The layout is custom. The app first used the `react-family-tree` library, which could not handle disconnected family groups or the multi-spouse "marriage bus" lines this family needed, so it was replaced with its own engine. The commit history shows that rewrite as several rounds of real debugging, not a clean first pass.

## See it run

Both recordings are the real app from this repo, running locally in its sample mode with a fictional family. No real family data is shown.

**Browse:** the tree loads, the view pans down one generation at a time and sideways, then a click on Maya opens her record with her parents and spouse.

![Real recording of the app in sample mode: the tree of the fictional Hale, Price and Lane families scrolls down from Arthur and Rose to Ivy and Jack, pans sideways and back, then a click on Maya Hale opens the Edit Member form showing Father Sam Hale, Mother Dina Price, spouse Theo Lane selected, birth date 16-05-1993 and an empty admin password field](docs/demo-browse.gif)

**Admin:** add a new member with a wrong password, then the right one.

![Real recording of the app in sample mode: Add Member, the admin types Ada Lane, Female, Father Theo Lane, Mother Maya Hale, birth date 08-01-2024 and the password "guess". Save is refused with "Error: Wrong password (sample mode uses "demo")" and the form stays open. With the password "demo" the save succeeds, the tree reloads with 14 members, and Ada Lane appears in the fourth generation next to Ivy and Jack](docs/demo-admin.gif)

## Quick start

Try it on your machine with the fictional sample family, no Google account needed. You need Node.js 20.19+ or 22.12+.

```bash
git clone https://github.com/BrianArfi/FamilyTreeApp
cd FamilyTreeApp
npm ci
VITE_SAMPLE_DATA=true npm run dev
```

Open the URL Vite prints (usually <http://localhost:5173>). Scroll the tree, click a person, or press **Add Member**. The admin password in sample mode is `demo`. Edits stay in memory until you reload. Sample mode fetches nothing and is off unless you set the variable. On Windows PowerShell, run `$env:VITE_SAMPLE_DATA="true"; npm run dev` instead.

Other scripts:

```bash
npm run build      # production build into dist/
npm run preview    # preview the production build locally
npm run lint       # eslint
```

## Example

Ada is born to Maya and Theo. The admin presses **Add Member** and fills in:

| Field | Value |
| :--- | :--- |
| Name | Ada Lane |
| Gender | Female |
| Father | Theo Lane (the list only shows men) |
| Mother | Maya Hale (the list only shows women) |
| Birth date | 08-01-2024 |
| Admin password | the one set in your Apps Script |

On save, the app sends `{"action": "ADD", "password": "...", "data": {...}}` to your Apps Script. If it answers `success`, the app shows "Success!", reloads, and Ada appears in the row under her parents, joined to them by a line. A wrong password returns an error and the form stays open with nothing changed.

## Deploy your own

The full walkthrough, including a minimal Apps Script and the exact sheet columns, is in **[docs/setup.md](docs/setup.md)**. In short:

1. **Sheet:** a `Members` sheet with the headers `id, name, gender, birth_date, death_date, father_id, mother_id, spouses, bio, photo_url`.
2. **Apps Script:** a web app on that sheet whose `doGet` returns the rows as JSON and whose `doPost` handles `ADD`, `EDIT` and `DELETE` after checking the password. Deploy it as a web app that anyone can access and copy the `/exec` URL. The script is not in this repo; the setup guide has a starting point.
3. **Netlify:** import the repo, build command `npm run build`, publish directory `dist`, and set the environment variable `VITE_APPS_SCRIPT_URL` to your `/exec` URL. `netlify.toml` already redirects every path to `index.html` for the single-page app.

Always set `VITE_APPS_SCRIPT_URL`. Without it, the app falls back to a URL hardcoded in `src/utils/api.js`.

## Stack

- React 19 + Vite 7
- Custom tree layout and rendering (`src/components/FamilyTree`)
- Admin form (`src/components/Admin/AdminModal.jsx`)
- Google Apps Script as the API layer, Google Sheets as the datastore (`src/utils/api.js`)
- lucide-react for icons
- Deployed to Netlify (SPA redirect in `netlify.toml`)

## Documentation

- [Deploy your own](docs/setup.md): sheet columns, the data contract, an Apps Script starting point, local run, Netlify.
- [Sample family](src/sample/sample-family.json): the fictional data behind sample mode and every image in this README.
- [README image sources](docs/src): `render.py` re-renders the hero, before/after and how-it-works GIFs; `record_demo.py` re-records the two real demos.

## FAQ

**Can relatives see the tree without an account?**
Yes. Anyone with the link can browse it. That also means it is not private: anyone who has the link, or the Apps Script URL inside the built app, can read the member list.

**Can someone who is not the admin change the tree?**
Anyone can open the form, but saving, editing or deleting sends the password to your Apps Script, which decides. The React app itself does not know the password. Keep it in the script, as the setup guide does.

**Does it handle more than one spouse?**
Yes. The `spouses` field takes several ids, the form lets you pick several (hold Ctrl), and the layout puts the person in the middle of their spouses on the same row, with a marriage line to each.

**Someone who married into the family shows up in the top row. Why?**
A generation is counted from parents. A person whose parents are not in the sheet counts as the first generation, and a marriage line is only drawn between spouses on the same row. Add at least one of their parents, as the sample family does for Dina and Leo, and they move down next to their spouse.

**Who decides the left-to-right order in a row?**
The order of the rows in your sheet, with spouses pulled next to each other. Each generation row is centred. If lines cross, reordering the sheet usually fixes it.

**Can I zoom out on a very big tree?**
There is no zoom control yet. The tree scrolls in both directions, and your browser's page zoom (Ctrl and minus) works.

**Can I add photos?**
If a row has a `photo_url`, the card shows it in the avatar circle. The form does not edit photos yet, so add the URL in the sheet.

**Where does the data live?**
In your own Google Sheet, read and written by your own Apps Script. The app has no other server.

## Changelog

There is no separate changelog; the commit history is the record. **Latest, 2026-10-02:** new README with an animated hero, before/after and how-it-works, two real recordings, a setup guide, and an opt-in sample mode (`VITE_SAMPLE_DATA=true`) with a fictional family. **Before that, 2025-12-30:** the custom layout engine with multi-spouse marriage lines.

## License

Licensed under the Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
