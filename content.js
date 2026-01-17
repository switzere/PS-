// Send the toggle state to the page when the content script loads
chrome.storage.sync.get(['ps-addon-enabled'], function(result) {
  window.postMessage({type: 'PS_ADDON_ENABLED', value: result['ps-addon-enabled']}, '*');
});

// Listen for changes to the toggle and send updates to the page
chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === 'sync' && changes['ps-addon-enabled']) {
    window.postMessage({type: 'PS_ADDON_ENABLED', value: changes['ps-addon-enabled'].newValue}, '*');
  }
});

// (Optional) Keep your existing localStorage logic if needed
chrome.runtime.sendMessage({method: "getLocalStorage", key: "showBaseStats"}, function (response) {
  var showBaseStats = document.createElement('div');
  showBaseStats.setAttribute("id", "pset-showBaseStats");
  showBaseStats.setAttribute("enabled", response.data ? response.data : "OFF");
  document.body.appendChild(showBaseStats);
});

// Inject tooltip.js into the page context
var ele = document.createElement("script");
ele.src = chrome.runtime.getURL("tooltip.js");
document.body.appendChild(ele);