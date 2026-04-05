# Bag Size Detective - Chrome Extension

A Chrome extension that automatically detects bag/luggage dimensions on web pages and compares them against North American airline baggage size limits.

## Features

- **Auto-detect dimensions**: Scans product pages for bag dimensions (e.g., "56 x 36 x 23 cm")
- **Dual unit display**: Shows both cm and inches regardless of the original unit on the page
- **Manual input**: Enter dimensions manually if auto-detection doesn't find them
- **Airline comparison**: Compares against 13 North American airlines
- **Personal Item & Carry-On**: Check both baggage types with a single click

## Supported Airlines

| Airline | Code |
|---------|------|
| American Airlines | AA |
| Delta Air Lines | DL |
| United Airlines | UA |
| Southwest Airlines | WN |
| JetBlue Airways | B6 |
| Alaska Airlines | AS |
| Spirit Airlines | NK |
| Frontier Airlines | F9 |
| Air Canada | AC |
| WestJet | WS |
| Sun Country Airlines | SY |
| Allegiant Air | G4 |
| Hawaiian Airlines | HA |

## Installation

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (top right toggle)
4. Click "Load unpacked"
5. Select the `bag-size-detective` folder

## Usage

1. Navigate to any product page with bag/luggage dimensions
2. Click the Bag Size Detective icon in the toolbar
3. The extension will auto-scan the page for dimensions
4. Click a detected dimension or enter manually
5. View which airlines allow your bag as a personal item or carry-on

## How It Works

- **Content Script** (`content.js`): Scans the page text for dimension patterns like "56 x 36 x 23 cm", "22 x 14 x 9 in", and also checks JSON-LD structured data and meta tags.
- **Popup** (`popup.html/js`): Displays detected dimensions, handles manual input, and compares against airline limits.
- **Airline Data** (`airlines.js`): Contains size limits for personal items and carry-ons for all major North American airlines.
