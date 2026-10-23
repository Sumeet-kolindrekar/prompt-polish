const fields = ["apiKey", "profile", "model"];

chrome.storage.local.get(fields).then((saved) => {
  for (const f of fields) document.getElementById(f).value = saved[f] || "";
});

document.getElementById("save").addEventListener("click", async () => {
  const values = {};
  for (const f of fields) values[f] = document.getElementById(f).value.trim();
  await chrome.storage.local.set(values);
  const status = document.getElementById("status");
  status.textContent = "Saved ✓";
  setTimeout(() => (status.textContent = ""), 2000);
});
