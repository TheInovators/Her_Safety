const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get("/test",(req,res)=>{
    console.log("api request")
    res.send("hello test")
})


// Middleware
app.use(express.json());
app.use(cors({
    origin: '*', // In production, replace with your frontend domain
    methods: ['GET', 'POST'],
    credentials: true
}));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/women_safety_db')
.then(() => {
    console.log('Connected to MongoDB successfully');
}).catch((err) => {
    console.error('MongoDB connection error:', err);
});

// User Schema
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    name: {
        type: String,
        trim: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

const User = mongoose.model('User', userSchema);



// Registration endpoint
app.post('/api/register', async (req, res) => {
    console.log("request for signup")
    try {
        const { email, password, name } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });

        res.status(201).json({
            message: 'Registration successful',
            token,
            user: { id: user._id, email: user.email, name: user.name }
        });

    } catch (error) {
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret_key', { expiresIn: '24h' });

        res.json({ message: 'Login successful', token });

    } catch (error) {
        res.status(500).json({ message: 'Login failed', error: error.message });
    }
});

// Start server



async function handleLogin(event) {
    event.preventDefault(); // Prevent form from submitting normally
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
                window.location.href = '/dashboard.html';
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
}