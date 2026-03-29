(function () {
    var browser = browser || chrome;

    function getBaseUrl(url) {
        try { return new URL(url).origin; } catch (e) { return null; }
    }

    function removeInversionStyle() {
        const existingStyle = document.getElementById("fiat-luxia-style");
        if (existingStyle) existingStyle.remove();
    }

    function applyInversionStyle() {
        removeInversionStyle();
        const style = document.createElement('style');
        style.id = "fiat-luxia-style";

        style.textContent = `
            html { filter: invert(1) hue-rotate(180deg) !important; background-color: white !important; }
            img, video, canvas, [style*="background-image"] { filter: invert(1) hue-rotate(180deg) !important; }
        `;

        document.documentElement.appendChild(style);
    }

    function applyInversionLogic() {
        removeInversionStyle();
        browser.storage.local.get({ siteSettings: {} }, processSettings);
    }

    function processSettings(result) {
        const baseUrl = getBaseUrl(window.location.href);
        if (!baseUrl) return;

        const mode = result.siteSettings[baseUrl] || "auto";

        if (mode === "disabled") return;
        if (mode === "enabled") {
            applyInversionStyle();
            return;
        }

        detectLuminance();
    }

    function detectLuminance() {
        const target = findThemeElement(document.body);
        if (!target) return;

        const style = window.getComputedStyle(target);
        const bg = style.backgroundColor;
        const rgb = bg.match(/\d+/g);

        if (rgb && rgb.length >= 3) {
            const isTransparent = rgb.length === 4 && parseFloat(rgb[3]) === 0;
            if (isTransparent) return;

            const r = parseInt(rgb[0]), g = parseInt(rgb[1]), b = parseInt(rgb[2]);
            const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;

            if (luminance < 100) {
                console.log("Fiat Luxia: Darkness confirmed at", luminance);
                applyInversionStyle();
            }
        }
    }

    function findThemeElement(el) {
        if (!el) {
            return null;
        }

        const bg = window.getComputedStyle(el).backgroundColor;

        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
            return el;
        }

        return findThemeElement(el.firstElementChild);
    }

    function initWatcher() {
        const observer = new MutationObserver(function (mutations) {
            browser.storage.local.get({ siteSettings: {} }, function(result) {
                const baseUrl = getBaseUrl(window.location.href);
                const mode = result.siteSettings[baseUrl] || "auto";
                if (mode !== "disabled" && !document.getElementById("fiat-luxia-style")) {
                    detectLuminance();
                }
            });
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    initWatcher();
    applyInversionLogic();

    browser.runtime.onMessage.addListener(function (msg) {
        if (msg.action === "updateMode") applyInversionLogic();
    });
})();
