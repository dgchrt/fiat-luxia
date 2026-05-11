![Fiat Luxia](./logo.png)

# Fiat Luxia

Fiat Luxia is a browser extension designed to enhance web readability by intelligently adjusting website themes. It aims to provide a more comfortable browsing experience by converting dark-themed websites to a lighter aesthetic.

Using the calculated Relative Luminance `(Y=0.2126R+0.7152G+0.0722B)`, this extension identifies websites with dark backgrounds and applies a smart inversion, transforming them into a light-themed environment.

"May it be a light to you in dark places, when all other lights go out". - Galadriel

# Features

- Automatic Detection: Automatically identifies dark-themed websites based on luminance.
- Smart Inversion: Inverts CSS while preserving the appearance of images and videos.
- Hue Preservation: Rotates the color wheel by 180° to maintain the site's original color scheme in its inverted form.
- Lightweight: Operates efficiently without background processes.

# Installation

## Official Install

- Firefox: Find the [Fiat Luxia](https://addons.mozilla.org/en-US/firefox/addon/fiat-luxia/) extension on Firefox Browser Add-Ons.

## Local Install

To install the extension locally for testing:

- Clone the repository: Download this repository to your local machine.
- Build the extension: Run `npm install && npm run build` to generate the extension files in the `dist` directory.
- Load the extension: Uncompress the appropriate file for your browser.

### Firefox

- Navigate to `about:debugging` in Firefox.
- Click "This Firefox" -> "Load Temporary Add-on...".
- Select the `manifest.json` file from the uncompressed folder.

### Generic (Chromium-based browsers)

- Navigate to `about:extensions` in your Chromium-based browser.
- Enable "Developer mode".
- Click "Load Unpacked" and select the uncompressed extension folder.

# License

Distributed under the MIT License. Use it to spread the light among those who need it.

Darkness must not the end be; it is simply a poor design choice disguised as a hipster trend, waiting to be corrected by the truth of light.
