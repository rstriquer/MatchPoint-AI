# AI Job Analysis Assistant

A browser extension designed to help software engineers analyze job postings efficiently using AI. By providing your own API keys, you can leverage the power of OpenAI or Google Gemini to evaluate job descriptions against your resume, technical stack, and career goals.

## Features

- **Multi-AI Support:** Seamlessly switch between Google Gemini and OpenAI.
- **Dynamic Model Loading:** Fetch and select specific models directly from the API.
- **Deep Resume Analysis:** Uses a specialized prompt to analyze job postings against your "Technical Skills Matrix" and "Employment History".
- **Privacy-First:** This extension does not have a backend server. All API calls are made directly from your browser to the AI providers.

## Getting Started

### Prerequisites
- A Google Gemini API Key.
- An OpenAI API Key.

### Installation
1. Clone this repository to your local machine.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the folder where you cloned this repository.

### Setup
1. Click on the extension icon in your toolbar.
2. Paste your **Google Gemini** and/or **OpenAI** API keys into the respective fields.
3. Click the **"Load Models"** buttons for the providers you intend to use.
4. Select your preferred model from the dropdown lists.
5. Paste your resume and custom analysis rules into the text areas.
6. Click **"Save Context"** to persist your settings locally.

## Security & Privacy
**Your privacy is our priority.** - **Local Storage:** All your data, including API keys and resume details, are stored locally on your machine using `chrome.storage.local`. 
- **No Tracking:** This extension does not track your activity, nor does it send any data to third-party servers other than the AI provider you select (OpenAI or Google).
- **Security Note:** Since your keys are stored locally, ensure your computer is secure. Never share your browser profile or extension storage data with untrusted parties.

## How to use
1. Navigate to any job posting page.
2. Open the extension popup.
3. Click **"Analyze with Gemini"** or **"Analyze with OpenAI"**.
4. The analysis results will be displayed directly in the extension popup.

## Contributing
We welcome contributions! Feel free to open issues or submit pull requests to improve the extension.

## License
This project is open-source and available under the [MIT License](LICENSE).