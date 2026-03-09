console.log('layout.js is running');

(function() {
    let weatherObserver = null;
    let lastWeatherDiv = null;
    let lastWeatherContent = '';

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

    function updateWeatherDiv(weatherDiv) {
        console.log('Updating weather-div based on .weather em elements');

        const currentWeatherContent = weatherDiv.innerHTML.trim();
        console.log('Current .weather content:', currentWeatherContent, 'Last .weather content:', lastWeatherContent);
        console.log('Current .weather div:', weatherDiv, 'Last .weather div:', lastWeatherDiv);
        if (weatherDiv === lastWeatherDiv && currentWeatherContent === lastWeatherContent) {
            console.log('No changes detected in .weather div. Skipping update.');
            return; // Skip the update if nothing has changed
        }

        // Look for <em> elements inside the specific .weather div
        const weatherElements = weatherDiv.querySelectorAll('em');

        if (weatherElements.length === 0) {
            console.log('No <em> elements found inside .weather div yet. Waiting...');
            return; // Exit if no <em> elements are found
        }

        weatherElements.forEach((el) => {
            console.log('Found weather element:', el);

            if (el.querySelector('.weather-condition')) {
                console.log('Weather text already formatted. Skipping this element.');
                return; // Skip this element if it is already formatted
            }

            const weatherText = el.innerHTML.trim(); // Use innerHTML to preserve existing formatting
            console.log('Weather text:', weatherText);

            const fieldConditions = [
                'Sun',
                'Snow',
                'Sandstorm',
                'Psychic Terrain',
                'Grassy Terrain',
                'Misty Terrain',
                'Electric Terrain',
                'Trick Room',
                'Rain' //rain after terrain
            ];

            let formattedText = weatherText;
            fieldConditions.forEach((condition) => {
                const className = condition.toLowerCase().replace(/\s+/g, '-'); // Convert condition to a class-friendly format
                const regex = new RegExp(`\\b(${condition})\\b( <small>\\(.*?\\)<\\/small>)`, 'i');
                formattedText = formattedText.replace(
                    regex,
                    `<span class="weather-condition ${className}">$1</span>`
                );
            });


            // Update the <em> element with the formatted text
            el.innerHTML = formattedText;
        });

        lastWeatherDiv = weatherDiv;
        lastWeatherContent = currentWeatherContent;

    }

    function observeWeatherDiv() {
        const weatherDivs = document.querySelectorAll('.weather'); // Get all .weather divs
        const weatherDiv = weatherDivs[1]; // Get the second .weather div (index 1)

        if (!weatherDiv) {
            console.log('Second .weather div not found');
            return;
        }

        console.log('Setting up MutationObserver for second .weather div:', weatherDiv);

        // Create a new observer for the .weather div
        weatherObserver = new MutationObserver((mutationsList) => {
            console.log('Mutations detected in .weather div:', mutationsList);

            mutationsList.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    console.log('Child nodes changed:', mutation);
                } else if (mutation.type === 'characterData') {
                    console.log('Text content changed:', mutation.target.textContent);
                }
            });

            // Update the weather-div whenever changes are detected
            updateWeatherDiv(weatherDiv);
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

    // Run the function initially to handle the current DOM
    //handleDomChanges();

    // Set up a global MutationObserver to detect when .weather is added to the DOM
    const globalObserver = new MutationObserver((mutationsList) => {
        console.log('Global DOM mutation detected');

        mutationsList.forEach((mutation) => {
            // Directly call observeWeatherDiv without filtering for .weather-div
            observeWeatherDiv();
        });
    });

    globalObserver.observe(document.body, {
        childList: true, // Detect when new nodes are added or removed
        subtree: true, // Observe all descendants of the body
    });

    console.log('Global MutationObserver is now observing the DOM');
})();