chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getReplyMessage" && message.tabId) {
    chrome.scripting.executeScript({
      target: { tabId: message.tabId },
      func: () => {
        const el = document.getElementById("replymessage");
        return el ? el.value : "";
      }
    }, (results) => {
      if (chrome.runtime.lastError || !results?.length) {
        sendResponse("");
        return;
      }
      sendResponse(results[0].result);
    });
    return true; // required to use async sendResponse
  }
});
