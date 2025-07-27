// content.js

console.log("Extension: YouTube Audio & Text Focus script loaded.");

// Default settings for hiding elements
let currentSettings = {
    hideThumbnails: true, // Default to hiding thumbnails
    hideVideo: false      // Default to NOT hiding the video player
};

// Function to generate and inject the CSS based on current settings
function applyCssRules() {
    console.log("Extension: applyCssRules() function called with settings:", currentSettings);

    let cssToInject = '';

    // CSS for hiding thumbnails
    if (currentSettings.hideThumbnails) {
        // IMPORTANT: Make these selectors as specific as possible to avoid hiding too much.
        // We are targeting the elements that *contain* the thumbnails, or the specific image/picture elements within them.
        const thumbnailSelectors = [
            // Standard video thumbnail containers on homepage, search, recommendations
            "ytd-thumbnail",
            "ytd-rich-item-renderer #thumbnail", // For richer grid items
            "ytd-video-renderer #thumbnail",
            "ytd-compact-video-renderer #thumbnail",
            "ytd-playlist-video-renderer #thumbnail", // For videos within playlists
            "ytd-grid-video-renderer #thumbnail",
            "ytd-shelf-renderer ytd-thumbnail", // Thumbnails within shelves (e.g., "From your subscriptions")
            "ytd-reel-item-renderer #thumbnail", // For Shorts thumbnails
            "ytd-playlist-thumbnail", // Playlist cover thumbnails

            "ytd-thumbnail img",
            "ytd-thumbnail picture",
            "ytd-thumbnail .yt-img-shadow",
            "ytd-thumbnail #img",

            "img[src^='https://i.ytimg.com/vi/']",
            "[style*='background-image: url(\"https://i.ytimg.com/vi/']",


        ];
        thumbnailSelectors.forEach(selector => {
            cssToInject += `${selector} { opacity: 0 !important; }\n`;
        });
        console.log("Extension: Thumbnail hiding CSS included.");
    }

    // Inject or update the style tag for thumbnails
    let styleTag = document.getElementById('youtube-audio-focus-style');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'youtube-audio-focus-style';
        (document.head || document.documentElement).appendChild(styleTag);
        console.log("Extension: Created and appended new style tag for thumbnails.");
    }
    styleTag.textContent = cssToInject;
    console.log("Extension: Thumbnail style tag content updated.");

    // Call the dedicated function for video player visibility
    handleVideoPlayerVisibility();
}

// Function to handle the visibility of the main video player, including border and grid
function handleVideoPlayerVisibility() {
    const videoPlayer = document.querySelector('video.html5-main-video');
    if (videoPlayer) {
        if (currentSettings.hideVideo) {
            videoPlayer.style.opacity = '0'; // Makes the video content transparent
            console.log("Extension: Video player content hidden with border and grid.");
        } 
    } else {
        console.log("Extension: Video player element not found yet.");
    }
}


// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "applySettings") {
        console.log("Extension: Received 'applySettings' message from popup.", request.settings);
        // Update both hideThumbnails and hideVideo settings
        currentSettings.hideThumbnails = request.settings.hideThumbnails;
        currentSettings.hideVideo = request.settings.hideVideo;
        applyCssRules(); // Apply new rules immediately (which now also calls handleVideoPlayerVisibility)
    }
});

// Use a MutationObserver to detect changes in the DOM
const observer = new MutationObserver(mutations => {
    let changesDetected = false;
    mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if added nodes are within the main content area or not core UI
            // This is a more advanced optimization to avoid re-applying for every tiny change
            // For now, re-applying if any new nodes are added.
            changesDetected = true;
        } else if (mutation.type === 'subtree') {
            changesDetected = true;
        }
    });
    if (changesDetected) {
        // console.log("Extension: DOM changes detected, re-applying CSS rules."); // Can be noisy
        applyCssRules(); // Re-apply rules to new elements (this will also re-check video visibility)
    }
});

// Function to start observing the document body
function startObserverWhenReady() {
    if (document.body) {
        console.log("Extension: Document body available, starting MutationObserver.");
        // Observe the body for childList and subtree changes to catch new content loading
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        console.log("Extension: Document body not yet available, retrying observer start...");
        setTimeout(startObserverWhenReady, 50); // Retry after a short delay
    }
}

// Load initial settings from storage and apply them
chrome.storage.local.get(['hideThumbnails', 'hideVideo'], (result) => {
    // Set initial state based on storage, default to true for thumbnails, false for video
    currentSettings.hideThumbnails = result.hideThumbnails !== false;
    currentSettings.hideVideo = result.hideVideo === true; // Only hide video if explicitly true
    console.log("Extension: Initial settings loaded from storage:", currentSettings);
    applyCssRules(); // Apply initial rules
});

// Call the function to start observing
startObserverWhenReady();