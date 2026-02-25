console.log('layout.js is running');

(function() {
    let weatherObserver = null;

    function updateWeatherDiv() {
        console.log('Updating weather-div based on .weather em elements');

        // Look for class weather with <em> elements inside
        const weatherElements = document.querySelectorAll('.weather em');
        let weatherDiv = document.querySelector('.weather-div');

        // If weather-div already exists, clear its content
        if (weatherDiv) {
            weatherDiv.innerHTML = ''; // Clear existing squares
        } else {
            // If weather-div doesn't exist, create it
            weatherDiv = document.createElement('div');
            weatherDiv.className = 'weather-div';
            document.body.appendChild(weatherDiv);
        }

        console.log('Found weather elements:', weatherElements);

        let offsetY = 10;

        weatherElements.forEach(el => {
            console.log('Found weather element:', el);

            const weatherText = el.textContent.trim().toLowerCase();
            console.log('Weather text:', weatherText);

            const weatherMatches = weatherText.match(/\bsandstorm\b|\bsun\b|\brain\b|\bsnow\b|\bgrassy terrain\b|\bmisty terrain\b|\belectric terrain\b|\bpsychic terrain\b/g);
            console.log('Weather matches:', weatherMatches);

            if (weatherMatches) {
                weatherMatches.forEach(match => {
                    console.log('Processing weather condition:', match);
                    const square = document.createElement('div');
                    square.className = `weather-square ${match.replace(/\s+/g, '-')}`; // Add a class for the weather condition

                    // Set absolute positioning for the square
                    square.style.top = `${offsetY}px`;
                    square.style.left = '10px'; // Fixed horizontal position

                    // Increment the vertical offset for the next square
                    offsetY += 30;

                    // Add the square to the weather-div
                    weatherDiv.appendChild(square);
                });
            }
        });
    }

    // Function to handle DOM changes
    function handleDomChanges() {
        console.log('DOM changed!');

        // Example: Select and modify `.room-opaque` elements
        const opaqueRooms = document.querySelectorAll('.ps-room-opaque');
        opaqueRooms.forEach(room => {
            room.style.backgroundColor = 'red';
        });

        // Example: Add a tab for the battle room
        const battleRoom = document.querySelector('[id^="room-battle-"]');
        const tabbar = document.querySelector('.tabbar.maintabbar');
        if (tabbar && battleRoom && !document.querySelector(`a[href="#${battleRoom.id}"]`)) {
            const battleTab = document.createElement('a');
            battleTab.className = 'button roomtab';
            battleTab.href = '#' + battleRoom.id;
            battleTab.textContent = 'Battle';
            tabbar.appendChild(battleTab);
        }
    }


    // // Set up the MutationObserver to observe the entire DOM
    // const observer = new MutationObserver((mutationsList) => {
    //     console.log('Mutations detected:', mutationsList);
    //     mutationsList.forEach((mutation) => {
    //         console.log('Processing mutation:', mutation);
    //         if (mutation.type === 'childList') {
    //             console.log('Child list mutation detected:', mutation);
    //             // Check if any new `.ps-room-opaque` elements were added
    //             const addedNodes = Array.from(mutation.addedNodes);
    //             console.log('Added nodes:', addedNodes);
    //             addedNodes.forEach(node => {
    //                 console.log('Checking added node:', node);
    //                 if (node.nodeType === 1 && node.classList.contains('ps-room-opaque')) {
    //                     console.log('New ps-room-opaque element detected:', node);
    //                     handleDomChanges(); // Handle the new element
    //                 }
    //             });
    //         }
    //     });
    // });

    // // Observe the entire DOM for changes
    // observer.observe(document.body, { childList: true, subtree: true });




    //     // Set up the MutationObserver to observe the entire DOM
    // const observer = new MutationObserver((mutationsList) => {
    //     console.log('Mutations detected:', mutationsList);
    //     mutationsList.forEach((mutation) => {
    //         console.log('Processing mutation:', mutation);

    //         if (mutation.type === 'childList') {
    //             console.log('Child list mutation detected:', mutation);
    //             // Check if any new `.ps-room-opaque` elements were added
    //             const addedNodes = Array.from(mutation.addedNodes);
    //             console.log('Added nodes:', addedNodes);
    //             addedNodes.forEach(node => {
    //                 console.log('Checking added node:', node);
    //                 if (node.nodeType === 1 && node.classList.contains('ps-room-opaque')) {
    //                     console.log('New ps-room-opaque element detected:', node);
    //                     handleDomChanges(); // Handle the new element
    //                 }
    //             });
    //         }

    //         if (mutation.type === 'attributes') {
    //             console.log('Attribute mutation detected:', mutation);
    //             if (mutation.target.classList.contains('ps-room-opaque')) {
    //                 console.log('Attributes changed on ps-room-opaque:', mutation.target);
    //                 handleDomChanges(); // Handle the updated element
    //             }
    //         }
    //     });
    // });

    // // Observe the entire DOM for changes
    // observer.observe(document.body, {
    //     childList: true, // Detect when new nodes are added or removed
    //     attributes: true, // Detect attribute changes
    //     subtree: true, // Observe all descendants of the target
    // });

    function observeWeatherDiv() {
        const weatherDiv = document.querySelectorAll('.weather')[1];
        console.log('Checking for .weather div:', weatherDiv);
        console.log('Current weatherObserver:', weatherObserver);

        if (weatherDiv && !weatherObserver) {
            console.log('Setting up MutationObserver for .weather div:', weatherDiv);

            // Create a new observer for the .weather div
            weatherObserver = new MutationObserver((mutationsList) => {
                console.log('Mutations detected in .weather div:', mutationsList);

                // Temporarily disconnect the observer to prevent infinite loops
                weatherObserver.disconnect();
                updateWeatherDiv(weatherDiv); // Update the specific weather-div
                weatherObserver.observe(weatherDiv, {
                    childList: true, // Detect when new nodes are added or removed
                    subtree: true, // Observe all descendants of the .weather div
                    characterData: true, // Detect changes to the text content of nodes
                });
            });

            // Start observing the .weather div
            weatherObserver.observe(weatherDiv, {
                childList: true, // Detect when new nodes are added or removed
                subtree: true, // Observe all descendants of the .weather div
                characterData: true, // Detect changes to the text content of nodes
            });

            console.log('MutationObserver is now observing .weather div:', weatherDiv);

            // Initial update
            updateWeatherDiv(weatherDiv);
        }
    }

    // Run the function initially to handle the current DOM
    handleDomChanges();

    // Set up a global MutationObserver to detect when .weather is added to the DOM
    const globalObserver = new MutationObserver(() => {
        console.log('Global DOM mutation detected');
        handleDomChanges();
        observeWeatherDiv();
    });

    globalObserver.observe(document.body, {
        childList: true, // Detect when new nodes are added or removed
        subtree: true, // Observe all descendants of the body
    });

    console.log('Global MutationObserver is now observing the DOM');
})();