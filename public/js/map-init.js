let map;
let markers = [];
let markerWindow;
let currentMarker = null;
let markerListener = null;
let markerAddMode = false;
const BASE_URL = `${window.location.origin}`;

// Initialization Functions
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

    markers.push({ id: markerData.id_toko, marker, position });
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
        <button class="button button-edit">Edit</button>
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

// Initialize the map
initMap();