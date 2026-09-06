# Product Catalog Challenge

## Task

Build a Product Catalog Single Page Application (SPA) for browsing and managing products. You will use the **Fake Store API** https://fakestoreapi.com/ as your data source.

### Requirements:

- **Overview Page:** Implement an overview page that displays a list of products with their title, image, price, and a truncated description.
- **Detail Page:** Implement a product detail page that shows the complete product information (full description, category, ratings, etc.).
- **Product Creation:** Create a form to simulate adding a new product to the catalog.
- **Best Practices:** Consider UX best practices, accessibility, and web semantics. It doesn't have to look incredibly fancy, but it should be clean and highly usable.
- **Getting Started:** Use the pre-configured `@ngneat/query` setup to manage your API state efficiently.

---

## What We Look For

This challenge is not about racing to finish every single requirement; it's about showing us how you work, how you think, and what you value as an engineer. **Please invest no more than 2 to 3 hours of your time.**

Please organize, design, test, and document your solution the way you normally would in a production environment. We understand that this timeline requires trade-offs.

The use of AI is mandatory, but the ownership of every technical decision is yours.

### Documentation Requirement:

Please use the bottom of this README to document:

- Your technical trade-offs and the rationale behind your choices.
- What you would do differently, or what you would focus on next if you had more time (e.g., specific architectural improvements, edge-case testing, advanced UI features).

---

## Submission

Clone this repo and send us the link to your repository when you are finished. This should be completed at least **24 hours before your scheduled interview**. We will walk through your codebase and discuss your solution together during the interview.

---

## Helpful Links

- [Fake Store API Docs](https://fakestoreapi.com/docs)
- [@ngneat/query Documentation](https://github.com/ngneat/query)
- [Angular Documentation](https://angular.dev/)

---

## Development & Tooling

This project was generated using Angular CLI version 21.2.11.

### Development Server

To start a local development server, run:

```bash
ng serve
```

---

## Running It

```bash
npm start        # ng serve — http://localhost:4200
npm test         # vitest, via the Angular CLI unit-test builder
npm run build    # production build
```

---

## Architecture

- **Angular 21, standalone, zoneless, signals.** No `NgModule`s, no `Zone.js` change detection —
  every reactive value is a signal or a `computed()`.
- **`@ngneat/query` is the state layer.** There is no NgRx, no service-level `BehaviorSubject`
  cache, no manually-managed loading/error flags. `ProductsApi` (`src/app/products/data/`) wraps
  three query-cache operations — list, detail, create — and every page reads `result()` directly.
  The cache _is_ the app's state; a page component's job is to derive view state from it, not to
  hold its own.
- **Feature folders.** `src/app/products/{overview,detail,create}/` for the three routed pages,
  `src/app/products/data/` for the API service and `Product` model, `src/app/products/ui/` for
  presentational pieces (`ProductRating`) shared across more than one page.
- **Lazy routes.** Every page is `loadComponent`-ed from `products.routes.ts`, so the initial
  bundle only pays for the shell and whichever page is loaded first.

---

## Trade-offs

- **Categories are derived from the already-loaded product list** (`new Set(products.map(...))`)
  rather than fetched from `GET /products/categories`. One fewer request and one fewer
  loading/error state to design for; the cost is that if the API ever held a category with zero
  products, it wouldn't appear in the filter — acceptable for a catalogue this size.
- **The category filter lives in the URL** (`/products?category=jewelery`) rather than a plain
  component signal. It's shareable, survives a reload, and — the concrete reason it mattered here —
  survives navigating into a product's detail page and back. The cost is one extra router option
  (`withComponentInputBinding()`) and reading the filter as an `input()` instead of a private
  signal.
- **Component tests render the real DOM** (`TestBed.createComponent` + `HttpTestingController`)
  rather than mocking `ProductsApi` or shallow-rendering. Slower to write and to run, but they
  exercise what the acceptance criteria describe: loading/error/empty states, form validation
  messages, and the accessible markup — not just that a function was called.

---

## What I'd Do Differently / Next

- **`@defer` on the product grid.** Angular's built-in deferred-loading blocks
  (`@defer (on viewport)`) are a natural fit for a grid of 20+ cards with images — batch the cards
  so off-screen ones, and their images, don't cost anything until they're about to be seen. This is
  the framework-native equivalent of manual `IntersectionObserver` lazy-loading, and the next thing
  I'd reach for once the catalogue grows past a single screen.
  - Paired with that: **prefetching the detail route's chunk `on hover`** of a card, so the
    click-through feels instant even though the page itself is lazy-loaded.
- **Skeleton placeholders shaped like the real card**, instead of a text "Loading…", to cut layout
  shift and make the wait feel shorter.
- **Server-side pagination/search** once the catalogue outgrows a single fetch — worth doing
  together with the `@defer` work above, so scrolling requests the next page instead of the client
  ever holding the entire catalogue in memory.
