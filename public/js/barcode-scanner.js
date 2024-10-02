let html5QrCode;
let isScanning = false; // Track if scanning is active
let isBarcodeDetected = false; // Track if a barcode has been detected

function startScanning() {
    Html5Qrcode.getCameras()
        .then((devices) => {
            if (devices && devices.length) {
                const cameraId = devices[0].id;
                const config = { fps: 10, qrbox: { width: 250, height: 250 } };
                html5QrCode = new Html5Qrcode("reader");

                html5QrCode
                    .start(
                        cameraId,
                        config,
                        (decodedText, decodedResult) => {
                            if (!isBarcodeDetected) {
                                // Display scanned result without any prefix
                                document.getElementById("barcode").value = decodedText; // Set the input value
                                isBarcodeDetected = true; // Set flag to indicate barcode has been detected
                                stopScanning();
                            }
                        },
                        (errorMessage) => {
                            // Ignore scan error
                        }
                    )
                    .then(() => {
                        isScanning = true; // Set scanning to true
                        document.getElementById("imageButton").style.display = "none"; // Hide upload button
                    })
                    .catch((err) => {
                        console.error("Error starting scanning: ", err);
                    });
            } else {
                console.error("No camera devices found.");
            }
        })
        .catch((err) => {
            console.error("Error fetching cameras: ", err);
        });
}

function stopScanning() {
    if (html5QrCode && isScanning) {
        html5QrCode
            .stop()
            .then(() => {
                console.log("QR Code scanning is stopped.");
                isScanning = false; // Reset scanning state
                isBarcodeDetected = false; // Reset barcode detected state
                document.getElementById("imageButton").style.display = "block"; // Show upload button
            })
            .catch((err) => {
                console.error("Error stopping scanning: ", err);
            });
    }
}

document.getElementById("startButton").onclick = function () {
    resetState(); // Reset state first
    if (isScanning) {
        stopScanning();
    } else {
        startScanning();
    }
};

document.getElementById("imageButton").onclick = function () {
    document.getElementById("imageInput").click(); // Trigger the hidden file input
};

document.getElementById("imageInput").addEventListener("change", function () {
    const input = this;
    if (input.files.length > 0) {
        const imageFile = input.files[0]; // Get the selected file
        if (isScanning) {
            stopScanning(); // Stop the camera scanner if it's running
        }

        // Clear the #reader element to ensure no image is displayed
        document.getElementById("reader").innerHTML = ""; 

        html5QrCode = new Html5Qrcode("reader");

        html5QrCode
            .scanFile(imageFile, false) // Pass the image file directly
            .then((decodedText) => {
                // Set the input value with the scanned text
                document.getElementById("barcode").value = decodedText; 
                isBarcodeDetected = true; // Set flag for barcode detection

                // Send the scanned text to the server
                sendResult(decodedText);
            })
            .catch((err) => {
                console.error("Error scanning image: ", err);
                // Set the input value to "Invalid barcode"
                document.getElementById("barcode").value = "Invalid barcode.";
            });
    } else {
        alert("Please select an image file.");
    }
});

// Reset state when starting a new scan or upload
function resetState() {
    isScanning = false;
    isBarcodeDetected = false;
    document.getElementById("startButton").innerText = "Start Scanning";
    document.getElementById("barcode").value = ""; // Clear previous results
}

// Example function to send the result to the server
function sendResult(decodedText) {
    console.log("Sending result to server: " + decodedText);
    // Add your code to send the decodedText to the server here
}