chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const url = tabs[0]?.url || '';
  document.getElementById("message").value = url;
});

document.getElementById("generate").addEventListener("click", async () => {
  const message = document.getElementById("message").value;

  if (!message.trim()) {
    alert("Please enter a message.");
    return;
  }

  // For now, just show a dummy "encrypted" link
  // Replace this later with real encryption + fetch to paste.sitehost
  const dummyLink = `https://paste.sitehost.nz/#${btoa(message)}`;
  document.getElementById("output").innerHTML = `<a href="${dummyLink}" target="_blank">${dummyLink}</a>`;
});
