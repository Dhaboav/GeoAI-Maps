// Initialize and add the map
let map;
let currentMarker = null;
let markerListener = null;
let markerAddMode = false;

async function initMap() {
    // The location of Uluru
    const position = { lat: -25.344, lng: 131.031 };
    // Request needed libraries.
    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps");
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

    // The map, centered at Uluru
    map = new Map(document.getElementById("map"), {
        zoom: 4,
        center: position,
        mapId: "DEMO_MAP_ID",
        disableDefaultUI: true,
    });

    // The marker, positioned at Uluru
    const marker = new AdvancedMarkerElement({
        map: map,
        position: position,
        title: "Uluru",
    });

    document.getElementById("add-marker").addEventListener("click", addMarker);
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