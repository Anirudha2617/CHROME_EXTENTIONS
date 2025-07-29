console.log("Extension: YouTube Audio & Text Focus script loaded.");

// Default settings for hiding elements. These are the initial states
// before settings are loaded from storage.
let currentSettings = {
  hideThumbnails: true, // Default to hiding thumbnails
  hideVideo: false, // Default to NOT hiding the video player on watch page
  hideView: false, // Default to NOT hiding the entire YouTube content feed/homepage
};

// Function to generate and inject the CSS based on current settings
function applyCssRules() {
  console.log(
    "Extension: applyCssRules() function called with settings:",
    currentSettings
  );

  let cssToInject = "";

  // CSS for hiding thumbnails
  if (currentSettings.hideThumbnails) {
    const thumbnailSelectors = [
      "ytd-thumbnail",
      "ytd-rich-item-renderer #thumbnail",
      "ytd-video-renderer #thumbnail",
      "ytd-compact-video-renderer #thumbnail",
      "ytd-playlist-video-renderer #thumbnail",
      "ytd-grid-video-renderer #thumbnail",
      "ytd-shelf-renderer ytd-thumbnail",
      "ytd-reel-item-renderer #thumbnail",
      "ytd-playlist-thumbnail",
      "ytd-thumbnail img",
      "ytd-thumbnail picture",
      "ytd-thumbnail .yt-img-shadow",
      "ytd-thumbnail #img",
      // More generic selectors - use with caution as they might hide non-thumbnail images
      "img[src*='i.ytimg.com/vi/']", // Targets img tags with YouTube video thumbnail URLs
      "[style*='background-image: url(\"https://i.ytimg.com/vi/']", // Targets elements with YouTube video thumbnail background images
    ];
    thumbnailSelectors.forEach((selector) => {
      cssToInject += `${selector} { opacity: 0 !important; pointer-events: none !important; }\n`;
    });
    console.log("Extension: Thumbnail hiding CSS included.");
  }

  // CSS for hiding the main video player area on watch pages
  if (currentSettings.hideVideo) {
    const videoPlayerSelectors = [

        //   "ytd-watch-flexy[flexy_] #player-container.ytd-watch-flexy",
    //   ".html5-video-player",

    "video.html5-main-video",
    //   "#related",
    //   "#comments",
    //   "#player.ytd-watch-flexy", // The entire player column
    //   "ytd-expander", // Description expander
    //   "#below", // Container below player for description, comments, etc.
    //   "#columns.ytd-watch-flexy #secondary", // Right sidebar with suggestions
    //   "#masthead-container", // Top YouTube header (optional, but good for full focus)
    //   "#meta", // Video metadata like title, channel info
    //   "#actions", // Like/dislike, share buttons
    ];
    videoPlayerSelectors.forEach((selector) => {
        cssToInject += `${selector} { opacity: 0 !important; }\n`;
      // Specific rules for some selectors for complete hiding
    //   if (selector.includes("player-container") || selector.includes(".html5-video-player") || selector.includes("video.html5-main-video")) {
    //     cssToInject += `${selector} { opacity: 0 !important; }\n`;
    //   }
    });
    console.log("Extension: Video player hiding CSS included.");
  }

  // CSS for hiding entire content view (homepage, search results, subscriptions feed)
  if (currentSettings.hideView) {
    const viewSelectors = [
      "#contents", // Main content grid/list on homepage, search
    //   "ytd-rich-grid-renderer", // Another common container for content
    //   "ytd-two-column-browse-results-renderer", // For channels and other browse pages
    //   "ytd-browse[page-subtype='home'] #primary", // Specific for homepage primary content
    //   "ytd-browse[page-subtype='subscriptions'] #primary", // Specific for subscriptions page primary content
    //   "ytd-rich-section-renderer:has(a[href*='/shorts'])", // YouTube Shorts sections
    //   "#feed #contents", // Some specific feeds
    //   "#page-manager.ytd-app:not([video-id]) #columns.ytd-page-manager", // Hide columns on non-video pages
    //   // Additional elements for a cleaner, hidden view
    //   "#promo-container", // Promos/ads
    //   "#sustainability-text", // Footer text
    //   "#voice-search-button", // Voice search button if not needed
    //   "#search-form", // Search bar (if you want to completely remove search)
    //   "ytd-guide-renderer", // Left navigation guide
    //   "ytd-mini-guide-renderer", // Mini guide on the left
    //   "#channel-header", // Channel header on channel pages
    //   "#tabs", // Tabs on channel pages (Videos, Playlists, Community, etc.)
    ];
    viewSelectors.forEach((selector) => {
        cssToInject += `${selector} { display: none !important; }\n`;
    });

    cssToInject += `
      ytd-watch-flexy:not([flexy_]) #player-container.ytd-watch-flexy {
          display: block !important; /* Make sure player is visible if this is a watch page and hideView is true, but hideVideo is false */
      }
    `;

    console.log("Extension: General view hiding CSS included.");
  }

  // Inject or update the style tag
  let styleTag = document.getElementById("youtube-audio-focus-style");
  if (!styleTag) {
    styleTag = document.createElement("style");
    styleTag.id = "youtube-audio-focus-style";
    (document.head || document.documentElement).appendChild(styleTag);
    console.log("Extension: Created and appended new style tag.");
  }
  styleTag.textContent = cssToInject;
  console.log("Extension: Style tag content updated.");
}

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "applySettings") {
    console.log(
      "Extension: Received 'applySettings' message from popup.",
      request.settings
    );
    currentSettings.hideThumbnails = request.settings.hideThumbnails;
    currentSettings.hideVideo = request.settings.hideVideo;
    currentSettings.hideView = request.settings.hideView;
    applyCssRules(); // Re-apply all rules based on new settings
  }
});

// Use a MutationObserver to detect changes in the DOM
const observer = new MutationObserver((mutations) => {
  let changesDetected = false;
  // A simple check to see if significant DOM changes occurred
  // This helps re-apply rules if YouTube dynamically loads content
  for (const mutation of mutations) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      changesDetected = true;
      break;
    }
  }

  if (changesDetected) {
    // console.log("Extension: DOM changes detected, re-applying CSS rules."); // Uncomment for detailed debugging
    applyCssRules();
  }
});

// Function to start observing the document body
function startObserverWhenReady() {
  if (document.body) {
    console.log(
      "Extension: Document body available, starting MutationObserver."
    );
    // Observe the body for childList and subtree changes to catch new content loading
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    console.log(
      "Extension: Document body not yet available, retrying observer start..."
    );
    setTimeout(startObserverWhenReady, 50); // Retry after a short delay
  }
}

// Load initial settings from storage and apply them
chrome.storage.local.get(["hideThumbnails", "hideVideo", "hideView"], (result) => {
  // Set initial state based on storage.
  // If a setting is not found in storage, use the default value defined in currentSettings.
  currentSettings.hideThumbnails = result.hideThumbnails !== undefined ? result.hideThumbnails : currentSettings.hideThumbnails;
  currentSettings.hideVideo = result.hideVideo !== undefined ? result.hideVideo : currentSettings.hideVideo;
  currentSettings.hideView = result.hideView !== undefined ? result.hideView : currentSettings.hideView;

  console.log(
    "Extension: Initial settings loaded from storage:",
    currentSettings
  );
  applyCssRules(); // Apply initial rules immediately
});

// Call the function to start observing
startObserverWhenReady();
