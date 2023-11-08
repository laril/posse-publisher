let popupWindowId = null;
let originalTabId = null; // This will hold the ID of the tab where the user clicked the browser action

chrome.browserAction.onClicked.addListener(() => {
  if (popupWindowId) {
    chrome.windows.update(popupWindowId, { focused: true });
    return;
  }

  // Save the original tab ID before creating the new window
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    originalTabId = tabs[0].id; // Save the original tab ID

    // Now create the new window
    chrome.windows.create({
      url: chrome.runtime.getURL('popup.html'),
      type: 'popup',
      width: 800,
      height: 600
    }, function(window) {
      popupWindowId = window.id;
    });
  });
});

// When the popup is ready, fetch content from the original tab
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.from === 'popup' && request.subject === 'requestData') {
    // Make sure originalTabId is set and refers to a valid tab
    if (originalTabId) {
      fetchContentFromPage(originalTabId, sendResponse);
    } else {
      console.error('Original tab ID not set.');
    }
    return true; // Keep the message channel open to send a response later
  }
});

// Fetch the content from the saved original tab ID
function fetchContentFromPage(tabId, callback) {
  chrome.tabs.sendMessage(tabId, { from: 'background', subject: 'fetchData' }, function(response) {
    if (chrome.runtime.lastError) {
      // Handle any errors that might occur
      console.error('Error:', chrome.runtime.lastError.message);
    } else {
      // Use the response if available
      callback(response);
    }
  });
}

// Clear the IDs when the window is closed
chrome.windows.onRemoved.addListener((closedWindowId) => {
  if (closedWindowId === popupWindowId) {
    popupWindowId = null;
    originalTabId = null; // Reset the original tab ID as well
  }
});
