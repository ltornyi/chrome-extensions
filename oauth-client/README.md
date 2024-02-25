# Chrome extension PoC

This extension modifies HTTP headers of requests to an API endpoint. The extension stores its authentication configuration and access token information in the extension's local storage.

## Overview

The extension's service worker wakes up every minute. If there's a valid access token in its local storage, it configures rules to add the access token to the relevant request's header. If the stored access token is near to expiry, the extension will use the refresh token stored to acquire a new access token and a new refresh token.

## Setup

### Check extension manifest

The `extension\manifest.json` expects the source page with the API calls to be hosted under http://localhost:8000. Change the manifest if your page will be hosted somewhere else.

### Load the extension into Chrome

Navigate to the [extension page](chrome://extensions/), turn on developer mode and load the `extension` folder as unpacked. Note the extension ID displayed.

### Create an application registration in your Azure Entra ID tenant

* Create an application registration.
* Choose the Single-page application (SPA) platform under Redirect URI. Add the redirect URI in the form of `https://your-extension-id.chromiumapp.org/`.
* Add the `Microsoft Graph User.Read` permission under API permissions.
* Copy the Application ID and the Tenant ID from the overview page of the application registraton.

### Configure the extension

* Open the extension's popup page from the Chrome toolbar.
* Enter the Application ID and the Tenant ID into the input fields.
* Click "Save Configuration" to save these IDs into local storage.

## Test the extension

* Open the extension's popup page from the Chrome toolbar.
* Click on the "Authorize" button, authenticate and grant consent.
* Host the contents of the `client` folder on a server as configured.
* Click the "Call API" button and observe the result.