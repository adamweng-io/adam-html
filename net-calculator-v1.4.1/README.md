# Net Calculator v1.4.1

A browser-based diamond-mesh net calculator with directional stretching, physical dimensions, hole-count mode, weight-per-length calculations, interactive blueprint visualization, history snapshots, batch specification reports, CSV/JSON export, and light/dark themes.

## Project structure

```text
net-calculator-v1.4.1/
├── index.html
├── css/app.css
├── js/app.js
└── js/modules/
    ├── calculator-core.js
    ├── dom.js
    ├── storage.js
    └── utils.js
```

The refactor separates the calculation engine from the browser UI and centralizes persistence and utility functions.

## Run locally

Because the project uses ES modules, serve it through a local HTTP server:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/`.

## GitHub Pages

Publish the folder through GitHub Pages with `index.html` as the entry point.
