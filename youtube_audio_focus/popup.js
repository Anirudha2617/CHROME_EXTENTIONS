// popup.js

document.addEventListener('DOMContentLoaded', () => {
    const toggleThumbnails = document.getElementById('toggleThumbnails');
    const toggleVideo = document.getElementById('toggleVideo');
    const applySettingsButton = document.getElementById('applySettings');

    // Load saved settings when the popup opens
    chrome.storage.local.get(['hideThumbnails', 'hideVideo'], (result) => {
        toggleThumbnails.checked = result.hideThumbnails !== false; // Default to true if not set
        toggleVideo.checked = result.hideVideo !== false; // Default to true if not set
    });

    // Function to send current settings to the content script
    function sendSettingsToContentScript() {
        const settings = {
            hideThumbnails: toggleThumbnails.checked,
            hideVideo: toggleVideo.checked
        };

        // Save settings to local storage
        chrome.storage.local.set(settings, () => {
            console.log('Popup: Settings saved:', settings);
        });

        // Send message to the active tab's content script
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, { action: "applySettings", settings: settings });
                console.log('Popup: Sent settings to content script for tab:', tabs[0].id);
            } else {
                console.warn('Popup: No active tab found to send message to.');
            }
        });
    }

    // Event listener for the Apply Settings button
    applySettingsButton.addEventListener('click', sendSettingsToContentScript);

    // Optional: Apply settings immediately when toggles change (without needing "Apply" button)
    // toggleThumbnails.addEventListener('change', sendSettingsToContentScript);
    // toggleVideo.addEventListener('change', sendSettingsToContentScript);
});
