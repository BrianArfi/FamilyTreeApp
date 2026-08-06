# FamilyTreeApp

An interactive family tree app: browse a multi-generation tree in the browser and manage it through an admin panel, with a Google Sheet as the backing database.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Google Apps Script](https://img.shields.io/badge/Backend-Google%20Apps%20Script-4285F4?logo=googleappsscript&logoColor=white)

## What it does

The frontend renders a family tree with generational layout: parents, children, and marriage lines, including support for multiple spouses (polygamy is a first-class case, not an edge case). Data is not hardcoded. It's fetched from a Google Apps Script web app backed by a Google Sheet, so the tree updates as the sheet changes.

An Admin modal (password-gated) lets you add, edit, and delete family members, including picking a father and mother from existing members and adding multiple spouses per person.

The generational layout was originally attempted with the `react-family-tree` library, then replaced with a custom layout engine after that library proved insufficient for this app's needs (disconnected family groups, multi-spouse "marriage bus" lines). That rewrite is visible in the commit history as several rounds of real debugging, not a clean first pass.

## Stack

- React 19 + Vite 7
- Custom tree layout and rendering (`src/components`)
- Google Apps Script as the API layer, Google Sheets as the datastore
- lucide-react for icons
- Deployed to Netlify (SPA redirect configured in `netlify.toml`)

## Running it locally

```bash
npm install
npm run dev
```

Other scripts:

```bash
npm run build      # production build
npm run preview    # preview the production build locally
npm run lint        # eslint
```

The app expects a Google Apps Script backend URL, read from an environment variable at build/run time. Point it at your own deployed Apps Script web app and Google Sheet to use the app with your own data.

## Status

Functional and complete for its scope: view the tree, and add/edit/delete members through the admin panel. It's a small, single-purpose tool rather than a polished product, built and iterated over about a day of focused work.
