(function () {
  // Redirect any Shorts URL to the YouTube homepage
  if (window.location.pathname.startsWith('/shorts/')) {
    window.location.replace('https://www.youtube.com/');
    return; // Stop further execution
  }

  function hideYouTubeElements() {
    // Hide the main content container
    const contentContainer = document.querySelector('#contents');
    if (contentContainer) {
      contentContainer.style.display = 'none';
    }

    // Hide the YouTube Shorts section
    const shortsSections = document.querySelectorAll('ytd-rich-section-renderer:has(a[href*="/shorts"])');
    shortsSections.forEach((section) => {
      section.style.display = 'none';
    });
  }

  // Run the function when the page loads
  document.addEventListener('DOMContentLoaded', hideYouTubeElements);

  // Use Mutation Observer to handle dynamically loaded content
  const observer = new MutationObserver(hideYouTubeElements);
  observer.observe(document.body, { childList: true, subtree: true });
})();
