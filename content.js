// Content script: runs on claude.ai, adds the "Improve" button and the preview panel.
// SECURITY: model output is always inserted with textContent, never innerHTML.

(() => {
  if (window.__promptPolishLoaded) return;
  window.__promptPolishLoaded = true;

  // Claude.ai's chat box is a contenteditable editor. If this selector stops
  // working after a site update, this is the line to fix.
  const EDITOR_SELECTOR = 'div[contenteditable="true"]';

  const button = document.createElement("button");
  button.className = "pp-button";
  button.textContent = "✨ Improve";
  button.title = "Improve the prompt in the chat box";
  document.body.appendChild(button);

  button.addEventListener("click", onImprove);

  function getEditor() {
    return document.querySelector(EDITOR_SELECTOR);
  }

  async function onImprove() {
    const editor = getEditor();
    const original = editor?.innerText.trim();

    if (!editor) return toast("Couldn't find the chat box on this page.");
    if (!original) return toast("Type a prompt first, then click Improve.");

    setLoading(true);
    try {
      const res = await chrome.runtime.sendMessage({ type: "IMPROVE", prompt: original });
      if (!res?.ok) throw new Error(res?.error || "Something went wrong.");
      showPanel(original, res.improved, res.why);
    } catch (err) {
      toast(err.message);
    } finally {
      setLoading(false);
    }
  }

  function showPanel(original, improved, why) {
    closePanel();

    const panel = document.createElement("div");
    panel.className = "pp-panel";

    panel.append(
      section("Your prompt", original, "pp-before"),
      section("Improved", improved, "pp-after"),
    );
    if (why) panel.append(section("Why it's better", why, "pp-why"));

    const actions = document.createElement("div");
    actions.className = "pp-actions";

    const useBtn = document.createElement("button");
    useBtn.className = "pp-primary";
    useBtn.textContent = "Use it";
    useBtn.addEventListener("click", () => {
      replaceEditorText(improved);
      closePanel();
    });

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Keep mine";
    cancelBtn.addEventListener("click", closePanel);

    actions.append(cancelBtn, useBtn);
    panel.append(actions);
    document.body.appendChild(panel);
  }

  function section(label, text, cls) {
    const wrap = document.createElement("div");
    wrap.className = `pp-section ${cls}`;
    const h = document.createElement("div");
    h.className = "pp-label";
    h.textContent = label;
    const body = document.createElement("div");
    body.className = "pp-text";
    body.textContent = text;
    wrap.append(h, body);
    return wrap;
  }

  function replaceEditorText(text) {
    const editor = getEditor();
    if (!editor) return toast("Chat box disappeared — copy the text manually.");
    editor.focus();
    document.execCommand("selectAll", false);
    // insertText goes through the editor's own input handling, so the site sees the change.
    document.execCommand("insertText", false, text);
  }

  function closePanel() {
    document.querySelector(".pp-panel")?.remove();
  }

  function setLoading(on) {
    button.disabled = on;
    button.textContent = on ? "Improving…" : "✨ Improve";
  }

  function toast(message) {
    const t = document.createElement("div");
    t.className = "pp-toast";
    t.textContent = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 4000);
  }
})();
