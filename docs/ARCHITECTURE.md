# ESIS Data Architecture

## Overview

The application now uses a browser-local fake backend that mimics a small Firestore-style API on top of IndexedDB.

The goals are:

- keep the front-end data flow close to a real API integration
- keep demo data editable without a real backend
- preserve data across page reloads in the same browser profile

## Source Of Truth

The seed dataset lives in [src/app/data/demo-data.json](/mnt/c/Users/tranx/Documents/Github/esis/src/app/data/demo-data.json).

[src/app/data/demo-data.ts](/mnt/c/Users/tranx/Documents/Github/esis/src/app/data/demo-data.ts) provides:

- TypeScript types for the domain model
- a typed `demoDataBundle`
- `createDemoDataBundle()` which returns a deep copy of the JSON seed

## Runtime Storage

The runtime persistence layer is implemented in [src/app/lib/fake-firestore.ts](/mnt/c/Users/tranx/Documents/Github/esis/src/app/lib/fake-firestore.ts).

IndexedDB database:

- name: `esis-fake-firestore`
- version: `1`

Object stores:

- `patients`
- `practitioners`
- `messages`
- `app_metadata`

`app_metadata/bootstrap` stores the bundle-level metadata:

- `roleProfiles`
- `defaultRole`
- `activePatientId`
- `activePractitionerId`

## App Boot Flow

1. The React provider in [src/app/app-state.tsx](/mnt/c/Users/tranx/Documents/Github/esis/src/app/app-state.tsx) calls `loadAppData()`.
2. [src/app/lib/remote-data.ts](/mnt/c/Users/tranx/Documents/Github/esis/src/app/lib/remote-data.ts) delegates to the fake Firestore request layer.
3. `GET /bootstrap` reads IndexedDB.
4. If IndexedDB is empty, the fake backend auto-seeds from `demo-data.json`.
5. The provider hydrates `patients`, `practitioners`, `messages`, and active-profile metadata into React state.

## Fake Firestore Routes

These routes are in-process browser routes, not network endpoints. They are handled by `fakeFirestoreRequest(...)`.

Bootstrap and seed:

- `GET /bootstrap`
  - returns the full `DemoDataBundle`
- `POST /seed`
  - request body: full `DemoDataBundle`
  - upserts the whole seed into IndexedDB

Collection reads:

- `GET /patients`
- `GET /patients/:id`
- `GET /practitioners`
- `GET /practitioners/:id`
- `GET /messages`
- `GET /messages/:id`

Collection writes:

- `POST /patients/:id`
- `PUT /patients/:id`
- `PATCH /patients/:id`
- `POST /practitioners/:id`
- `PUT /practitioners/:id`
- `PATCH /practitioners/:id`
- `POST /messages/:id`
- `PUT /messages/:id`
- `PATCH /messages/:id`

Aggregate helper:

- `GET /collections`
  - returns the same high-level bundle shape used by the app bootstrap

## Persistence Behavior

Persisted today:

- creating a patient from the manager creation flow
- editing a patient's `statut`, `telephone`, and `ville` from the manager detail panel
- composing a new message
- archiving a message

These actions update both:

- React in-memory state for immediate UI refresh
- IndexedDB for reload persistence

## Current UI Integration

[src/app/components/patients-page.tsx](/mnt/c/Users/tranx/Documents/Github/esis/src/app/components/patients-page.tsx):

- creates new patients through `createPatient(...)`
- updates selected patient fields through `updatePatient(...)`

[src/app/components/messaging-page.tsx](/mnt/c/Users/tranx/Documents/Github/esis/src/app/components/messaging-page.tsx):

- creates outgoing messages through `createMessage(...)`
- archives messages through `updateMessage(...)`

These provider methods are defined in [src/app/app-state.tsx](/mnt/c/Users/tranx/Documents/Github/esis/src/app/app-state.tsx).

## Limits

- This is not a full Firestore emulator.
- There is no query language, auth layer, conflict resolution, or multi-user sync.
- Data is local to the browser profile and machine.
- Clearing site storage or IndexedDB removes the persisted data.

## Practical Rule

You can now edit `src/app/data/demo-data.json` to change the seed, but that only affects fresh seeds.

If IndexedDB already contains data:

- existing persisted records keep winning on reload
- run `POST /seed` again or clear IndexedDB to reinitialize from the JSON seed
