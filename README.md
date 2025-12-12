# Minesweeper Puzzle Game

A clean, lightweight, and fully offline‑capable **Minesweeper Puzzle
Game** built with **HTML**, **CSS**, and **vanilla JavaScript**.\
This project is optimized for clarity, simplicity, mobile usability, and
GitHub hosting.

------------------------------------------------------------------------

## 🎮 Game Features

### ✔️ Classic Minesweeper Gameplay

-   Standard grid‑based puzzle logic.
-   Reveal tiles, avoid mines, and use logical deduction to win.
-   First click is **always safe** (mines are placed only after the
    first reveal).

### ✔️ Difficulty Presets

Choose from built‑in game modes: - **Easy** --- 9×9 grid, 10 mines\
- **Medium** --- 16×16 grid, 40 mines\
- **Hard** --- 16×30 grid, 99 mines

### ✔️ Custom Mode

Create your own game: - Adjustable **rows**, **columns**, and **number
of mines**. - Validates all values to prevent impossible configurations.

### ✔️ Timer & Mines Counter

-   Real‑time timer starts on first reveal.
-   Updates every second.
-   Mine counter dynamically tracks how many flags you have placed.

### ✔️ Flagging System

-   Right‑click to toggle flags on desktop.
-   **Long‑press** flagging support for mobile/touch devices.
-   Flags prevent accidental reveals.

### ✔️ Auto‑Flood Reveal

-   When revealing an empty tile (0 neighbors), the game automatically
    opens connected empty regions.
-   Classic Minesweeper fluency.

### ✔️ Win & Lose Conditions

-   **Win** when all non‑mine tiles are revealed.
-   **Lose** when clicking a mine:
    -   Explosion tile is highlighted.
    -   All mines are shown.
-   Clear popup alerts for win or game over.

### ✔️ Keyboard Accessible

-   `Enter` or `Space` to reveal a focused tile.
-   Press `F` to flag/unflag a tile.
-   Fully navigable using keyboard.

### ✔️ Mobile Friendly

-   Responsive layout adapting to small screens.
-   Long‑press flagging.
-   Larger tap‑friendly tiles on devices ≤600px.

### ✔️ Modern UI / UX

-   Dark‑themed glassy interface.
-   Smooth gradients and subtle shadows.
-   Clear visual states:
    -   unrevealed tile\
    -   revealed tile\
    -   flagged tile\
    -   mine explosion\
-   Minesweeper‑style colored numbers.

### ✔️ 100% Offline & No Dependencies

-   No libraries.
-   No external fonts.
-   No network calls.
-   Works completely offline once the HTML file is opened.

### ✔️ No Sound Effects

-   Silent gameplay (as requested).

------------------------------------------------------------------------

## 📜 License

Free to use and modify for personal or commercial projects.

------------------------------------------------------------------------

## 🙌 Credits

Created using modern vanilla web technologies with clean, readable code
specifically for learning and app development.
