let map;
let currentMarker = null;
let markerListener = null;
let markerAddMode = false;
let markers = [];
let markerWindow;
const BASE_URL = `${window.location.origin}`;

// Initialize the map
async function initMap() {
    const position = { lat: -0.05572, lng: 109.3485 };
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    map = new Map(document.getElementById("map"), {
        zoom: 12,
        center: position,
        mapId: "DEMO_MAP_ID",
        disableDefaultUI: true,
    });

    new AdvancedMarkerElement({
        map: map,
        position: position,
        title: "Pontianak",
    });

    markerWindow = new google.maps.InfoWindow();
    await loadMarkers(); // Load initial markers

    // Add event listeners for marker actions
    setUpEventListeners();
}

// Set up event listeners
function setUpEventListeners() {
    document.getElementById("add-marker").addEventListener("click", toggleMarkerAddMode);
    document.getElementById("close-store-form").addEventListener("click", deactivateMarkerAddMode);
    document.getElementById("show-all").addEventListener("click", () => toggleMarkers(true));
    document.getElementById("hide-all").addEventListener("click", () => toggleMarkers(false));
    document.addEventListener("markerAdded", handleMarkerEvent("markerAdded"));
    document.addEventListener("markerUpdated", handleMarkerEvent("markerUpdated"));
    document.addEventListener("markerDeleted", handleMarkerEvent("markerDeleted"));
}

// Handle marker-related events (add, update, delete)
function handleMarkerEvent(eventType) {
    return (event) => {
        console.log(`${eventType}:`, event.detail);
        loadMarkers(); // Reload markers after the respective event
    };
}

// Fetch markers from the API and update the map
async function loadMarkers() {
    const markersData = await fetchMarkers();
    clearMarkers(); // Clear existing markers
    markersData.forEach(addMarkerToMap); // Add new markers
}

// Fetch markers from the API
async function fetchMarkers() {
    try {
        const url = `${BASE_URL}/api/store`;
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        const result = await response.json();
        return result.data.map(({ nama_toko, latitude, longitude }) => ({
            nama_toko,
            latitude,
            longitude,
        }));
    } catch (error) {
        console.error("Error fetching marker data:", error);
        return [];
    }
}

// Add markers to the map
function addMarkerToMap(markerData) {
    const position = new google.maps.LatLng(markerData.latitude, markerData.longitude);
    const blueDotIcon = "https://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    const marker = createMarker(position, markerData.nama_toko, blueDotIcon);

    markers.push({ marker, position });
    marker.addListener("click", () => openMarkerWindow(marker, markerData));
}

// Create a marker
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

// Generate content for the marker window
function generateMarkerContent(markerData) {
    return `<div><h1>${markerData.nama_toko}</h1></div>`;
}

// Open the marker window with given data
function openMarkerWindow(marker, markerData) {
    markerWindow.setContent(generateMarkerContent(markerData));
    markerWindow.open(map, marker);
}

// Toggle marker add mode on/off
function toggleMarkerAddMode() {
    markerAddMode ? deactivateMarkerAddMode() : activateMarkerAddMode();
}

// Activate marker add mode
function activateMarkerAddMode() {
    const tempMarkerIcon = "https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";
    markerAddMode = true;
    setMarkerListener((event) => {
        placeTemporaryMarker(event.latLng, tempMarkerIcon);
        updatePositionFields(event.latLng);
        dispatchMarkerEvent("markerAdded", event.latLng);
    });
}

// Deactivate marker add mode
function deactivateMarkerAddMode() {
    markerAddMode = false;
    removeMarkerListener();
    clearTemporaryMarker();
    updatePositionFields();
}

// Place a temporary marker on the map
function placeTemporaryMarker(latLng, iconSrc) {
    clearTemporaryMarker(); // Clear any existing temp marker
    currentMarker = createMarker(latLng, "Temp Marker", iconSrc);
}

// Clear the temporary marker
function clearTemporaryMarker() {
    if (currentMarker) {
        currentMarker.setMap(null);
        currentMarker = null;
    }
}

// Set marker click listener
function setMarkerListener(callback) {
    removeMarkerListener();  // Remove any existing listener
    markerListener = map.addListener("click", callback);
}

// Remove map click listener
function removeMarkerListener() {
    if (markerListener) {
        google.maps.event.removeListener(markerListener);
        markerListener = null;
    }
}

// Update position fields in the form
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

// Dispatch custom marker events (add, update, delete)
function dispatchMarkerEvent(eventType, position) {
    const markerEvent = new CustomEvent(eventType, {
        detail: { lat: position.lat(), lng: position.lng() },
    });
    document.dispatchEvent(markerEvent);
}

// Clear all existing markers from the map
function clearMarkers() {
    markers.forEach(({ marker }) => marker.setMap(null));  // Remove each marker from the map
    markers = [];  // Clear the markers array
}

// Trigger custom events for updates and deletes
function updateMarker(markerId, updatedData) {
    dispatchMarkerEvent("markerUpdated", { markerId, updatedData });
}

function deleteMarker(markerId) {
    dispatchMarkerEvent("markerDeleted", { markerId });
}

// Function to toggle markers visibility
function toggleMarkers(shouldShow) {
    markers.forEach(({ marker }) => {
        marker.setMap(shouldShow ? map : null); // Show or hide each marker
    });
}
initMap();