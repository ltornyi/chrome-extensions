chrome.runtime.onInstalled.addListener(async function () {
  chrome.alarms.create("hourlyAlarm", {
    delayInMinutes: 0,
    periodInMinutes: 60
  });
});

chrome.alarms.onAlarm.addListener(function (alarm) {
  if (alarm.name === "hourlyAlarm") {
    loadFandGindex();
  }
});

const loadFandGindex = () => {
  fetch('https://production.dataviz.cnn.io/index/fearandgreed/current')
    .then(resp => resp.json())
    .then(data => {
      chrome.storage.local.set(data);
      setIcon(data.rating);
    })
}

const setIcon = (rating) => {
  let iconPath, txt, color;
  switch (rating) {
    case 'extreme greed':
      iconPath = '/images/extreme-greed.png';
      txt = 'EG';
      color = '#ADE2D4';
      break;
    case 'greed':
      iconPath = '/images/greed.png';
      txt = 'G';
      color = '#CDF2EF';
      break;
    case 'neutral':
      iconPath = '/images/neutral.png';
      txt = 'N';
      color = '#E6E6E6';
      break;
    case 'fear':
      iconPath = '/images/fear.png';
      txt = 'F';
      color = '#FFB9A1';
      break;
    case 'extreme fear':
      iconPath = '/images/extreme-fear.png';
      txt = 'EF';
      color = '#FF8170';
      break;
    default:
      break;
  }
  chrome.action.setIcon({path: iconPath});
  chrome.action.setBadgeText({text: txt})
  chrome.action.setBadgeBackgroundColor({color})
}