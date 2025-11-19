# F1 Racers App

A React application displaying Formula 1 driver standings with champion badges and detailed driver information.

## Features

- Display current F1 driver standings
- Show world champion badges with championship years
- Filter drivers by championship status
- Sort drivers by current standing position
- Responsive card-based layout

## Prerequisites

- Node.js 20.19+ or 22.12+ (required for Vite 7.x)
- npm 9.5.0 or higher

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/asterisks007/f1-racers-app.git
cd f1-racers-app
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173/`

### 4. Build for production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### 5. Preview production build

```bash
npm run preview
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest

## Project Structure

```
f1-racers-app/
├── src/
│   ├── components/       # React components
│   │   ├── ChampionBadge.jsx
│   │   ├── DriverCard.jsx
│   │   ├── DriverList.jsx
│   │   └── StandingsDisplay.jsx
│   ├── services/         # Business logic
│   │   └── driverService.js
│   ├── data/            # Static data
│   │   └── drivers.json
│   ├── test/            # Test setup
│   │   └── setup.js
│   ├── App.jsx
│   └── main.jsx
├── specs/               # Project documentation
│   ├── requirements.md
│   ├── design.md
│   └── tasks.md
└── package.json
```

## Technologies Used

- React 19.2.0
- Vite 7.2.2
- Vitest (testing)
- @testing-library/react (component testing)

## Documentation

See the `specs/` folder for detailed project documentation:
- `requirements.md` - Feature requirements and user stories
- `design.md` - Architecture and design decisions
- `tasks.md` - Implementation task list
