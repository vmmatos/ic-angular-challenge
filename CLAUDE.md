# Product Catalog Challenge

SPA for browsing and creating products against the [Fake Store API](https://fakestoreapi.com/docs). Built for the Imaginary Cloud take-home challenge. Requirements live in `README.md`; work is tracked as GitHub Milestones + Issues, not a local TODO file.

## Stack

- Angular 21, standalone components, zoneless, signals.
- New control-flow syntax (`@for`, `@if`) — no `*ngFor`/`*ngIf`.
- `@ngneat/query` for all server state (list/detail/create). No NgRx or other client state library — the query cache is the state.
- Vitest for unit tests.

## Conventions

- **Filenames drop the type suffix**, matching this repo's existing `app.ts`/`app.html`/`app.scss`/`app.spec.ts`: use `product-list.ts`, not `product-list.component.ts`.
- Feature-based folders under `src/app/products/`: `overview/`, `detail/`, `create/` for the routed components, plus a shared `data/` folder for the `Product` model and the API service wrapping `@ngneat/query`.
- No inline code comments as a general rule — code should read clearly on its own.
- Formatting via Prettier (`.prettierrc` at root); no separate lint step configured.

## Commands

```bash
npm start        # ng serve
npm test         # vitest
npm run build    # production build
```

## Routes

- `/products` — overview (default).
- `/products/:id` — detail.
- `/products/new` — creation form.
