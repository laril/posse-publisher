// Define a list of networks and their respective character limits
const networks = [
  { name: 'Mastodon', charLimit: 500 },
  { name: 'Bluesky', charLimit: 300 },
  { name: 'Twitter', charLimit: 240 },
  { name: 'Facebook', charLimit: 63206 } // Example character limit for Facebook
  // Add more networks here as needed
];


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
  

  function splitTextIntoPosts(text, maxLength) {
    const sentences = text.match(/[^.!?]+[.!?]*\s*/g) || [text]; // Split text into sentences including trailing space
    let posts = [];
    let currentPost = '';
  
    sentences.forEach(sentence => {
      // Check if the sentence itself is longer than the maxLength
      if (sentence.length > maxLength) {
        // If the current post isn't empty, push it to posts before handling the long sentence
        if (currentPost.trim() !== '') {
          posts.push(currentPost.trim());
          currentPost = '';
        }
        // Split the long sentence into maxLength chunks
        let start = 0;
        while (start < sentence.length) {
          let end = start + maxLength;
          let chunk = sentence.slice(start, end);
          // Try to avoid splitting words by moving the end to the last space
          if (end < sentence.length) {
            let lastSpace = chunk.lastIndexOf(' ');
            if (lastSpace > 0) {
              end = start + lastSpace;
              chunk = sentence.slice(start, end);
            }
          }
          posts.push(chunk.trim());
          start = end;
        }
      } else {
        // Add sentence to current post if it doesn't exceed maxLength
        if ((currentPost + sentence).length <= maxLength) {
          currentPost += sentence;
        } else {
          // Otherwise, push current post and start a new one
          posts.push(currentPost.trim());
          currentPost = sentence;
        }
      }
    });
  
    // Add the remaining current post if it's not empty
    if (currentPost.trim() !== '') {
      posts.push(currentPost.trim());
    }
  
    // Add the indicator to each post
    return posts.map((post, index) => {
      // Calculate the length of the indicator text (e.g., " (1/5)")
      const indicatorLength = ` (${index + 1}/${posts.length})`.length;
      // If the post plus indicator is too long, trim the post to fit
      if (post.length + indicatorLength > maxLength) {
        post = post.slice(0, maxLength - indicatorLength - 1); // -1 for space before indicator
      }
      return post + ` (${index + 1}/${posts.length})`;
    });
  }
    
  document.addEventListener('DOMContentLoaded', () => {
    // ... Existing tab switch logic ...

    // Hook into the button that triggers post splitting
    document.getElementById('post-to-social').addEventListener('click', () => {
        const text = document.getElementById('edit-post').value;
        displaySplitPosts(text, 500, 'mastodon-posts');
        displaySplitPosts(text, 300, 'bluesky-posts');
        displaySplitPosts(text, 240, 'twitter-posts');
        displaySplitPosts(text, 10000, 'facebook-posts');
        displaySplitPosts(text, 5000, 'linkedin-posts');



    });
});

// The splitTextIntoPosts function from the previous step goes here

function displaySplitPosts(text, maxLength, containerId) {
  const posts = splitTextIntoPosts(text, maxLength);
  const container = document.getElementById(containerId);
  container.innerHTML = ''; // Clear previous content

  // Create a container for each post and textarea
  posts.forEach((post, index) => {
      const postContainer = document.createElement('div');
      postContainer.classList.add('flex', 'mb-4', 'items-center'); // Tailwind classes for flex layout

      const textarea = document.createElement('textarea');
      textarea.value = post;
      textarea.classList.add('w-1/2', 'p-2', 'border', 'rounded'); // Tailwind classes for 50% width and styling
      textarea.rows = 4; // Adjust the number of rows as needed
      textarea.addEventListener('input', updateCharacterCount); // Add input listener to update character count
      textarea.setAttribute('data-maxlength', maxLength);

      const charCount = document.createElement('span');
      charCount.classList.add('ml-4'); // Tailwind class for margin-left
      charCount.textContent = `${post.length}/${maxLength}`; // Initial character count

      // Append the textarea and character count to the post container
      postContainer.appendChild(textarea);
      postContainer.appendChild(charCount);

      // Append the post container to the main container
      container.appendChild(postContainer);
  });
}

// Function to update character count next to textarea
function updateCharacterCount(event) {
  const textarea = event.target;
  const charCount = textarea.nextElementSibling; // Assumes the character count span is immediately after the textarea
  const maxLength = textarea.getAttribute('data-maxlength'); // Assumes a data-maxlength attribute with the max length set
  charCount.textContent = `${textarea.value.length}/${maxLength}`;
}

  