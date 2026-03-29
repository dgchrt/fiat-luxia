(async function() {
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

    // Function to remove the inversion style
    function removeInversionStyle() {
        const existingStyle = document.getElementById("fiat-luxia-style");
        if (existingStyle) {
            existingStyle.remove();
            console.log("Fiat Luxia: Inversion style removed.");
        }
    }

    // Function to apply the inversion style
    function applyInversionStyle() {
        removeInversionStyle(); // Ensure no old style is present before applying new one
        console.log("Fiat Luxia: Applying inversion...");
        const style = document.createElement('style');
        style.id = "fiat-luxia-style";
        style.textContent = `
            /* Invert the whole page */
            html {
                filter: invert(1) hue-rotate(180deg) !important;
                background-color: white !important;
            }
            /* Re-invert media so they look normal again */
            img, video, canvas, [style*="background-image"] {
                filter: invert(1) hue-rotate(180deg) !important;
            }
        `;
        document.documentElement.appendChild(style);
    }

    // Main inversion logic
    async function applyInversionLogic() {
        removeInversionStyle(); // Always start clean

        const currentUrl = window.location.href;
        const baseUrl = getBaseUrl(currentUrl);

        if (!baseUrl) {
            console.log("Fiat Luxia: Could not determine base URL. Skipping.");
            return;
        }

        const result = await browser.storage.local.get({ siteSettings: {} });
        const siteSettings = result.siteSettings;
        const currentSiteMode = siteSettings[baseUrl] || "auto"; // Default to auto

        if (currentSiteMode === "disabled") {
            console.log(`Fiat Luxia: Site ${baseUrl} is disabled. Skipping inversion.`);
            return;
        } else if (currentSiteMode === "enabled") {
            console.log(`Fiat Luxia: Site ${baseUrl} is force-enabled. Applying inversion.`);
            applyInversionStyle();
            return;
        }

        // If mode is "auto", proceed with luminance detection
        let targetElement = null;
        let backgroundColor = null;

        // Try to get background from html element first
        const htmlStyle = window.getComputedStyle(document.documentElement);
        const htmlBgColor = htmlStyle.backgroundColor;
        const htmlRgb = htmlBgColor.match(/\d+/g);

        if (htmlRgb && htmlRgb.length >= 3) {
            const isHtmlTransparent = htmlRgb.length === 4 && parseFloat(htmlRgb[3]) === 0;
            if (!isHtmlTransparent) {
                targetElement = document.documentElement;
                backgroundColor = htmlBgColor;
            }
        }

        // If html background is transparent or not found, try body
        if (!targetElement) {
            const bodyStyle = window.getComputedStyle(document.body);
            const bodyBgColor = bodyStyle.backgroundColor;
            const bodyRgb = bodyBgColor.match(/\d+/g);

            if (bodyRgb && bodyRgb.length >= 3) {
                const isBodyTransparent = bodyRgb.length === 4 && parseFloat(bodyRgb[3]) === 0;
                if (!isBodyTransparent) {
                    targetElement = document.body;
                    backgroundColor = bodyBgColor;
                }
            }
        }

        if (targetElement && backgroundColor) {
            const rgb = backgroundColor.match(/\d+/g);
            const r = parseInt(rgb[0]);
            const g = parseInt(rgb[1]);
            const b = parseInt(rgb[2]);

            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            if (luminance < 100) {
                console.log("Fiat Luxia: Darkness detected. Applying inversion.");
                applyInversionStyle();
            } else {
                console.log("Fiat Luxia: Site is already bright. Resting on the seventh day.");
            }
        } else {
            console.log("Fiat Luxia: No suitable non-transparent background found on html or body. Skipping inversion.");
        }
    }

    // Initial application of the logic
    applyInversionLogic();

    // Listen for messages from the popup
    browser.runtime.onMessage.addListener(function(message, sender, sendResponse) {
        if (message.action === "updateMode") {
            // Re-run the logic with the new mode
            applyInversionLogic();
        }
    });
})();