let currentTabURL = "";

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  currentTabURL = tabs[0]?.url || '';
  document.getElementById("message").value = currentTabURL;
});

document.getElementById("generate").addEventListener("click", () => {
  const message = document.getElementById("message").value.trim();
  if (!message) {
    alert("Please enter a message.");
    return;
  }

  // Fake paste link for now
  const pasteLink = `https://paste.sitehost.nz/#${btoa(message)}`;

  const formatted = `
Ticket  
${currentTabURL}

Draft  
${pasteLink}
  `.trim();

  document.getElementById("output").innerHTML = `
    <pre>${formatted}</pre>
    <button id="copyBtn">Copy to Clipboard</button>
  `;

  document.getElementById("copyBtn").addEventListener("click", () => {
    navigator.clipboard.writeText(formatted);
  });
});
