async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const messageElement = document.getElementById('message');

    // Clear previous messages
    messageElement.textContent = '';
    messageElement.className = 'message';

    try {
        const response = await fetch('http://localhost:5000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            messageElement.textContent = 'Login successful! Redirecting...';
            messageElement.classList.add('success');
            console.log('Token:', data.token); // Save or use the token as needed

            // Redirect to a dashboard or another page
            setTimeout(() => {
                window.location.href = '/index1.html';
            }, 1500);
        } else {
            messageElement.textContent = data.message || 'Login failed';
            messageElement.classList.add('error');
        }
    } catch (error) {
        console.error('Error:', error);
        messageElement.textContent = 'An error occurred. Please try again.';
        messageElement.classList.add('error');
    }
    mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/women_safety_db')
    .then(() => {
        console.log('Connected to MongoDB successfully');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });

}
