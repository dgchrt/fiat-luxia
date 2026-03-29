document.addEventListener('DOMContentLoaded', function() {
    const modeRadios = document.querySelectorAll('input[name="mode"]');
    const statusDiv = document.getElementById('status');

    // Function to get the base URL
    function getBaseUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.origin;
        } catch (e) {
            console.error("Invalid URL:", url);
            return null;
        }
    }

    // Update UI based on current site's status
    async function updateUI(currentUrl) {
        const baseUrl = getBaseUrl(currentUrl);
        if (!baseUrl) {
            modeRadios.forEach(radio => radio.disabled = true);
            statusDiv.textContent = "Cannot determine website URL.";
            return;
        }

        const result = await browser.storage.local.get({ siteSettings: {} });
        const siteSettings = result.siteSettings;
        const currentSiteMode = siteSettings[baseUrl] || "auto"; // Default to auto

        modeRadios.forEach(radio => {
            radio.checked = (radio.value === currentSiteMode);
            radio.disabled = false;
        });
        statusDiv.textContent = `Current mode for ${baseUrl}: ${currentSiteMode}`;
    }

    // Get current tab URL and update UI
    browser.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        const currentUrl = tabs[0].url;
        updateUI(currentUrl);
    });

    modeRadios.forEach(radio => {
        radio.addEventListener('change', async function() {
            const tabs = await browser.tabs.query({ active: true, currentWindow: true });
            const currentUrl = tabs[0].url;
            const baseUrl = getBaseUrl(currentUrl);

            if (!baseUrl) {
                statusDiv.textContent = "Error: Could not get base URL.";
                return;
            }

            const newMode = this.value;
            const result = await browser.storage.local.get({ siteSettings: {} });
            let siteSettings = result.siteSettings;

            siteSettings[baseUrl] = newMode;
            await browser.storage.local.set({ siteSettings: siteSettings });

            statusDiv.textContent = `Current mode for ${baseUrl}: ${newMode}`;

            // Send message to content script to update its state
            browser.tabs.sendMessage(tabs[0].id, { action: "updateMode", mode: newMode });
        });
    });
});