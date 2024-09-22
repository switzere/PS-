// Send a message to the background script to get the value of the "showBaseStats" key from local storage
chrome.runtime.sendMessage({method: "getLocalStorage", key: "showBaseStats"}, function (response) {
  // Create a new <div> element to display the "showBaseStats" setting
  var showBaseStats = document.createElement('div');
  // Set the ID of the <div> element to "pset-showBaseStats"
  showBaseStats.setAttribute("id", "pset-showBaseStats");
  // Set the "enabled" attribute of the <div> element to the value of the "showBaseStats" setting from local storage, or "OFF" if it is not set
  showBaseStats.setAttribute("enabled", response.data ? response.data : "OFF");
  // Add the <div> element to the end of the <body> element
  document.body.appendChild(showBaseStats);
});

// Create a new <script> element to load the "showPokemonTooltip.js" script
var ele = document.createElement("script");
// Set the "src" attribute of the <script> element to the URL of the "showPokemonTooltip.js" script
ele.src = chrome.runtime.getURL("tooltip.js");
// Add the <script> element to the end of the <body> element
document.body.appendChild(ele);