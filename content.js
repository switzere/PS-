// Send the toggle state to the page when the content script loads

chrome.storage.sync.get(['ps-addon-enabled'], function(result) {
  // Default to false if not set
  const enabled = typeof result['ps-addon-enabled'] === 'undefined' ? false : !!result['ps-addon-enabled'];
  window.postMessage({type: 'PS_ADDON_ENABLED', value: enabled}, '*');
});

// Listen for changes to the toggle and send updates to the page

chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === 'sync' && changes['ps-addon-enabled']) {
    // Always send a boolean value, default to false
    const enabled = typeof changes['ps-addon-enabled'].newValue === 'undefined' ? false : !!changes['ps-addon-enabled'].newValue;
    window.postMessage({type: 'PS_ADDON_ENABLED', value: enabled}, '*');
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
ele.onload = function() {
  // After the script is loaded, send the toggle state again
  chrome.storage.sync.get(['ps-addon-enabled'], function(result) {
    const enabled = typeof result['ps-addon-enabled'] === 'undefined' ? false : !!result['ps-addon-enabled'];
    window.postMessage({type: 'PS_ADDON_ENABLED', value: enabled}, '*');
  });
};
document.body.appendChild(ele);