document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('store-form');

    form.addEventListener('submit', function(event) {
        event.preventDefault(); // Prevent default form submission

        // Create a JSON object from form data
        const jsonData = {
            nama_toko: document.getElementById('store-name').value,
            latitude: document.getElementById('latitude').value,
            longitude: document.getElementById('longitude').value
        };

        fetch(form.action, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json', // Specify content type as JSON
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') // Include CSRF token
            },
            body: JSON.stringify(jsonData) // Convert JSON object to string
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            if (data.status === 200) {
                alert(data.message); // Success message
                form.reset(); // Clear form
            } else {
                alert('Error: ' + data.message); // Handle errors
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
