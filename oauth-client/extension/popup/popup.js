document.addEventListener('DOMContentLoaded', function () {
  const extensionId = chrome.runtime.id;
  const clientIdInput = document.getElementById('clientId');
  const tenantIdInput = document.getElementById('tenantId');
  const saveButton = document.getElementById('saveButton');

  // Load saved values from storage
  chrome.storage.local.get(['clientId', 'tenantId'], function(result) {
    clientIdInput.value = result.clientId || '';
    tenantIdInput.value = result.tenantId || '';
  });

  saveButton.addEventListener('click', function () {
    // Save values to storage
    chrome.storage.local.set({
      clientId: clientIdInput.value,
      tenantId: tenantIdInput.value
    }, function () {
      console.log('Configuration saved');
    });
  });

  const authorizeButton = document.getElementById('authorizeButton');

  authorizeButton.addEventListener('click', async function () {
    // Trigger the authorization flow
    await authorize(extensionId, tenantIdInput.value, clientIdInput.value);
  });
});

async function authorize(extensionId, tenantId, clientId) {
  const codeVerifier = generateCodeVerifier();
  // Use the Chrome Identity API to initiate the authorization flow
  chrome.identity.launchWebAuthFlow(
    {
      'url': await buildAuthorizationEndpoint(extensionId, tenantId, clientId, codeVerifier),
      'interactive': true
    },
    function (redirectUri) {
      extractAccessToken(extensionId, tenantId, clientId, redirectUri, codeVerifier);
    }
  );
}

async function buildAuthorizationEndpoint(extensionId, tenantId, clientId, codeVerifier) {
  const redirectUri = `https://${extensionId}.chromiumapp.org/`;
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  return `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize` +
  `?client_id=${clientId}` +
  `&response_type=code` +
  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
  `&scope=User.Read` +
  `&code_challenge=${codeChallenge}` +
  `&code_challenge_method=S256`;
}

function generateCodeVerifier() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await crypto.subtle.digest("SHA-256", data);

  const base64Url = (arrayBuffer) => {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    return base64.replace("+", "-").replace("/", "_").replace(/=+$/, "");
  };

  return base64Url(digest);
}

async function extractAccessToken(extensionId, tenantId, clientId, redirectUri, codeVerifier) {
  console.log('extractAccessToken redirectUri:',redirectUri)
  const url = new URL(redirectUri);
  const code = url.searchParams.get("code");

  if (!code) {
    console.error("Authorization code not found in redirect URI.");
    return;
  }
  const {accessToken, refreshToken, expiresIn} = await exchangeCodeForToken(extensionId, tenantId, clientId, code, codeVerifier);

  chrome.storage.local.set({
    'access_token': accessToken,
    'refresh_token': refreshToken,
    'expires_in': expiresIn,
    'token_saved': Date.now()
  });
}

async function exchangeCodeForToken(extensionId, tenantId, clientId, authorizationCode, codeVerifier) {
  // Construct the token request parameters
  const redirectUri = `https://${extensionId}.chromiumapp.org/`;
  const tokenRequestParams = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      code: authorizationCode,
      grant_type: "authorization_code",
      code_verifier: codeVerifier
    }),
  };

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, tokenRequestParams)
    .then(response => response.json());

  const accessToken = response.access_token;
  const refreshToken = response.refresh_token;
  const expiresIn = response.expires_in;

  return {accessToken, refreshToken, expiresIn};
}