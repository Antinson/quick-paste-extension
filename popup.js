let currentTabURL = "";

// Utility: log errors to console and UI
function logError(err) {
  console.error(err);
  const output = document.getElementById("output");
  if (output) output.textContent = "Error: " + (err.message || err);
}

// On popup load: get the current tab URL and the reply message content
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tab = tabs[0];
  currentTabURL = tab?.url || "";
  const msgField = document.getElementById("message");
  if (msgField) msgField.value = currentTabURL;

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      const el = document.getElementById("replymessage");
      return el ? el.value : "";
    },
  }, (results) => {
    try {
      const raw = results?.[0]?.result || "";
      console.log("Raw result from page:", raw);
      const message = raw.split("| Support")[0].trim();
      if (message) msgField.value = message;
    } catch (err) {
      logError(err);
    }
  });
});

// Simplest Haste-style POST → returns the new key
async function generatePaste(message) {
  const res = await fetch("http://paste.anthony-sh.co.nz/documents", {
    method: "POST",
    headers: {
      "Accept":           "application/json, text/plain, */*; q=0.01",
      "Content-Type":     "text/plain; charset=UTF-8",
      "X-Requested-With":"XMLHttpRequest"
    },
    body: message + "\n"
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HTTP ${res.status}: ${text}`);
  }
  const json = await res.json();
  console.log("Paste response JSON:", json);
  if (!json.key) throw new Error("Missing paste key in response");
  return json.key;
}

// Handle "Generate" button click
const generateBtn = document.getElementById("generate");
generateBtn.addEventListener("click", async () => {
  const message = document.getElementById("message").value.trim();
  if (!message) {
    alert("Please enter or extract a message first.");
    return;
  }

  try {
    const key = await generatePaste(message);
    const pasteUrl = `http://paste.anthony-sh.co.nz/${key}`;

    const formatted = `
Ticket  
${currentTabURL}

Draft  
${pasteUrl}`.trim();

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
