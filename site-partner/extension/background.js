const URL_FRAGMENT = '.com'

chrome.runtime.onInstalled.addListener(async function () {
  console.log('Site partner installed')
  chrome.tabs.onUpdated.addListener(() => checkSite('tabs.onUpdated'));
  chrome.tabs.onActivated.addListener(() => checkSite('tabs.onActivated'));
  chrome.windows.onFocusChanged.addListener(() => checkSite('windows.onFocusChanged'));

  chrome.runtime.onMessage.addListener(messageHandler);
});

const messageHandler = (message, sender, sendResponse) => {
  console.log('messageHandler',message, sender, sendResponse);
}

const checkSite = (event) => {
  console.log('checkSite',event)
  chrome.tabs.query({ active: true, lastFocusedWindow: true })
    .then(tabs => {
      if (tabs.length && tabs[0].status !== 'loading') {
        const tab = tabs[0];
        if (tab.url.includes(URL_FRAGMENT)) {
          console.log('Interesting site', tab.url);
          inspectSite(tab);
        } else {
          console.log('Site is not interesting', tab.url);
        }
      } else {
        console.log('no active tab or still loading',tabs);
      }
    })
}

const inspectSite = (tab) => {
  console.log('Injecting script in ',tab.id);
  chrome.scripting.executeScript({
    target : {tabId : tab.id},
    func : inspectionScript,
  });
}

const inspectionScript = () => {
  console.log('inspectionScript is part of the page now');
  const title = document.title;
  console.log(`title is ${title}`);
  chrome.runtime.sendMessage(`Message from injected script, title is ${title}`);
} 