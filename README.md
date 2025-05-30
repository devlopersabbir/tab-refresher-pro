## Tab Refresher Browser Extension

## Features:

1. **Click to toggle:** Click the extension icon to start/stop auto-refresh for the current tab
2. **60-second countdown:** Shows remaining seconds in the badge text
3. **Per-tab control:** Each tab has its own independent refresh timer
4. **Visual feedback:** Green badge when active, no badge when inactive
5. **Auto cleanup:** Stops refreshing when tabs are closed

## How it works:

1. **Toggle activation:** Click the extension icon on any tab to start refreshing
2. **Countdown display:** The badge shows numbers counting down from 60 to 1
3. **Auto refresh:** Page refreshes every 60 seconds
4. **Independent tabs:** Each tab maintains its own refresh state
5. **Stop anytime:** Click the icon again to stop refreshing that tab

## Installation:

1. Create a new folder for your extension
2. Save all three files in that folder
3. Open Chrome and go to `chrome://extensions/`
4. Enable "Developer mode" (toggle in top right)
5. Click "Load unpacked" and select your extension folder
6. The extension icon will appear in your toolbar

The extension automatically handles cleanup when tabs are closed and maintains separate timers for each tab. The countdown resets to 60 after each refresh, giving you a clear visual indicator of when the next refresh will occur.
