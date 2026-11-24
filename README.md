# Saldo

Saldo is a budgeting app built around a money heatmap ("Pengekartet"): every square is one day, green for plus and red for minus. The app has no bank access, so all data is example data made from the onboarding answers.

Stack: React 19, TypeScript, Tailwind CSS 4 and Vite.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type check and production build in dist/
npm run lint
npm test         # unit tests (vitest)
```

## App and emulator are two separate pages

| Page | Entry | What it is |
| --- | --- | --- |
| `app.html` | `src/app/main.tsx` | The Saldo app. This is the only thing you change to change the app. |
| `index.html` | `src/emulator/main.tsx` | The device emulator. It loads `app.html` in an iframe inside a phone frame. |

The two folders do not import each other. `npm run lint` fails if the emulator imports code from `src/app`, or the app imports code from `src/emulator`. The only link between them is:

- the emulator loads `./app.html` (`APP_URL` in `src/emulator/Emulator.tsx`), and
- the emulator sets the CSS variables `--safe-top`, `--safe-right`, `--safe-bottom` and `--safe-left` on the app's `<html>`, because `env(safe-area-inset-*)` is 0 inside an iframe. Without the emulator they fall back to `env()`.

To remove the emulator, delete `src/emulator/` and `index.html`, rename `app.html` to `index.html`, and remove the `input` block in `vite.config.ts`.

| URL | What you see |
| --- | --- |
| `/` on desktop (wider than 900 px) | The emulator with the app inside |
| `/` on a phone or narrow window | Sends you to `app.html` |
| `/app.html` | The bare app at any width |
| `?start=onboarding` (on `/` or `/app.html`) | The app, starting in onboarding |

The choice between emulator and bare app is made once, when `/` loads. Resizing the window after that does not switch it.

In the emulator toolbar you can change device (iPhone 15 Pro is the default, same frame as the prototype), turn it to landscape, switch between "fit to window" and 100 %, reload, or open the app in a new tab. Add devices in `src/emulator/devices.ts`.

## Code map

| Path | Contents |
| --- | --- |
| `src/app/Saldo.tsx` | Top of the app: onboarding or home, and app state |
| `src/app/home/` | Home screen, forecast chart, add-transaction and settings sheets |
| `src/app/onboarding/` | The 6 onboarding steps |
| `src/app/components/` | Icons and small shared UI parts |
| `src/app/lib/` | Formatting, tax estimate, example data and forecast (with tests) |
| `src/app/index.css` | Team palette (Tailwind theme), heatmap colours, gradients |
| `src/emulator/` | Emulator, device list, its own icons and CSS |

## Live version

`.github/workflows/deploy-pages.yml` builds the app and publishes it to GitHub Pages on every push to `main`. Turn it on once in Settings > Pages > Source: "GitHub Actions".

## Pull request reviews

Claude reviews every pull request that is not a draft, and reviews again when new commits are pushed. It posts its findings as comments on the PR. It never approves, merges or changes code.
