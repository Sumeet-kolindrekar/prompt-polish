# PromptPolish ✨

Turn rough prompts into clear, specific ones with one click — and see **why** the new version is better.

PromptPolish is an open-source Chrome extension. Type a quick, messy prompt into Claude.ai, click **Improve**, and get a rewritten version side by side with your original plus a one-line explanation. Use it or keep yours.

The goal isn't just better prompts — it's teaching people to write them.

## Features (v0.1)

- One-click "Improve" button on claude.ai
- Before / after preview with a short "why it's better"
- Optional personal profile ("I run a limo company in NYC") woven in when relevant
- Bring your own API key — nothing runs on anyone's server, no cost to the project

## Install (developer mode)

1. Download or clone this repo.
2. Open Chrome and go to `chrome://extensions`.
3. Turn on **Developer mode** (top right).
4. Click **Load unpacked** and select this folder.
5. Right-click the extension icon → **Options**, paste your Anthropic API key, and save.

## Use it

1. Go to claude.ai and type a prompt in the chat box.
2. Click **✨ Improve** (bottom right).
3. Review the improved version and click **Use it** or **Keep mine**.

## How it works

| File | What it does |
|---|---|
| `manifest.json` | Tells Chrome what the extension is and where it runs |
| `content.js` | Runs on claude.ai: adds the button, reads the chat box, shows the preview |
| `background.js` | Calls the API with your prompt and returns the improved version |
| `options.html` / `options.js` | Settings page for your API key and profile |

## Privacy and security

- Your API key is stored in your browser's local extension storage and is sent only to `api.anthropic.com`.
- Prompts go only to the API when you click Improve — nothing is logged or collected.
- Never commit your API key to this repo.

## Roadmap

- [ ] Keyboard shortcut (e.g. Ctrl/Cmd + Shift + I)
- [ ] Support ChatGPT and Gemini
- [ ] Prompt "modes": marketing, legal, coding, small business
- [ ] Prompt history with before/after
- [ ] Publish to the Chrome Web Store

## Contributing

Issues and pull requests welcome. If claude.ai changes its layout and the button stops finding the chat box, the selector to fix is at the top of `content.js`.

## License

MIT © 2026 Sumeet Kolindrekar
