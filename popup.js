document.addEventListener('DOMContentLoaded', function() {
  const toggle = document.getElementById('toggleAddon');
  chrome.storage.sync.get(['ps-addon-enabled'], function(result) {
    // Default to false if not set
    if (typeof result['ps-addon-enabled'] === 'undefined') {
      chrome.storage.sync.set({'ps-addon-enabled': false});
      toggle.checked = false;
    } else {
      toggle.checked = result['ps-addon-enabled'] === true;
    }
  });
  toggle.addEventListener('change', function() {
    console.log('[popup.js] Addon enabled state changed to: ' + toggle.checked);
    chrome.storage.sync.set({'ps-addon-enabled': toggle.checked});
  });
});