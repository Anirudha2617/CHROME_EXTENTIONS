// content.js

console.log("Extension: YouTube Audio & Text Focus script loaded.");

// Default settings for hiding elements
let currentSettings = {
    hideThumbnails: true, // Default to hiding thumbnails
    hideVideo: true      // Default to hiding the video player
};

// Function to generate and inject the CSS based on current settings
function applyCssRules() {
    console.log("Extension: applyCssRules() function called with settings:", currentSettings);

    let cssToInject = '';

    // CSS for hiding thumbnails
    if (currentSettings.hideThumbnails) {
        const thumbnailSelectors = [
            "ytd-thumbnail",
            "ytd-rich-item-renderer",
            "ytd-video-renderer",
            "ytd-compact-video-renderer",
            "ytd-playlist-video-renderer", // For videos within playlists
            "ytd-grid-video-renderer",
            "ytd-shelf-renderer", // For shelves like "From your subscriptions"
            "ytd-reel-item-renderer", // For Shorts thumbnails
            "ytd-playlist-thumbnail", // Playlist cover thumbnails

            // Specific targeting for actual image/visual content within thumbnails
            "ytd-thumbnail img", // Direct image within thumbnail
            "ytd-thumbnail picture", // Picture element within thumbnail
            "ytd-thumbnail .yt-img-shadow", // Common class for image shadows/placeholders
            "ytd-thumbnail #img", // ID often used for the image element
            "ytd-thumbnail #thumbnail", // ID often used for the thumbnail container itself

            // Broader image selectors to catch all image-type elements
            "img", // All <img> tags (might hide some non-thumbnail images, but requested to hide all image types)
            "picture", // All <picture> tags
            "[src^='https://i.ytimg.com/vi/']", // Elements with src starting with YouTube video thumbnail pattern
            "[style*='background-image: url(\"https://i.ytimg.com/vi/']" // Elements using YouTube thumbnails as background images
        ];
        thumbnailSelectors.forEach(selector => {
            cssToInject += `${selector} { display: none !important; }\n`;
        });
        console.log("Extension: Thumbnail hiding CSS included.");
    }

    // CSS for hiding the video player visuals (keep audio and controls)
    if (currentSettings.hideVideo) {
        const videoVisualSelectors = [
            "ytd-video-preview", // Hover previews
            ".html5-video-container", // The container holding the video element itself
            ".html5-main-video", // The main video element class
            ".ytp-large-play-button", // The large play button in the center
            ".ytp-cued-video-wrapper", // Overlay when video is cued
            ".ytp-backdrop", // Player backdrop
            ".ytp-tooltip", // Player tooltips (might hide useful ones, but generally visual)
            ".ytp-cards-button", // Info cards button (visual, not control)
            ".ytp-storyboard-frame", // Hover scrub previews
            ".ytp-hotkey-overlay", // Hotkey overlay
            ".ytp-suggestion-icon", // End screen suggestions
            ".ytp-player-content.ytp-iv-player-content" // Interactive video content overlay
        ];
        videoVisualSelectors.forEach(selector => {
            cssToInject += `${selector} { display: none !important; }\n`;
        });
        // Specific rule for the <video> tag to hide visuals but keep audio playing
        cssToInject += `
            video {
                visibility: hidden !important;
                width: 1px !important;
                height: 1px !important;
                position: absolute !important;
                top: -9999px !important;
                left: -9999px !important;
                pointer-events: none !important; /* Prevent interaction with hidden video */
            }
        `;
        console.log("Extension: Video player visuals hiding CSS included.");
    } else {
        // If video is NOT hidden, ensure the video element and its containers are visible
        cssToInject += `
            video {
                visibility: visible !important;
                width: auto !important; /* Let YouTube handle width/height for responsive */
                height: auto !important;
                position: static !important;
                top: auto !important;
                left: auto !important;
                pointer-events: auto !important;
            }
            /* Ensure the main video container and player are visible when video is unhidden */
            .html5-video-container,
            .html5-main-video,
            ytd-player {
                display: block !important; /* Or flex, depending on YouTube's default */
                visibility: visible !important;
                opacity: 1 !important;
            }
            /* Also ensure specific visual elements are shown if they were hidden */
            .ytp-large-play-button,
            .ytp-cued-video-wrapper,
            .ytp-backdrop,
            .ytp-tooltip,
            .ytp-cards-button,
            .ytp-storyboard-frame,
            .ytp-hotkey-overlay,
            .ytp-suggestion-icon,
            .ytp-player-content.ytp-iv-player-content {
                display: block !important; /* Or flex, based on their original display */
                visibility: visible !important;
                opacity: 1 !important;
            }
        `;
        console.log("Extension: Video player showing CSS included.");
    }

    // Ensure player controls remain visible regardless of hideVideo setting
    // These are explicitly set to visible to counteract any accidental hiding
    // or to ensure they are always present and correctly positioned.
    cssToInject += `
        .ytp-chrome-bottom,
        .ytp-chrome-top,
        .ytp-left-controls,
        .ytp-right-controls,
        .ytp-play-button,
        .ytp-mute-button,
        .ytp-volume-slider,
        .ytp-progress-bar-container,
        .ytp-time-display,
        .ytp-settings-button,
        .ytp-fullscreen-button,
        .ytp-miniplayer-button,
        .ytp-pip-button,
        .ytp-prev-button,
        .ytp-next-button,
        .ytp-progress-bar, /* Ensure progress bar itself is visible */
        .ytp-play-progress /* Ensure the red play progress is visible */
        {
            display: flex !important; /* Use flex for layout, or block if preferred */
            visibility: visible !important;
            opacity: 1 !important;
        }
        /* Ensure specific child elements of controls are also visible */
        .ytp-chrome-bottom *,
        .ytp-chrome-top * {
            visibility: visible !important;
            opacity: 1 !important;
        }
    `;
    console.log("Extension: Player controls showing CSS included.");


    // Inject or update the style tag
    let styleTag = document.getElementById('youtube-audio-focus-style');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'youtube-audio-focus-style';
        (document.head || document.documentElement).appendChild(styleTag);
        console.log("Extension: Created and appended new style tag.");
    }
    // Always update textContent to reflect current settings
    styleTag.textContent = cssToInject;
    console.log("Extension: Style tag content updated.");
}

// Listen for messages from the popup script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "applySettings") {
        console.log("Extension: Received 'applySettings' message from popup.", request.settings);
        currentSettings = request.settings;
        applyCssRules(); // Apply new rules immediately
    }
});

// Use a MutationObserver to detect changes in the DOM
const observer = new MutationObserver(mutations => {
    let changesDetected = false;
    mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            changesDetected = true;
        } else if (mutation.type === 'subtree') {
            changesDetected = true;
        }
    });
    if (changesDetected) {
        // console.log("Extension: DOM changes detected, re-applying CSS rules."); // Can be noisy
        applyCssRules(); // Re-apply rules to new elements
    }
});

// Function to start observing the document body
function startObserverWhenReady() {
    if (document.body) {
        console.log("Extension: Document body available, starting MutationObserver.");
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        console.log("Extension: Document body not yet available, retrying observer start...");
        setTimeout(startObserverWhenReady, 50); // Retry after a short delay
    }
}

// Load initial settings from storage and apply them
chrome.storage.local.get(['hideThumbnails', 'hideVideo'], (result) => {
    // Set initial state based on storage, default to true if not found
    currentSettings.hideThumbnails = result.hideThumbnails !== false;
    currentSettings.hideVideo = result.hideVideo !== false;
    console.log("Extension: Initial settings loaded from storage:", currentSettings);
    applyCssRules(); // Apply initial rules
});


// Call the function to start observing
startObserverWhenReady();
