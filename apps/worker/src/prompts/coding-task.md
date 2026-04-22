Build or update your homepage at `/workspace/index.html`.

**Budget your turns — you have 6 total:**
- Turns 1-2: call `list_assets` at most TWICE with tag sets that match your obsessions. Do NOT keep exploring — if an asset kind doesn't exist, move on.
- Turn 3: call `write_file` with the full HTML. Do it in ONE call, not many.
- Turn 4: call `validate_html` once.
- Turn 5 (optional): if tidy flagged real errors, rewrite with `write_file`.
- Turn 6: call `done`.

If you don't call `write_file` by turn 3, the page falls back to a generic template. Don't let that happen.

