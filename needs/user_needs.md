## User Needs

Tab Refresher Pro should give users full control over automatic tab refresh behavior without forcing one fixed interval, one fixed workflow, or one fixed visual style. Defaults should help new users start quickly, but every meaningful refresh setting must be editable and persisted.

### Core Jobs

1. Users can start, stop, and update auto-refresh for the current tab from the extension popup.
2. Each tab gets its own independent refresh job keyed by tab id, with the page URL and title saved for clarity.
3. Refresh jobs must persist in extension storage so users do not need to configure the same tab repeatedly while the tab remains available.
4. Users can run multiple tabs at the same time, each with different timing, limits, and display behavior.
5. If a tab is closed, the extension should clean up the related refresh job and badge state automatically.

### Dynamic Timing

1. Users can enter any custom refresh interval in seconds, minutes, or hours.
2. Users can choose fixed timing or random timing.
3. In fixed mode, the extension refreshes using the exact user-defined interval.
4. In random mode, users define their own minimum and maximum range, and the next interval is calculated dynamically after each refresh.
5. Presets should be editable. The extension can ship useful defaults like 5 seconds, 30 seconds, 2 minutes, and 5 minutes, but users can add, edit, remove, and reset presets.
6. Timing inputs should validate ranges and prevent unsafe values such as zero or negative intervals.

### Refresh Controls

1. Users can choose normal reload or hard reload per job.
2. Users can set an optional refresh limit per job. When the limit is reached, the job stops automatically.
3. Users can leave the refresh limit empty or set it to zero for unlimited refreshes.
4. Users can start a job immediately with the current configuration, stop the active job, or save configuration without starting.
5. Users can refresh the current tab once manually from the popup.

### Visual Feedback

1. The extension badge should optionally show the remaining countdown for each active tab.
2. Users can enable or disable an on-page countdown overlay.
3. Countdown state must be unique per tab and URL, not shared globally.
4. Users can control overlay position, compactness, and visibility from settings.
5. The overlay should not block page workflows and should be removable by disabling the countdown option.

### Popup UI

1. The popup should be the fastest control surface for the current tab.
2. It should show active/inactive status, current tab title or URL, next refresh countdown, refresh count, and selected timing mode.
3. It should provide fixed interval inputs, random range inputs, editable preset buttons, hard reload, refresh limit, badge countdown, and page countdown controls.
4. It should include clear start, stop, save, refresh once, and settings actions.
5. The UI must work with dynamic user input instead of fixed hardcoded buttons only.

### Options Page

1. The options page should be the full control center for global defaults and saved tab jobs.
2. Users can edit default timing mode, default intervals, hard reload, refresh limit, badge countdown, and page countdown behavior.
3. Users can manage presets dynamically.
4. Users can view active/saved tab jobs, stop individual jobs, remove saved jobs, or clear all jobs.
5. Users can export and import settings as JSON for backup or migration.
6. Users can reset settings to production-safe defaults.

### Storage and Reliability

1. All user-facing settings should be stored in `chrome.storage.local`.
2. Runtime timer state should be rebuilt from storage when the background worker starts.
3. Invalid or stale jobs should fail safely and clean themselves up.
4. The extension should minimize permissions and avoid unnecessary network access.
5. Build output should be ready for Chrome Web Store packaging after validation.

