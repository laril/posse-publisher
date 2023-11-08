let popupWindowId = null;

chrome.browserAction.onClicked.addListener(() => {
  if (popupWindowId) {
    // If the popup window is already created, bring it to focus.
    chrome.windows.update(popupWindowId, { focused: true });
    return;
  }

  // Create a new window with the specified dimensions.
  chrome.windows.create({
    url: chrome.runtime.getURL('popup.html'),
    type: 'popup',
    width: 800,
    height: 600
  }, (newWindow) => {
    // Store the ID of the created window.
    popupWindowId = newWindow.id;
  });
});

// When the window is closed, reset popupWindowId so a new window can be created next time.
chrome.windows.onRemoved.addListener((closedWindowId) => {
  if (closedWindowId === popupWindowId) {
    popupWindowId = null;
  }
});

// This function sends a message to the content script to fetch data from the current tab.
function fetchContentFromActiveTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return; // No active tab found.
    let activeTabId = tabs[0].id;
    console.log("sending message activetabid", activeTabId);

    chrome.tabs.sendMessage(activeTabId, { from: 'background', subject: 'fetchData' });
  });
}

// Listen for a request from the popup window to fetch data.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.from === 'popup' && request.subject === 'requestData') {
    console.log("sending request to fetch");
    fetchContentFromActiveTab();
    return true; // Keep the message channel open to send a response later.
  }
});
