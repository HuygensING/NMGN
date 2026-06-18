# NMGN (Nieuwe Maritieme Geschiedenis van Nederland)

[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

This repository converts Word (`.docx`) chapters into JSON, Markdown, and HTML. The built site is published at [nmgn.huygens.knaw.nl](https://nmgn.huygens.knaw.nl).

## Prerequisites

- [Node.js](https://nodejs.org/) (npm included)
- [Pandoc](https://pandoc.org/installing.html) — required for the Word → HTML conversion step

## Install

```bash
npm i
```

## Adding a new Word file

Follow these steps when you have a new chapter to run through the pipeline.

### 1. Place the file

Save your `.docx` in `content/word/`.

The filename is only used to locate the file on disk. It does not have to match the chapter code. A descriptive name works fine, for example:

```
content/word/d1h2_nieuwepijplijn11jan26.docx
```

### 2. Add metadata to the Word document

Each chapter must start with a metadata block between `---` lines. Use normal paragraphs in Word (one field per line, `key: value`):

```
---
title: Het land, het water en de binnenvaart
author: Thijs J. Maarleveld †
part: 1
chapter: 2
summary: Short summary of the chapter…
publication_date: 30 juni 2021
doi: 10.5281/zenodo.5150412
doi_url: https://zenodo.org/record/5150412
status: development
---
```

The `part` and `chapter` values determine the output chapter code (`d1h2` in this example). All generated files use that code, not the Word filename.

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Chapter title |
| `author` | yes | Author name(s) |
| `part` | yes | Book part number (`0` for the home page) |
| `chapter` | yes | Chapter number within the part (`0` for the home page) |
| `summary` | yes | Short description for navigation and search |
| `publication_date` | no | Display date |
| `doi` | no | DOI identifier |
| `doi_url` | no | Link to the DOI record |
| `status` | yes | `hidden`, `development`, or `published` |

Example header templates are in `output/docx-headers/`. You can also generate them from legacy site data with:

```bash
npm run "docx headers"
```

The home page uses `part: 0` and `chapter: 0` (source file `d_index.docx` → output `d0h0`).

### 3. Register the file

Add the filename **without** the `.docx` extension to `app/conversion/wordfiles.json`:

```json
[
  "d_index",
  "d1h2_nieuwepijplijn11jan26",
  "d1h3"
]
```

Only files listed here are converted.

### 4. Run the pipeline

Convert all registered Word files:

```bash
npm run Convert_Data
```

This runs four steps per file:

1. **Word → HTML** (`conversion-a-docx-html.js`) — Pandoc
2. **HTML → JSON** (`conversion-b-json.js`) — parses content and metadata
3. **JSON → Markdown** (`conversion-d-markdown.js`)
4. **JSON → clean HTML** (`conversion-c-basic-html.js`)

Output is written to `output/json/`, `output/markdown/`, and `output/html-clean/`.

To build the full website (including Tailwind CSS), either run the steps below or use `npm start` for the complete dev workflow.

```bash
npm run Build_website
npm run tw
```

`npm start` runs conversion, rebuilds the site on file changes, and watches for updates.

### 5. Check the result

After conversion, verify:

- `output/json/d{part}h{chapter}.json` — parsed chapter data
- `output/markdown/d{part}h{chapter}-{slug}.md` — Markdown export
- `output/html-clean/d{part}h{chapter}-{slug}.html` — simple HTML (e.g. for PDF)
- `output/html-site/` — full website (after `Build_website`)

Chapters with `status: development` or `status: published` appear on the site. Chapters with `status: hidden` are skipped.

## npm scripts

| Command | Description |
| --- | --- |
| `npm start` | Convert data, then watch and rebuild the site |
| `npm run Convert_Data` | Convert all Word files in `wordfiles.json` |
| `npm run Build_website` | Build HTML site from JSON |
| `npm run tw` | Compile Tailwind CSS |
| `npm run tw watch` | Watch and recompile Tailwind CSS |
| `npm run Build_lunr_index` | Build search index |
| `npm run "docx headers"` | Generate metadata header templates |

## File organisation

```
app/
  build-website/    # Build HTML site from JSON
  conversion/       # Convert .docx to markdown, JSON and HTML
  replace/          # Project-specific string replacements
content/
  word/             # Source Word files (.docx)
  data/             # JSON data (e.g. images, legacy site data)
output/
  docx-headers/     # Metadata header templates for Word files
  html-clean/       # Simple HTML for PDF export
  html-site/        # Full HTML website for publishing
  json/             # Parsed chapter JSON
  markdown/         # Markdown exports
src/
  components/       # Handlebars components
  css/                # Tailwind source
  templates/          # Handlebars templates
```
