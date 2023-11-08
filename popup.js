document.addEventListener('DOMContentLoaded', () => {
    // Request the content from the active tab when the popup loads.
    chrome.runtime.sendMessage({ from: 'popup', subject: 'requestData' });
  });
  
  // Listen for messages from the content script.
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.from === 'content' && message.subject === 'deliverData') {
      document.getElementById('edit-post').value = message.data || 'No content found.';
    }
  });
  