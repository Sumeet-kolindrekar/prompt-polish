# PromptPolish — notes for Claude Code

## What this is
A Chrome extension (Manifest V3) that adds an "Improve" button to claude.ai. It sends the user's rough prompt to the Anthropic API and shows an improved version plus a short "why."

## Stack
- Plain JavaScript, HTML, CSS. **No build step, no frameworks, no npm** unless I explicitly ask.
- API calls happen only in `background.js`. `content.js` never calls the API directly.

## Rules
- Never insert model output with `innerHTML`. Always use `textContent`.
- Never hardcode or commit API keys.
- v1 targets claude.ai only. Don't add other sites unless I ask.
- Keep the code readable for a beginner: short functions, clear names, comments on anything non-obvious.
- When you change something, explain in plain English what changed and why — I'm learning as I go.

## Testing
After changes: go to `chrome://extensions`, click the reload icon on PromptPolish, then refresh claude.ai and try the button.
