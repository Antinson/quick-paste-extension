let currentTabURL = "";

// Utility: log errors to console and UI
function logError(err) {
  console.error(err);
  const output = document.getElementById("output");
  if (output) output.textContent = "Error: " + (err.message || err);
}

// On popup load: get the current tab URL and message from background script
document.addEventListener("DOMContentLoaded", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentTabURL = tab.url || "";
  const msgField = document.getElementById("message");
  if (msgField) msgField.value = currentTabURL;

  chrome.runtime.sendMessage({ type: "getReplyMessage", tabId: tab.id }, (response) => {
    try {
      const raw = response || "";
      const message = raw.split("| Support")[0].trim();
      if (message) msgField.value = message;
    } catch (err) {
      logError(err);
    }
  });
});

// POST to Hastebin-like paste server
async function generatePaste(message) {
  const res = await fetch("http://paste.anthony-sh.co.nz/documents", {
    method: "POST",
    headers: {
      "Accept": "application/json, text/plain, */*; q=0.01",
      "Content-Type": "text/plain; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest"
    },
    body: message + "\n"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  if (!json.key) throw new Error("Missing paste key in response");
  return json.key;
}

// Handle "Generate" button click
document.getElementById("generate").addEventListener("click", async () => {
  const message = document.getElementById("message").value.trim();
  if (!message) return alert("Please enter or extract a message first.");

  try {
    const key = await generatePaste(message);
    const pasteUrl = `http://paste.anthony-sh.co.nz/${key}`;
    const formatted = `Ticket\n${currentTabURL}\n\nDraft\n${pasteUrl}`.trim();

    document.getElementById("output").innerHTML = `
      <pre>${formatted}</pre>
      <button id="copyBtn">Copy to Clipboard</button>
    `;
    document.getElementById("copyBtn").addEventListener("click", () => {
      navigator.clipboard.writeText(formatted);
    });
  } catch (err) {
    logError(err);
  }
});
