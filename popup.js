document.addEventListener('DOMContentLoaded', function() {
  const toggleAddon = document.getElementById('toggleAddon');
  const toggleStats = document.getElementById('toggleStats');
  const toggleMovesets = document.getElementById('toggleMovesets');

  // Function to update the dependent toggles
  function updateDependentToggles() {
    // const isEnabled = toggleAddon.checked;
    // toggleStats.disabled = !isEnabled;
    // toggleMovesets.disabled = !isEnabled;

    // Automatically turn on dependent toggles if toggleAddon is enabled
    // if (isEnabled) {
    //   toggleStats.checked = true;
    //   toggleMovesets.checked = true;
    // }
    // else {
    //   toggleStats.checked = false;
    //   toggleMovesets.checked = false;
    // }
  }

  // Initialize toggleAddon state
  chrome.storage.sync.get(['ps-addon-enabled'], function(result) {
    toggleAddon.checked = !!result['ps-addon-enabled'];
    updateDependentToggles(); // Update dependent toggles on load
  });

  // Initialize toggleStats state
  chrome.storage.sync.get(['ps-toggle-stats'], function(result) {
    toggleStats.checked = !!result['ps-toggle-stats'];
  });

  // Initialize toggleMovesets state
  chrome.storage.sync.get(['ps-toggle-movesets'], function(result) {
    toggleMovesets.checked = !!result['ps-toggle-movesets'];
  });

  // Listen for changes to toggleAddon
  toggleAddon.addEventListener('change', function() {
    const isEnabled = toggleAddon.checked;
    chrome.storage.sync.set({'ps-addon-enabled': isEnabled}, function() {
      updateDependentToggles();
    });
  });

  // Listen for changes to toggleStats
  toggleStats.addEventListener('change', function() {
    chrome.storage.sync.set({'ps-toggle-stats': toggleStats.checked});
  });

  // Listen for changes to toggleMovesets
  toggleMovesets.addEventListener('change', function() {
    chrome.storage.sync.set({'ps-toggle-movesets': toggleMovesets.checked});
  });
});