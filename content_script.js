console.log("content script loaded")

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("received a message");
    if (msg.from === 'background' && msg.subject === 'fetchData') {
        console.log("in fetchdata");
      let data = document.querySelector('.e-content')?.innerText || 'No content found.';
      chrome.runtime.sendMessage({ from: 'content', subject: 'deliverData', data: data });
    }
  });
  