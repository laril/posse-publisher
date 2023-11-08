// Define a list of networks and their respective character limits
const networks = [
  { name: 'Original', charLimit: Infinity }, // Adding Original here for unified handling  
  { name: 'Mastodon', charLimit: 500 },
  { name: 'Bluesky', charLimit: 300 },
  { name: 'Twitter', charLimit: 240 },
  { name: 'Facebook', charLimit: 63206 } // Example character limit for Facebook
  // Add more networks here as needed
];

document.addEventListener('DOMContentLoaded', () => {

  // Request the content from the active tab when the popup loads.
  chrome.runtime.sendMessage({ from: 'popup', subject: 'requestData' });


  // Generate the UI elements based on the networks configuration
  networks.forEach((network, index) => {
    // Create the tab button
    const tabButton = document.createElement('button');
    tabButton.innerText = network.name;
    tabButton.classList.add('tab-link', 'inline-block', 'p-4', 'rounded-t-lg', 'border-b-2', 'border-transparent', 'hover:text-gray-600', 'hover:border-gray-300');
    tabButton.dataset.tabTarget = `#content-${network.name.toLowerCase()}`;
    document.getElementById('tabs-container').appendChild(tabButton);

    // Create the content area
    const contentArea = document.createElement('div');
    contentArea.id = `content-${network.name.toLowerCase()}`;
    contentArea.classList.add('tab-content', 'p-4', 'hidden');
    if (network.name === 'Original') {
      contentArea.innerHTML = `
        <h1>RSS to Social Media Poster</h1>
        <div id="post-container">
          <!-- Processed post will be displayed here -->
        </div>
        <textarea id="edit-post" placeholder="Edit your post here..." class="w-full p-2 border rounded"></textarea>
        <button id="post-to-social" class="mt-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Post to Social Media
        </button>
      `;
    } else {
      contentArea.innerHTML = `<h2 class="text-lg font-semibold mb-2">${network.name} Posts</h2><div id="${network.name.toLowerCase()}-posts"></div>`;
    }
    document.getElementById('content-container').appendChild(contentArea);

    // Add click event listener to tab button
    tabButton.addEventListener('click', () => handleTabClick(tabButton, index));
  });


  // Initialize the first tab as active
  if (networks.length > 0) {
    handleTabClick(document.querySelectorAll('.tab-link')[0], 0);
  }

  // Listen for the post button click if it exists
  const postButton = document.getElementById('post-to-social');
  if (postButton) {
    postButton.addEventListener('click', handlePostButtonClick);
  }
});


// Function to handle "Post" button clicks
function handlePostButtonClick() {
  const text = document.getElementById('edit-post').value;
  // Loop through networks, skipping the Original, and display split posts
  console.log("clickeeed")
  networks.forEach((network) => {
    if (network.name !== 'Original') {
      displaySplitPosts(text, network.charLimit, `${network.name.toLowerCase()}-posts`);
    }
  });
}

  // Handle the click event for tabs
  function handleTabClick(tabButton, index) {
    // Activate the clicked tab and deactivate others
    document.querySelectorAll('.tab-link').forEach(tab => {
      tab.classList.remove('active', 'text-blue-600', 'border-blue-600');
      tab.classList.add('hover:text-gray-600', 'hover:border-gray-300');
    });
    tabButton.classList.add('active', 'text-blue-600', 'border-blue-600');
    tabButton.classList.remove('hover:text-gray-600', 'hover:border-gray-300');

    // Show the corresponding content area and hide others
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    const contentId = tabButton.dataset.tabTarget.slice(1);
    document.getElementById(contentId).classList.remove('hidden');

    // If it's not the original tab, load the content for the clicked tab if not already loaded
    if (networks[index].name !== 'Original') {
      const text = document.getElementById('edit-post').value;
      displaySplitPosts(text, networks[index].charLimit, `${networks[index].name.toLowerCase()}-posts`);
    }
  }


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

function displaySplitPosts(text, maxLength, containerId) {
  console.log("fdas", text, maxLength, containerId )
  const posts = splitTextIntoPosts(text, maxLength);
  const container = document.getElementById(containerId);
  console.log("got container", container);
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