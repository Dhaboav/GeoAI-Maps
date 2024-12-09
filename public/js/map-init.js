let map;
let markers = [];
let markerWindow;
let currentMarker = null;
let markerListener = null;
let markerAddMode = false;
let userLocation;
let circle = null;
const BASE_URL = `${window.location.origin}`;


// Load Google Maps libraries
async function loadGoogleMaps() {
	const { Map, Circle, LatLng } = await google.maps.importLibrary("maps");
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
	const { spherical } = await google.maps.importLibrary("geometry");
	return { Map, Circle, LatLng, AdvancedMarkerElement, spherical };
}

// Get user location
function getUserLocation() {
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    console.log("User location:", location);
                    resolve(location);
                },
                (error) => {
                    console.error("Error fetching GPS location:", error);

                    // Default location fallback
                    const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // Example: San Francisco
                    console.log("Using default location:", defaultLocation);
                    resolve(defaultLocation);
                }
            );
        } else {
            console.log("Geolocation not supported. Using default location.");
            
            // Default location fallback
            const defaultLocation = { lat: 37.7749, lng: -122.4194 }; // Example: San Francisco
            resolve(defaultLocation);
        }
    });
}

// Initialization Functions
async function initMap() {
    // Wait for user location
    userLocation = await getUserLocation()
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        zoom: 16,
        center: userLocation,
        mapId: "DEMO_MAP_ID",
        disableDefaultUI: true,
    });

    new AdvancedMarkerElement({
        map: map,
        position: userLocation,
        title: "User",
    });

    markerWindow = new google.maps.InfoWindow();
    await loadMarkers(); // Load initial markers

    setUpEventListeners();
}

function setUpEventListeners() {
    document.getElementById("add-marker").addEventListener("click", toggleMarkerAddMode);
    document.getElementById("close-store-form").addEventListener("click", deactivateMarkerAddMode);
    document.getElementById("show-all").addEventListener("click", () => toggleMarkers(true));
    document.getElementById("hide-all").addEventListener("click", () => toggleMarkers(false));
    
    ["markerAdded", "markerUpdated", "markerDeleted"].forEach(eventType => {
        document.addEventListener(eventType, handleMarkerEvent(eventType));
    });

    // New event listener for the search button
    document.getElementById("search-button").addEventListener("click", (event) => {
        event.preventDefault();  // Prevent form submission
        const query = document.getElementById("default-search").value;
        if (query) {
            handleSearch(query); // Call handleSearch with the user's input
        } else {
            alert("Please enter a search term.");
        }
    });
}

// Marker Management Functions
async function loadMarkers() {
    const markersData = await fetchMarkers();
    clearMarkers(); // Clear existing markers
    markersData.forEach(addMarkerToMap); // Add new markers
}

async function fetchMarkers() {
    try {
        const response = await fetch(`${BASE_URL}/api/store`);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        return result.data.map(({ id_toko, nama_toko, latitude, longitude }) => ({
            id_toko,
            nama_toko,
            latitude,
            longitude,
        }));
    } catch (error) {
        console.error("Error fetching marker data:", error);
        return [];
    }
}

function addMarkerToMap(markerData) {
    const position = new google.maps.LatLng(markerData.latitude, markerData.longitude);
    const marker = createMarker(position, markerData.nama_toko, "https://maps.google.com/mapfiles/ms/icons/blue-dot.png");

    marker.setMap(null); 
    markers.push({ id: markerData.id_toko, name: markerData.nama_toko, marker, position });
    marker.addListener("click", () => openMarkerWindow(marker, markerData));
}

function createMarker(position, title, iconSrc) {
    const markerImage = document.createElement("img");
    markerImage.src = iconSrc;

    return new google.maps.marker.AdvancedMarkerElement({
        map: map,
        position: position,
        title: title,
        content: markerImage,
    });
}

function clearMarkers() {
    markers.forEach(({ marker }) => marker.setMap(null));  // Remove each marker from the map
    markers = [];  // Clear the markers array
}

function placeTemporaryMarker(latLng) {
    clearTemporaryMarker(); // Clear any existing temp marker
    currentMarker = createMarker(latLng, "Temp Marker", "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png");
}

// Temporary Marker Management
function clearTemporaryMarker() {
    if (currentMarker) {
        currentMarker.setMap(null);
        currentMarker = null;
    }
}

// Event Handling Functions
function handleMarkerEvent(eventType) {
    return (event) => {
        if (eventType === "markerDeleted") {
            const { markerId } = event.detail;
            console.log(`Deleted marker ID: ${markerId}`);
            removeMarkerById(markerId);
        } else {
            loadMarkers(); // Reload markers after add/update event
        }
    };
}

function removeMarkerById(markerId) {
    const markerIndex = markers.findIndex(markerObj => markerObj.id === Number(markerId));
    if (markerIndex !== -1) {
        markers[markerIndex].marker.setMap(null); // Remove the marker from the map
        markers.splice(markerIndex, 1); // Remove the marker from the array
    }
}

// CRUD Functions
function confirmDelete(markerId) {
    if (confirm("Are you sure you want to delete this marker?")) {
        deleteMarker(markerId);
    }
}

function deleteMarker(markerId) {
    const markerData = markers.find(m => m.id === Number(markerId));
    if (markerData) {
        const { lat, lng } = markerData.position;

        // Remove marker from the map
        markerData.marker.setMap(null);
        markers = markers.filter(m => m.id !== markerId);
        
        // Trigger the API call to delete the store
        fetch(`${BASE_URL}/api/store/${markerId}`, { method: 'DELETE', headers: { 'Content-Type': 'application/json' } })
            .then(response => response.json())
            .then(data => {
                if (data.status === 200) {
                    alert(data.message);
                    dispatchMarkerEvent("markerDeleted", { lat, lng, markerId });
                } else {
                    console.error(`Failed to delete store with ID ${markerId}: ${data.message}`);
                    alert(`Failed to delete store: ${data.message}`);
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error deleting store. Please try again.');
            });
    } else {
        console.error(`Marker with ID ${markerId} not found.`);
        alert('Marker not found.');
    }
}

// Function to open the update form
function openUpdateForm(markerId) {
    const markerData = markers.find(m => m.id === Number(markerId));
    if (markerData) {
        document.getElementById("update-store-name").value = markerData.name;
        document.getElementById("update-store-id").value = markerId; 
        document.getElementById("update-latitude").value = markerData.position.lat(); 
        document.getElementById("update-longitude").value = markerData.position.lng(); 
    }
    
    const updateForm = document.getElementById("update-store-form");
    updateForm.classList.remove("translate-y-full"); // Show the form
}

// Event listener for closing the update form
document.getElementById("close-update-form").addEventListener("click", () => {
    const updateForm = document.getElementById("update-store-form");
    updateForm.classList.add("translate-y-full"); // Hide the form
});

// Event listener for the form submission
document.getElementById("update-store-form-action").addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent the default form submission

    const confirmed = confirm("Are you sure you want to update this store?");
    if (confirmed) {
        // Get input values
        const storeName = document.getElementById("update-store-name").value;
        const latitude = parseFloat(document.getElementById("update-latitude").value);
        const longitude = parseFloat(document.getElementById("update-longitude").value);

        // Validate input values
        if (!storeName || storeName.length > 30) {
            alert("Store name is required and must be less than 30 characters.");
            return;
        }
        if (isNaN(latitude) || latitude < -90 || latitude > 90) {
            alert("Latitude must be a number between -90 and 90.");
            return;
        }
        if (isNaN(longitude) || longitude < -180 || longitude > 180) {
            alert("Longitude must be a number between -180 and 180.");
            return;
        }

        // Construct the data object
        const data = {
            nama_toko: storeName,
            latitude: latitude,
            longitude: longitude
        };

        // Get the store ID from the hidden input
        const storeId = document.getElementById("update-store-id").value;

        // Send the data via Fetch API to the correct PUT endpoint
        fetch(`${BASE_URL}/api/store/${storeId}`, {
            method: 'PUT', // Use PUT for the update
            headers: {
                'Content-Type': 'application/json', // Set content type for JSON
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'), // CSRF token
            },
            body: JSON.stringify(data), // Convert data object to JSON string
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(`Update failed: ${JSON.stringify(err)}`);
                });
            }
            return response.json();
        })
        .then(data => {
            console.log("Update successful:", data);
            // Reload markers after successful update
            loadMarkers();  // Refresh the markers on the map

            // Optionally hide the form
            const updateForm = document.getElementById("update-store-form");
            updateForm.classList.add("translate-y-full");
        })
        .catch(error => {
            console.error("Error updating store:", error);
        });
    }
});

function dispatchMarkerEvent(eventType, position) {
    const markerEvent = new CustomEvent(eventType, {
        detail: { 
            lat: position.lat(),
            lng: position.lng(),
            markerId: position.markerId 
        },
    });
    document.dispatchEvent(markerEvent);
}

// Info Window Functions
function generateMarkerContent(markerData) {
    return `
    <div class="marker-container">
        <h1 class="marker-title">${markerData.nama_toko}</h1>
        <button class="button button-edit" onclick="openUpdateForm('${markerData.id_toko}')">Edit</button>
        <button class="button button-delete" onclick="confirmDelete('${markerData.id_toko}')">Delete</button>
    </div>`;
}

function openMarkerWindow(marker, markerData) {
    markerWindow.setContent(generateMarkerContent(markerData));
    markerWindow.open(map, marker);
}

// Marker Add Mode Functions
function toggleMarkerAddMode() {
    markerAddMode ? deactivateMarkerAddMode() : activateMarkerAddMode();
}

function activateMarkerAddMode() {
    markerAddMode = true;
    setMarkerListener((event) => {
        placeTemporaryMarker(event.latLng);
        updatePositionFields(event.latLng);
        dispatchMarkerEvent("markerAdded", event.latLng);
    });
}

function deactivateMarkerAddMode() {
    markerAddMode = false;
    removeMarkerListener();
    clearTemporaryMarker();
    updatePositionFields();
}

// Marker Visibility Functions
function toggleMarkers(shouldShow) {
    markers.forEach(({ marker }) => {
        marker.setMap(shouldShow ? map : null); // Show or hide each marker
    });
}

// Position Fields Functions
function updatePositionFields(position = null) {
    const latField = document.getElementById("latitude");
    const lngField = document.getElementById("longitude");
    if (position) {
        latField.value = position.lat();
        lngField.value = position.lng();
    } else {
        latField.value = "";
        lngField.value = "";
    }
}

// Marker Listener Functions
function setMarkerListener(callback) {
    removeMarkerListener();  // Remove any existing listener
    markerListener = map.addListener("click", callback);
}

function removeMarkerListener() {
    if (markerListener) {
        google.maps.event.removeListener(markerListener);
        markerListener = null;
    }
}

// Search function to handle the search action and update the map
async function handleSearch(query) {
    try {
        // Trigger the API to process the input (using POST request with the input data)
        const response = await fetch(`${BASE_URL}/processInput`, {  // Use the full URL
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),  // For CSRF protection
            },
            body: JSON.stringify({ input: query })  // Send query data as JSON
        });

        // Wait for JSON response
        const data = await response.json();

        if (response.ok) {
            // Process the barcode_id and jarak from the response
            const barcodeId = data.barcode_id;
            const jarak = data.jarak;

            // Log the barcode_id and jarak for debugging
            console.log("Barcode ID:", barcodeId);
            console.log("Jarak:", jarak);

            // If jarak exists, update the map with the new radius
            if (jarak) {
                const numericJarak = parseFloat(jarak);  // Convert jarak from string to numeric value
                if (!isNaN(numericJarak)) {
                    setRadiusFromJarak(numericJarak);  // Update the map's circle radius based on the numeric value of jarak
                } else {
                    console.error('Invalid radius (jarak) value:', jarak);  // Handle invalid numeric value
                }
            }

            // You may want to center the map or add a marker depending on the response
            // Example: centerMap(barcodeId);
        } else {
            // Handle errors (e.g., invalid input)
            console.error('Error:', data.error);
            alert(data.error || 'Something went wrong!');  // Show error to the user
        }
    } catch (error) {
        console.error('Error during search fetch:', error);
        alert('An error occurred during the search. Please try again later.');
    }
}

async function setRadiusFromJarak(radius) {
    const { spherical } = await loadGoogleMaps();

    if (circle) circle.setMap(null); // Clear existing circle

    // Create a new circle with the provided center and radius
    circle = new google.maps.Circle({
        strokeColor: "#008000",
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: "#008000",
        fillOpacity: 0.25,
        map: map, // Make sure the circle is added to the map
        center: userLocation,
        radius: radius,
    });

    // Update markers visibility right after the circle is created
    updateMarkersVisibility();
}

async function updateMarkersVisibility() {
    const { spherical } = await loadGoogleMaps();

    if (circle) {
        const center = circle.getCenter();
        const radius = circle.getRadius();

        markers.forEach((markerObj) => {
            const marker = markerObj.marker;
            const position = markerObj.position;

            const distance = spherical.computeDistanceBetween(position, center);
            marker.setMap(distance <= radius ? map : null);  // Show or hide marker based on distance
        });
    } else {
        markers.forEach((markerObj) =>
            markerObj.marker.setMap(markersMapStatus ? map : null)
        );
    }
}

// Call the initMap function to set up the map
initMap();