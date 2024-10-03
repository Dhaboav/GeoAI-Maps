document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('store-form');

    // Helper function to extract form data
    function getFormData() {
        return {
            nama_toko: document.getElementById('store-name').value,
            latitude: document.getElementById('latitude').value,
            longitude: document.getElementById('longitude').value
        };
    }

    // Helper function to send the request
    async function sendFormData(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }

            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return { status: 'error', message: error.message };
        }
    }

    // Helper function to handle response
    function handleResponse(data) {
        if (data.status === 200) {
            alert(data.message);
            form.reset();
        } else {
            alert('Error: ' + data.message);
        }
    }

    // Event listener for form submission
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Prevent default form submission

        const jsonData = getFormData();
        const data = await sendFormData(form.action, jsonData);
        handleResponse(data);
    });
});