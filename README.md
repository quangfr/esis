
# EPICONCEPT ESIS App

This repository contains the ESIS front-end application.

## Documentation

- Product architecture: [docs/business-functional-data-architecture.md](/mnt/c/Users/tranx/Documents/Github/esis/docs/business-functional-data-architecture.md)

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## IndexedDB fake backend

This repo now loads its demo data from IndexedDB through a fake Firestore-like API layer in the browser.

1. Copy `.env.local.example` to `.env.local`
2. Run `npm run dev`

On first load, the app seeds IndexedDB automatically using the demo dataset.
The fake API keeps the same `/seed` and `/bootstrap` payload shape used by the previous backend flow.

## Playwright demo

Run `npx playwright install chromium` once to install the browser used by the demo.

Run `npm run test:e2e:demo` to execute the filmed end-to-end journey.

Artifacts are written to `output/playwright/`, including the HTML report, traces, and recorded video.
  
