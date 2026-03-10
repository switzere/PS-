document.addEventListener('DOMContentLoaded', function() {
  const toggleAddon = document.getElementById('toggleAddon');
  const toggleStats = document.getElementById('toggleStats');
  const toggleMovesets = document.getElementById('toggleMovesets');
  const toggleTypeChart = document.getElementById('toggleTypeChart');

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

  chrome.storage.sync.get(['ps-toggle-stats'], function(result) {
    toggleStats.checked = !!result['ps-toggle-stats'];
  });

  chrome.storage.sync.get(['ps-toggle-movesets'], function(result) {
    toggleMovesets.checked = !!result['ps-toggle-movesets'];
  });

  chrome.storage.sync.get(['ps-toggle-typechart'], function(result) {
    toggleTypeChart.checked = !!result['ps-toggle-typechart'];
  });


  // Listen for changes to toggleAddon
  toggleAddon.addEventListener('change', function() {
    const isEnabled = toggleAddon.checked;
    chrome.storage.sync.set({'ps-addon-enabled': isEnabled}, function() {
      updateDependentToggles();
    });
  });

  toggleStats.addEventListener('change', function() {
    chrome.storage.sync.set({'ps-toggle-stats': toggleStats.checked});
  });

  toggleMovesets.addEventListener('change', function() {
    chrome.storage.sync.set({'ps-toggle-movesets': toggleMovesets.checked});
  });

  toggleTypeChart.addEventListener('change', function() {
    chrome.storage.sync.set({'ps-toggle-typechart': toggleTypeChart.checked});
  });
});
