# SmartRent AI — Next.js conversion (starter)

This is the App Router skeleton for your site, with the **Admin Command
Center** fully converted as the template page. Same look, same CSS, same
Firestore behavior as your `admin.html` — just running as real React now.

## Run it

```bash
npm install
npm run dev
```

Open http://localhost:3000/admin (you'll be redirected to `/login`, which
doesn't exist yet — see "Next steps" below).

## What changed vs. the HTML version

- **One Firebase init** — `lib/firebase.js`, imported everywhere instead of
  re-running `initializeApp()` per page.
- **State instead of `innerHTML`** — every table/grid is now a `.map()` over
  React state that updates itself when Firestore pushes a change. No more
  manually re-rendering HTML strings.
- **Same CSS, unchanged** — `app/admin/admin.css` is your exact stylesheet
  from `admin.html`, byte-for-byte. Nothing was renamed or converted to
  CSS Modules, so there's zero risk of a visual regression.
- **Real components** — `components/StatCard.js`, `FilterTabs.js`,
  `Toasts.js`, `ConfirmModal.js` are reusable now instead of copy-pasted
  markup. Every other page you convert can import these directly.
- **Live data is still 100% Firestore `onSnapshot`** — nothing about your
  real-time behavior changed, it's just wired through `useState`/`useEffect`
  instead of manual DOM writes.

## File map

```
app/
  layout.js         → root layout, loads fonts once for the whole app
  globals.css        → minimal reset (box-sizing etc.)
  admin/
    page.js           → the converted dashboard (route: /admin)
    admin.css         → your original admin.html styles, unchanged
components/
  StatCard.js, FilterTabs.js, Toasts.js, ConfirmModal.js
lib/
  firebase.js        → shared Firebase app/db/auth init
```

## Next steps (converting your other pages)

Follow the exact same recipe for each remaining HTML file:

1. `app/plans/page.js` ← `plans.html`
2. `app/post-property/page.js` ← `post-property.html`
3. `app/post-commercial/page.js` ← `post-commercial.html` (or similar route name)
4. `app/post-service/page.js` ← `post-service.html`
5. `app/login/page.js` — you'll need this one first since `admin/page.js`
   redirects here when no admin is signed in. It just needs a simple
   email/password form calling `signInWithEmailAndPassword` from
   `firebase/auth`.

For each page:
- Copy the `<style>` block into `app/<route>/<route>.css`, import it at the
  top of `page.js` — exactly like `admin.css` above. No class renaming.
- Put the Firebase read/write logic inside `useEffect`/handler functions,
  same pattern as `admin/page.js`.
- Convert `innerHTML = template literal` sections into `.map()` JSX —
  it's mechanical: each `<div class="...">` becomes `<div className="...">`.
- Reuse `Toasts`, `ConfirmModal` from `components/` instead of re-building
  toast/modal logic per page.

Once all pages exist under `app/`, Next.js's file-based routing replaces
every `href="plans.html"` link with `href="/plans"` (no `.html` needed).

## Known simplifications in this first pass

- The little "count-up" number animation from the original vanilla JS was
  dropped for simplicity (numbers just render directly via
  `toLocaleString`). Easy to add back with a small `useCountUp` hook if you
  want it — happy to add this next.
- Razorpay + Cloudinary calls (used in `plans.html` / `post-property.html`)
  aren't in this admin page since it doesn't use them, but they port the
  same way: wrap the existing `fetch`/`XMLHttpRequest` calls in a function,
  call it from a button `onClick`, keep the keys/config in `lib/`.
