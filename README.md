# Saldo

Saldo er en budsjettapp bygget rundt et varmekart, «Pengekartet». Hver rute er én dag: grønn er en dag i pluss, rød er en dag i minus. Du ser med en gang hvordan pengene dine går, uten å lese tall.

Saldo er et skoleprosjekt for Investor-ukene (gruppe 3). Appen er ikke lansert. Den har ikke tilgang til banken din, så alle tall er eksempeldata laget fra svarene i oppsettet. Ingenting sendes ut av nettleseren, og dataene lagres ikke når du laster siden på nytt.

**Prøv den:** https://frogyttv.github.io/Investorukene/

## Dette finnes i appen nå

**Oppsett (6 steg)**
- Velkommen, lønn (med skatteestimat og lønn etter skatt), faste utgifter, sparemål, ditt kart og klar.
- Faste utgifter har egne navn, og trekkes enten én dag i måneden eller på valgte ukedager.
- Lønningsdag velger du selv.

**Hjemskjerm**
- Hvor mye du har brukt denne måneden, og snarveier: Legg til, Inntekt, Budsjett og Aktivitet.
- Pengekartet: det siste året og 13 uker frem i tid som prognose. Hvit kant er i dag. Sveip sideveis. Vis det som «Bruker», «Har» eller «Tjener».
- Siste transaksjoner (se alle), inntekt og utgifter denne måneden.
- Beregnet saldo med prognosegraf.
- Sparemål med fremdriftsring.
- Budsjett denne måneden per kategori, med hvor mye som er igjen eller over.
- Kommende: neste lønn, faste regninger og egne fremtidige poster.
- Skatt per måned.

**Ny transaksjon**
- Legg til en utgift eller inntekt, én gang eller hver uke på valgte dager.

**Innstillinger**
- Velg farge på pengekartet (lagres i nettleseren).
- Start oppsettet på nytt.

## Planlagt

Fra listen «Features» på [Trello-tavlen](https://trello.com/b/5XFgu7Gl/investorukene-gr3):

- Onboarding
- Faste utgifter
- Sparemål og progress bar
- Hjemskjerm: oppsett
- Ukeplan
- Saldograf
- Registrere kjøp
- Heatmap
- Bankimport (senere)
- Endring fra forrige uke (utsatt)

Noen av disse finnes allerede i en første versjon (se over). Kortene på Trello viser hva som gjenstår.

## Teknologi

- React 19, TypeScript og Tailwind CSS 4, bygget med Vite.
- Tester med Vitest, lint med oxlint.
- `.github/workflows/deploy-pages.yml` bygger appen og publiserer den på GitHub Pages ved hver push til `main`.
- Claude går gjennom hver pull request (som ikke er utkast) og hver ny push, og skriver funn som kommentarer. Den godkjenner, fletter eller endrer aldri kode.

## Kjør lokalt

```sh
npm install
npm run dev      # http://localhost:5173
npm run build    # typesjekk og produksjonsbygg i dist/
npm run lint
npm test         # enhetstester (vitest)
```

## Kodeoppsett

Appen og enhetsemulatoren er to separate sider.

| Side | Inngang | Hva det er |
| --- | --- | --- |
| `app.html` | `src/app/main.tsx` | Selve Saldo-appen. Endre bare `src/app/` for å endre appen. |
| `index.html` | `src/emulator/main.tsx` | Enhetsemulatoren. Den laster `app.html` i en iframe inne i en telefonramme. |

De to mappene importerer ikke fra hverandre, og `npm run lint` feiler hvis de gjør det. Den eneste koblingen er at emulatoren laster `./app.html` (`APP_URL` i `src/emulator/Emulator.tsx`), og at den setter CSS-variablene `--safe-top`, `--safe-right`, `--safe-bottom` og `--safe-left` på appens `<html>`, fordi `env(safe-area-inset-*)` er 0 inne i en iframe. Uten emulatoren brukes `env()`.

| Adresse | Hva du ser |
| --- | --- |
| `/` på PC (bredere enn 900 px) | Emulatoren med appen inni |
| `/` på mobil eller smalt vindu | Sender deg til `app.html` |
| `/app.html` | Bare appen, i alle bredder |
| `?start=onboarding` (på `/` eller `/app.html`) | Appen, med oppsettet først |

Valget mellom emulator og app skjer én gang, når `/` lastes. Å endre vindusstørrelsen etterpå bytter ikke.

I emulatoren kan du bytte enhet (iPhone 15 Pro er standard), snu til liggende, velge «tilpass vindu» eller 100 %, laste på nytt eller åpne appen i en ny fane. Nye enheter legges til i `src/emulator/devices.ts`.

| Sti | Innhold |
| --- | --- |
| `src/app/Saldo.tsx` | Toppen av appen: oppsett eller hjemskjerm, og appens tilstand |
| `src/app/home/` | Hjemskjerm, prognosegraf, ny transaksjon og innstillinger |
| `src/app/onboarding/` | De 6 stegene i oppsettet |
| `src/app/components/` | Ikoner og små delte UI-deler |
| `src/app/lib/` | Formatering, skatteestimat, eksempeldata og prognose (med tester) |
| `src/app/index.css` | Fargepalett (Tailwind-tema), farger for varmekartet, gradienter |
| `src/emulator/` | Emulatoren, enhetsliste, egne ikoner og CSS |

For å fjerne emulatoren: slett `src/emulator/` og `index.html`, gi `app.html` navnet `index.html`, og fjern `input`-blokken i `vite.config.ts`.
