const fs = require('fs');
const path = require('path');
const package = require('./package.json');

const VERSION = package.version;
const TARGET = process.argv[2];
const BUILD_DIR = path.join(__dirname, 'build');

const baseManifest = {
    manifest_version: 3,
    name: "Fiat Luxia",
    version: VERSION,
    description: "Restores light to the dark corners of the web.",
    permissions: ["activeTab", "storage"],
    action: {
        default_popup: "popup.html",
        default_icon: { "128": "icon.png" }
    },
    content_scripts: [{
        matches: ["<all_urls>"],
        js: ["content.js"],
        run_at: "document_end"
    }],
    icons: { "128": "icon.png" }
};

let manifestContent;

switch (TARGET) {
    case 'firefox':
        manifestContent = {
            ...baseManifest,
            browser_specific_settings: {
                gecko: {
                    id: "fiat-luxia@dgchrt.gmail.com",
                    strict_min_version: "142.0",
                    data_collection_permissions: { required: ["none"] }
                }
            }
        };

        break;
    case 'generic':
        manifestContent = {
            ...baseManifest,
            host_permissions: ["<all_urls>"]
        };

        break;
    default:
        console.error("Unknown target.");
        process.exit(1);
}

if (!fs.existsSync(BUILD_DIR)) {
    fs.mkdirSync(BUILD_DIR);
}

fs.writeFileSync(
    path.join(BUILD_DIR, 'manifest.json'),
    JSON.stringify(manifestContent, null, 2)
);
