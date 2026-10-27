# DeutschMaster

Offline German learning desktop application for Russian-speaking learners. Version 1.1.0 includes A1–C2 vocabulary and grammar, seven vocabulary modes, SM-2 review, retained mistakes, personal CSV dictionaries, activity statistics and light/dark themes.

## Быстрый запуск

1. Откройте `release/DeutschMaster-Setup-1.1.0.exe` и пройдите установку. Затем запустите DeutschMaster через ярлык. Если установщик ещё не собран, используйте команды ниже.
2. Нажмите «Начать обучение». Свои карточки добавляйте в «Мой словарь», уровень и дневную цель меняйте в «Настройки».
3. Прогресс сохраняется автоматически после каждого ответа. Интернет для занятий не нужен. Для аудирования установите локальный немецкий голос Windows.

## Development

Use Node.js and npm. The project was developed with Node.js 24. Run commands in the project directory:

```powershell
npm ci
npm run dev
```

`npm run dev` opens Electron with the Vite development server. `npm run dev:web` starts browser preview at `http://127.0.0.1:5173`. Browser preview stores data separately in LocalStorage; clearing browser data removes that preview progress. Desktop uses local SQLite.

## Verification and Windows installer

```powershell
npm run check
npx playwright install chromium
npm run test:e2e
node tests/learning/browser.smoke.mjs
npm run build
node scripts/electron-smoke.mjs
npm run dist:win
node scripts/packaged-smoke.mjs
```

The installer is `release/DeutschMaster-Setup-1.1.0.exe`; the unpacked application is `release/win-unpacked/DeutschMaster.exe`. The Electron smoke test creates a separate profile under `artifacts/` and reopens it to verify persistence. The packaged smoke test checks the actual application's version, verifies its resolved test-profile path before changes, and checks bundled SQLite/WASM persistence after restart. It also verifies at least 60 saved cards per level and a populated C2 grammar lesson. Neither test changes normal user data. The installer is unsigned; Windows may show the publisher as unknown.

## Data and CSV

Development data lives at `data/deutschmaster.sqlite`. Installed builds use Electron's per-user application directory. Do not delete this database to resolve an error; the application displays storage failures without silently resetting progress.

In the dictionary, create a personal card and enter any set name to create that set. CSV import accepts UTF-8, BOM, comma or semicolon separators and quoted multiline fields. Required headers: `german,russian`. Optional headers: `article,plural,example,exampleTranslation,level,topic,set`. Maximum import size: 5 MB. Invalid imports add no words; valid imports append new cards. Export includes the current filters and neutralizes spreadsheet formulas.

```csv
german,russian,article,plural,level,topic,set
Möglichkeit,возможность,die,Möglichkeiten,A2,Общение,Мой набор
```

## Course scope

The built-in course teaches all six levels A1–C2. Level labels describe the teaching sequence and the learner's preference; they do not certify proficiency or represent an exhaustive examination syllabus. Listening requires a local German Web Speech voice installed through Windows language/speech settings.

| Level | Vocabulary cards | Grammar topics |
| --- | ---: | ---: |
| A1 | 60 | 7 |
| A2 | 60 | 7 |
| B1 | 60 | 7 |
| B2 | 60 | 5 |
| C1 | 60 | 5 |
| C2 | 60 | 4 |
| Total | 360 | 35 |

Each topic has six practice exercises and three final questions: 210 practice exercises and 105 final questions in total. The vocabulary retains all 48 original cards and adds 312 new cards.

Existing profiles receive missing expansion cards automatically when opened. Existing cards and personal edits take precedence by ID; personal words, attempts, mistakes, review dates and preferences are retained. Deleted original starter cards are not restored. A failed upgrade leaves the previous saved profile intact and displays a retry action. New installations start with the complete course.

See [architecture](docs/architecture.md) and [content sources](docs/content-sources.md) for the technical boundaries and linguistic references. No account or external backend is required.
