chrome.runtime.onInstalled.addListener(async function () {
  chrome.alarms.create("minuteAlarm", {
    delayInMinutes: 1,
    periodInMinutes: 1
  });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "minuteAlarm") {
    chrome.storage.local.get(["token_saved","expires_in",'clientId', 'tenantId', 'refresh_token'], function(result) {
      if (result.token_saved) {
        refreshTokensIfNeeded(result);
        updateDynamicRules();
      } else {
        console.log('No tokens found in storage, user needs to authenticate')
      }
    })
  }
});

function refreshTokensIfNeeded(result) {
  const tokenSaved = parseInt(result.token_saved);
  const expiresIn = parseInt(result.expires_in);
  const currentTime = Date.now();
  const elapsedSeconds = (currentTime - tokenSaved) / 1000;
  const remains = expiresIn - elapsedSeconds;
  if (remains < 300) {
    console.log('Less than 5 minutes until expiry, renewing...')
    refreshTokens(result.tenantId, result.clientId, result.refresh_token)
  } else {
    console.log(`Token is valid for ${remains} seconds, we are good`)
  }
}

function updateDynamicRules() {
  chrome.storage.local.get("access_token", function(result) {
    const accessToken = result.access_token;
    const rules = buildRules(accessToken)
    chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: rules.map((rule) => rule.id),
      addRules: rules
    });
  });
}

function buildRules(accessToken) {
  const allResourceTypes = Object.values(chrome.declarativeNetRequest.ResourceType);
  const rule = {
    id: 1,
    priority: 1,
    condition: {
      urlFilter: 'https://graph.microsoft.com/v1.0/me',
      resourceTypes: allResourceTypes
    },
    action: {
      type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
      requestHeaders: [
        {
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          header: 'Authorization',
          value: 'Bearer ' + accessToken,
        },
      ]
    }
  }

  return [rule]
}

async function refreshTokens(tenantId, clientId, refreshToken) {
  const extensionId = chrome.runtime.id;
  const redirectUri = `https://${extensionId}.chromiumapp.org/`;
  const tokenEndpoint = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;
  const tokenRequestParams = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    }),
  };
  const response = await fetch(tokenEndpoint, tokenRequestParams)
  const data = await response.json();
  console.log('refresh response', data);
  saveTokens(data);
}

function saveTokens(response) {
  chrome.storage.local.set({
    'access_token': response.access_token,
    'refresh_token': response.refresh_token,
    'expires_in': response.expires_in,
    'token_saved': Date.now()
  });
}