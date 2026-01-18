# Pokemon Showdown Plus (PS+)

A Chrome extension that enhances the Pokémon Showdown random battle tooltips.

## Features
- Calculated damage and stats for user and opponent Pokémon
- Displays possible sets for opponent Pokémon
- Coloured moves for easier distinction
- Toggle switches to enable/disable features


## Installation
1. **Download or Clone the Repository**
   - Download this repository as a ZIP and extract it, or clone it using Git:
     ```
     gh repo clone switzere/PokemonShowdownPlus
     ```

2. **Open Chrome Extensions Page**
   - Go to `chrome://extensions/` in your Chrome browser.
   - Enable "Developer mode" (toggle in the top right).

3. **Load the Unpacked Extension**
   - Click "Load unpacked" and select the folder containing this project (the folder with `manifest.json`).

4. **Pin the Extension (Optional)**
   - Click the puzzle piece icon in Chrome and pin "Pokemon Showdown Plus" for easy access.

## Usage
1. **Go to [Pokemon Showdown](https://play.pokemonshowdown.com/)**
2. **Click the PS+ Extension Icon**
   - Use the popup to enable/disable the addon and toggle features like stats and movesets.
3. **Enjoy Enhanced Tooltips!**
   - Hover over Pokémon or moves in battle to see the improved tooltips and type coloring.

## Notes
- The extension only runs on the official Pokémon Showdown site and compatible local servers.
- All settings are saved and synced using Chrome's storage.
- For best results, refresh the Showdown page after changing extension settings.

## Development
- All source code is in this folder. Main files:
  - `manifest.json` — Extension manifest
  - `popup.html`, `popup.js`, `style.css` — Popup UI and logic
  - `content.js` — Content script for page injection and messaging
  - `tooltip.js` — Injected script for tooltip overrides
- To modify the extension, edit the files and reload the unpacked extension in Chrome.

## License
This project is for personal use and learning. Not affiliated with Pokémon Showdown or The Pokémon Company.
