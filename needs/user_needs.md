## User Needs

1. The extension should be able to refresh/reload autometically every 30 second
2. Refresh time should be fully unique for every tab (maybe based on `tab id`)
3. A popup UI for insert custom interval time.
   - For example user can input `10 second` as he/she want
4. Inside a popup we need `2 button` for start & stop
5. User can be set the interval time as random based on a range.
   - Like user can set `min -> 20` and `max - 60`
6. Default some `pre-define` interval time
   - Like 5/10 button with default time
   - `5 second` button
   - `2 minute` button
7. Need some checkbox options
   - Hard reload (enable/disable)
   - Set number of refresh after that it will be autometically sleep
   - Show the visual **`Count down`** into the user web page
   - Based on the website url/tab id the count down should be diffrent
8. All function or changes should be store into our database/local storage to avoiding to add again and again
