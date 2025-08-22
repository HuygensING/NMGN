# NMGN (Nieuwe Maritime Geschidenis van Nederland)

## Repo status
[![Project Status: WIP – Initial development is in progress, but there has not yet been a stable, usable release suitable for the public.](https://www.repostatus.org/badges/latest/wip.svg)](https://www.repostatus.org/#wip)

## Description
This repository converts .docx files to Markdown en HTML files. The HTML files will be published on nmgn.huygens.knaw.nl.

## Install
`npm i`

## Build files
Convert and build webiste:`npm start`

---

Convert files: `npm run Convert_Data`

Build website: `npm run Build_website`

Generate Tailwind Css: `npm run tw`



## Metadata
- status: hidden
- status: development
- status: published

## File organisation
```
- app
  - build-website   // build HTML site
  - conversion.     // converts .docx to markdown, json and HTML
  - replace         // project specific string replace actions
- content
  - word            // Word files
  - data            // Json Files (from former version)
- output
  - docx-headers    // Yaml headers for docx based on data previous version
  - html-clean      // simple html files for converting to .pdf
  - html-site       // Full HTML web site for publishing
  - json            // Json files
  - markdown        // markdown files
- src/              // Handlebars.js
  - components      // Handlebars.js components for building html
  - css             // Tailwind css file
  - templates       // Handlebars.js template files
```

