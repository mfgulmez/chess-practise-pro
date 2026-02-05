# ♟️ Chess Practice App

A sophisticated, full-stack chess practice application designed for high-performance gameplay, analysis, and responsive portability. This project integrates a powerful chess engine with real-time data fetching and adaptive UI components.

## 🚀 Key Features

### 🧠 Integrated AI & Engine Logic
* **Stockfish 10+ Integration**: Utilizes Stockfish via Web Workers to ensure a non-blocking UI during deep calculations.
* **Persistent Hint Mode**: Features a "sticky" toggleable state that automatically provides best-move visualizations after every opponent move.
* **Advanced Move Validation**: Built on `chess.js` for robust PGN/FEN handling and rule compliance.

### 📚 Data-Driven Analysis
* **Live Opening Explorer**: Fetches master-game statistics and opening names directly from the Lichess Explorer API.
* **Robust Network Handling**: Implements custom timeouts and fallback logic to handle Lichess 504 Gateway errors gracefully.
* **Move History & Redo**: Tracks the full game state in a centralized object for seamless undo/redo and analysis functionality.

### 📱 Responsive & Mobile Optimized
* **Adaptive Board Scaling**: Uses Dynamic Viewport Height (`dvh`) and custom media queries to prevent vertical overflow and UI collisions on mobile devices.
* **Mobile-First UX**: Implements `touch-action: none` to prevent unintended page scrolling during piece dragging.
* **Desktop Performance**: Scales to an expansive 80vh layout for PC users, prioritizing high visibility and ease of control.

## 🛠️ Technology Stack

* **Build Tool**: [Vite](https://vitejs.dev/) for optimized asset bundling and HMR.
* **Core Logic**: [chess.js](https://github.com/jhlywa/chess.js) for move validation and [chessboard.js](https://chessboardjs.com/) for the UI board interface.
* **DOM Manipulation**: [jQuery](https://jquery.com/) for event orchestration and UI state management.
* **Engine**: Stockfish.js (WASM/ASM.js) running in an asynchronous worker thread.

## 📂 Project Structure

```text
├── public/
│   └── stockfish.js         # Static engine asset
├── src/
│   ├── components/
│   │   ├── Board.js         # Chessboard setup and UI highlights
│   │   ├── Clock.js         # Timer and increment logic
│   │   ├── Controls.js      # Button action handlers
│   │   └── Modals.js        # Explorer and Analysis UI rendering
│   ├── services/
│   │   ├── Explorer.js      # Lichess API integration service
│   │   └── Stockfish.js     # Engine worker and Hint management
│   ├── styles/
│   │   ├── board.css        # Responsive board sizing
│   │   ├── main.css         # Global layout and DVH constraints
│   │   └── ui.css           # Button themes and active states
│   ├── main.js              # Application entry and game loop
│   └── state.js             # Centralized game state object
├── index.html               # Main entry point
└── package.json             # Dependencies and scripts
```
## 🚀 Installation & Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```

### 3. Mobile Network Testing
To test the responsive layout on a mobile device within the same network, use:
```bash
npm run dev -- --host
```

## 📄 License
This project is licensed under the MIT License.
