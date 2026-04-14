#!/bin/bash
# Launch the diffraction app locally for offline demo use.
# Safari blocks ES modules over file://, so we need a local server.
# This starts one on port 4173 and opens the browser.

cd "$(dirname "$0")/dist"
echo "Starting local server at http://localhost:4173"
echo "Press Ctrl+C to stop."

# Try python3 first (pre-installed on macOS), fall back to npx serve
if command -v python3 &> /dev/null; then
  open "http://localhost:4173"
  python3 -m http.server 4173
elif command -v npx &> /dev/null; then
  npx serve -l 4173 -s .
else
  echo "ERROR: No python3 or npx found. Install Node.js or Python."
  exit 1
fi
