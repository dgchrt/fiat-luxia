(function() {
    var browser = browser || chrome;

    document.addEventListener('DOMContentLoaded', function () {
        const modeRadios = document.querySelectorAll('input[name="mode"]');
        const statusDiv = document.getElementById('status');

        function getBaseUrl(url) {
            try { return new URL(url).origin; } catch (e) { return null; }
        }

        browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            const baseUrl = getBaseUrl(tabs[0].url);

            browser.storage.local.get({ siteSettings: {} }, function (result) {
                const mode = result.siteSettings[baseUrl] || "auto";
                modeRadios.forEach(r => r.checked = (r.value === mode));
                statusDiv.textContent = `Mode for ${baseUrl}: ${mode}`;
            });
        });

        modeRadios.forEach(radio => {
            radio.addEventListener('change', onModeChange);
        });

        function onModeChange() {
            const newMode = this.value;

            browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
                saveNewSettings(tabs[0], newMode);
            });
        }

        function saveNewSettings(tab, newMode) {
            const baseUrl = getBaseUrl(tab.url);

            browser.storage.local.get({ siteSettings: {} }, function (result) {
                let settings = result.siteSettings;
                settings[baseUrl] = newMode;

                browser.storage.local.set({ siteSettings: settings }, function () {
                    notifyContentScript(tab, newMode, baseUrl);
                });
            });
        }

        function notifyContentScript(tab, newMode, baseUrl) {
            statusDiv.textContent = `Updated ${baseUrl} to ${newMode}`;
            browser.tabs.sendMessage(tab.id, { action: "updateMode", mode: newMode });
        }
    });
})();
