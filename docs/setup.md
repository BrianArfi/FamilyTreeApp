# Deploy your own family tree

You need a Google account, a Netlify account (free plan is fine), Node.js 20.19+ or 22.12+ (Vite 7), and about 20 minutes.

The pieces:

1. **A Google Sheet** that holds one row per person.
2. **A Google Apps Script web app** bound to that sheet. The React app reads from it and sends edits to it.
3. **This React app**, built by Vite and hosted on Netlify.

## 1. The data the app expects

`src/utils/api.js` makes two kinds of calls to one URL, `VITE_APPS_SCRIPT_URL`:

- `GET <url>` must return a JSON array of members.
- `POST <url>` with the body `{"action": "ADD" | "EDIT" | "DELETE", "password": "...", "data": {...}}` must return `{"success": true}` or `{"success": false, "error": "message"}`. The app shows the error in an alert and keeps the form open.

Each member is an object with these fields (all strings):

| Field | What it holds | Notes |
| :--- | :--- | :--- |
| `id` | Unique id | Any string or number, compared as text |
| `name` | Full name | Shown on the card and in the sidebar |
| `gender` | `Male` or `Female` | Exact spelling. Sets the card colour, and which dropdown (Father or Mother) lists the person |
| `birth_date` | `DD-MM-YYYY` | Shown as typed. An ISO date (what a Sheets date cell turns into) is reformatted to `DD-MM-YYYY` |
| `death_date` | `DD-MM-YYYY` or empty | Stored and editable, not shown on the card |
| `father_id`, `mother_id` | The parent's `id`, or empty | These decide the generation rows |
| `spouses` | Comma-separated ids, e.g. `7` or `4,9` | More than one spouse is supported |
| `bio` | Free text | Kept in the data; the current UI does not show or edit it |
| `photo_url` | Image URL or empty | Shown in the card's avatar circle if set; not editable in the form |

Make a sheet called `Members` with exactly those ten headers in row 1, `id` in column A. Format the date columns as **Plain text** (Format, Number, Plain text) so Sheets does not turn `16-05-1993` into a date in your locale.

For a quick start, copy the rows from [`src/sample/sample-family.json`](../src/sample/sample-family.json), the fictional family used in the demos.

## 2. The Apps Script web app

The repo does not include the backend script that the original deployment runs. Below is a minimal script written for this guide that follows the contract above. It has not been run against the original deployment; treat it as a starting point and test it with your own sheet.

In the sheet: **Extensions, Apps Script**, replace `Code.gs` with:

```js
const SHEET_NAME = 'Members';

function sheet_() { return SpreadsheetApp.getActive().getSheetByName(SHEET_NAME); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doGet() {
  const [head, ...rows] = sheet_().getDataRange().getDisplayValues();
  return json_(rows.filter(r => r[0] !== '').map(r => Object.fromEntries(head.map((h, i) => [h, r[i]]))));
}

function doPost(e) {
  const { action, password, data } = JSON.parse(e.postData.contents);
  const secret = PropertiesService.getScriptProperties().getProperty('ADMIN_PASSWORD');
  if (!secret || password !== secret) return json_({ success: false, error: 'Wrong password' });

  const sh = sheet_();
  const values = sh.getDataRange().getDisplayValues();
  const head = values[0];
  const toRow = d => head.map(h => (d[h] === undefined || d[h] === null) ? '' : String(d[h]));
  const rowOf = id => values.findIndex((r, i) => i > 0 && String(r[0]) === String(id)) + 1; // 0 = not found

  if (action === 'ADD') {
    const next = Math.max(0, ...values.slice(1).map(r => Number(r[0]) || 0)) + 1;
    sh.appendRow(toRow({ ...data, id: String(next) }));
  } else if (action === 'EDIT' || action === 'DELETE') {
    const r = rowOf(data.id);
    if (!r) return json_({ success: false, error: 'Member not found' });
    if (action === 'EDIT') sh.getRange(r, 1, 1, head.length).setValues([toRow(data)]);
    else sh.deleteRow(r);
  } else {
    return json_({ success: false, error: 'Unknown action' });
  }
  return json_({ success: true });
}
```

Then:

1. **Project Settings, Script properties**: add `ADMIN_PASSWORD` with the password your admin will type. It lives only in the script, never in the React app.
2. **Deploy, New deployment**, type **Web app**. Execute as: **Me**. Who has access: **Anyone**. Authorise it.
3. Copy the URL that ends in `/exec`. After any change to the script, deploy a new version, or the URL keeps serving the old one.

"Anyone" means anyone who has that URL can read the member list with a plain GET. The URL ends up inside the built JavaScript, so treat the tree as visible to anyone with the site link. Only edits are password-checked.

## 3. Run it locally against your sheet

```bash
cp .env.example .env.local      # then put your /exec URL in it
npm ci
npm run dev
```

`.env.local` is ignored by git. Always set `VITE_APPS_SCRIPT_URL`: if it is missing, `src/utils/api.js` falls back to a URL hardcoded in the source.

To try the app without any backend, use the sample mode instead:

```bash
VITE_SAMPLE_DATA=true npm run dev
```

It loads the fictional family, keeps edits in memory until you reload, and accepts the admin password `demo`. It fetches nothing and is off in normal builds.

## 4. Deploy to Netlify

1. Push your fork to GitHub and choose **Add new site, Import an existing project** in Netlify.
2. Build command: `npm run build`. Publish directory: `dist`.
3. **Site configuration, Environment variables**: add `VITE_APPS_SCRIPT_URL` = your `/exec` URL. Vite bakes it in at build time, so redeploy after changing it.
4. Deploy. `netlify.toml` already sends every path to `index.html`, so reloading any URL works.

Share the Netlify link with the family. Give the admin password only to the people who should edit.
