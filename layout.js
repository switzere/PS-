console.log('layout.js is running');

(function() {
    // Function to handle DOM changes
    function handleDomChanges() {
        console.log('DOM changed!');

        // look for class weather with <em> elements inside
        const weatherElements = document.querySelectorAll('.weather em');
        weatherElements.forEach(el => {
            console.log('Found weather element:', el);
            // Example: Change the text color to blue
            el.style.color = 'blue';

            weatherText = el.textContent.trim().toLowerCase();
            console.log('Weather text:', weatherText);
            weatherMatches = weatherText.match(/sandstorm|grassy terrain|misty terrain|electric terrain|sunny day|rainy day|hail/g);

            if (weatherMatches && document.querySelector('.weather-square') === null) {
                const square = document.createElement('div');
                square.style.width = '20px';
                square.style.height = '20px';
                square.style.position = 'absolute';
                square.style.top = '10px';
                square.style.left = '10px';
                square.className = 'weather-square';
                //put on top
                square.style.zIndex = '1000';
                console.log('Weather type detected:', weatherMatches[0]);
                    weatherMatches.forEach(match => {
                    console.log('Extracted:', match);
                    // Use the extracted words in your switch statement
                    switch (match) {
                        case 'sandstorm':
                            square.style.backgroundColor = 'sandybrown';
                            console.log('Applied sandstorm style');
                            break;
                        case 'grassy terrain':
                            square.style.backgroundColor = 'lightgreen';
                            console.log('Applied grassy terrain style');
                            break;
                    }
                });
                
                document.body.appendChild(square);
            }

        });




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

    // Run the function initially to handle the current DOM
    handleDomChanges();

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

    const observer = new MutationObserver((mutationsList) => {
        handleDomChanges();
    });

    // Observe the entire DOM for changes
    observer.observe(document.body, {
        childList: true, // Detect when new nodes are added or removed
        attributes: true, // Detect attribute changes
        subtree: true, // Observe all descendants of the target
    });


    console.log('MutationObserver is now observing the DOM');
})();