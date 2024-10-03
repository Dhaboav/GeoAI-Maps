// Initialize and add the map
let map;
let currentMarker = null;
let markerListener = null;
let markerAddMode = false;
let markers = [];
let markerWindow;
let BASE_URL = `${window.location.origin}`;


async function initMap() {
    // The location of Uluru
    const position = { lat: -0.05572, lng: 109.3485};
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
        zoom: 12,
        center: position,
        mapId: "DEMO_MAP_ID",
        disableDefaultUI: true,
    });

    // The marker, positioned at Uluru
    new AdvancedMarkerElement({
        map: map,
        position: position,
        title: "Pontianak",
    });

	markerWindow = new google.maps.InfoWindow();
	// Fetch and add database markers but don't show them yet
	const markersData = await fetchMarkers();
	markersData.forEach((markerData) => databaseMarkers(markerData));
    document.getElementById("add-marker").addEventListener("click", addMarker);
}

// Fetch markers from the Laravel API
async function fetchMarkers() {
    try {
		const url = `${BASE_URL}/api/store`;
        const response = await fetch(url);
        
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Extracting only the required fields
        const markers = result.data.map(marker => ({
            nama_toko: marker.nama_toko,
            latitude: marker.latitude,
            longitude: marker.longitude
        }));
        
        console.log(markers);
        return markers;
    } catch (error) {
        console.error("Error fetching marker data:", error);
        return [];
    }
}

// Create markers from the fetched data
function databaseMarkers(markerData) {
	const markerDatabase = document.createElement("img");
	markerDatabase.src =
		"https://maps.google.com/mapfiles/ms/icons/blue-dot.png";

	const marker = new google.maps.marker.AdvancedMarkerElement({
		map: map, // Set map to null initially
		position: {
			lat: parseFloat(markerData.latitude),
			lng: parseFloat(markerData.longitude),
		},
		title: markerData.nama_toko,
		content: markerDatabase,
	});

	// Store additional information in the marker object
	markers.push({
		marker: marker,
		position: new google.maps.LatLng(
			markerData.latitude,
			markerData.longitude
		),
	});

	// Add click event listener to open the InfoWindow
	marker.addListener("click", () => openMarkerWindow(marker, markerData));
}
// ================ DATABASE END ===============================================
async function openMarkerWindow(marker, markerData) {
    const content = `
        <div>
            <h3>${markerData.nama_toko}</h3>
        </div>
    `;
    markerWindow.setContent(content);
    markerWindow.open(map, marker);
}

// Function to add marker
async function addMarker() {
	const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
	const tempMark = document.createElement("img");
	tempMark.src =
		"https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png";

	if (!markerAddMode) {
		markerAddMode = true;
		if (markerListener) google.maps.event.removeListener(markerListener);
		markerListener = map.addListener("click", function (event) {
			if (currentMarker) {
				currentMarker.setMap(null);
				currentMarker = null;
			}
			currentMarker = new AdvancedMarkerElement({
				map: map,
				position: event.latLng,
				title: "Temp Marker",
				content: tempMark,
			});
			addPosition(event.latLng);
			console.log("Marker added at position:", event.latLng);
		});
	} else {
		markerAddMode = false;
		if (markerListener) {
			google.maps.event.removeListener(markerListener);
			markerListener = null;
		}
		if (currentMarker) {
			currentMarker.setMap(null);
			currentMarker = null;
		}
		removePosition();
	}
}

// Adding position to HTML
function addPosition(position) {
	document.getElementById("latitude").value = position.lat();
	document.getElementById("longitude").value = position.lng();
}

// Delete position from HTML
function removePosition() {
	document.getElementById("latitude").value = "";
	document.getElementById("longitude").value = "";
}

initMap();