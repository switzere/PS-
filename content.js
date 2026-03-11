// Send the toggle state to the page when the content script loads

chrome.storage.sync.get(['ps-addon-enabled', 'ps-toggle-stats', 'ps-toggle-movesets', 'ps-toggle-typechart'], function(result) {
  const addonEnabled = !!result['ps-addon-enabled'];
  const statsEnabled = !!result['ps-toggle-stats'];
  const movesetsEnabled = !!result['ps-toggle-movesets'];
  const typeChartEnabled = !!result['ps-toggle-typechart'];

  window.postMessage({type: 'PS_ADDON_ENABLED', value: addonEnabled}, '*');
  window.postMessage({type: 'PS_TOGGLE_STATS', value: statsEnabled}, '*');
  window.postMessage({type: 'PS_TOGGLE_MOVESETS', value: movesetsEnabled}, '*');
  window.postMessage({type: 'PS_TOGGLE_TYPECHART', value: typeChartEnabled}, '*');
});
// Listen for changes to the toggle and send updates to the page

chrome.storage.onChanged.addListener(function(changes, area) {
  if (area === 'sync'){
    if (changes['ps-addon-enabled']) {
      const addonEnabled = !!changes['ps-addon-enabled'].newValue;
      window.postMessage({type: 'PS_ADDON_ENABLED', value: addonEnabled}, '*');
    }
    if (changes['ps-toggle-stats']) {
      const statsEnabled = !!changes['ps-toggle-stats'].newValue;
      window.postMessage({type: 'PS_TOGGLE_STATS', value: statsEnabled}, '*');
    }
    if (changes['ps-toggle-movesets']) {
      const movesetsEnabled = !!changes['ps-toggle-movesets'].newValue;
      window.postMessage({type: 'PS_TOGGLE_MOVESETS', value: movesetsEnabled}, '*');
    }
    if (changes['ps-toggle-typechart']) {
      const typeChartEnabled = !!changes['ps-toggle-typechart'].newValue;
      window.postMessage({type: 'PS_TOGGLE_TYPECHART', value: typeChartEnabled}, '*');
    }
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
  chrome.storage.sync.get(['ps-toggle-stats'], function(result) {
    const statsEnabled = typeof result['ps-toggle-stats'] === 'undefined' ? false : !!result['ps-toggle-stats'];
    window.postMessage({type: 'PS_TOGGLE_STATS', value: statsEnabled}, '*');
  });
  chrome.storage.sync.get(['ps-toggle-movesets'], function(result) {
    const movesetsEnabled = typeof result['ps-toggle-movesets'] === 'undefined' ? false : !!result['ps-toggle-movesets'];
    window.postMessage({type: 'PS_TOGGLE_MOVESETS', value: movesetsEnabled}, '*');
  });
  chrome.storage.sync.get(['ps-toggle-typechart'], function(result) {
    const typeChartEnabled = typeof result['ps-toggle-typechart'] === 'undefined' ? false : !!result['ps-toggle-typechart'];
    window.postMessage({type: 'PS_TOGGLE_TYPECHART', value: typeChartEnabled}, '*');
  });
};
document.body.appendChild(ele);