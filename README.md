# Saldo

Saldo is a budgeting app built around a money heatmap ("Pengekartet"): every square is one day, green for plus and red for minus. The app has no bank access, so all data is example data made from the onboarding answers.

Stack: React 19, TypeScript, Tailwind CSS 4 and Vite.

## Run it

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # type check and production build in dist/
npm run lint
```

## How the app is shown

| Where | What you see |
| --- | --- |
| Phone or narrow window | The app, full screen |
| Desktop (wider than 900 px) | A device emulator with the app inside a phone frame |
| `?app=1` | The bare app at any width |
| `?start=onboarding` | Start in onboarding instead of the home screen |

The emulator runs the real app in an iframe at the device's screen size. Use the toolbar to change device (iPhone 15 Pro is the default, same frame as the prototype), turn it to landscape, switch between "fit to window" and 100 %, reload, or open the app in a new tab. The emulator sends the device's safe area to the app, because `env(safe-area-inset-*)` is 0 inside an iframe.

## Code map

| Path | Contents |
| --- | --- |
| `src/app/` | Home screen, add-transaction sheet, settings sheet |
| `src/onboarding/` | The 6 onboarding steps |
| `src/emulator/` | Device emulator and the device list (`devices.ts`) |
| `src/components/` | Icons and small shared UI parts |
| `src/lib/` | Formatting, tax estimate, example data and forecast |
| `src/index.css` | Team palette (Tailwind theme), heatmap colours, gradients |

## Live version

`.github/workflows/deploy-pages.yml` builds the app and publishes it to GitHub Pages on every push to `main`. Turn it on once in Settings > Pages > Source: "GitHub Actions".

## Pull request reviews

Claude reviews every pull request that is not a draft, and reviews again when new commits are pushed. It posts its findings as comments on the PR. It never approves, merges or changes code.
