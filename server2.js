const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'CombatWar1*',
    database: 'TooMuchCombat'
});

db.connect((err) => {
    if (err) {
        console.error('Error connecting to MySQL:', err);
        return;
    }
    console.log('Connected to MySQL');
});

// Function to validate email format
function validateEmail(email) {
    const expression = /^[^@]+@\w+(\.\w+)+\w$/;
    return expression.test(String(email).toLowerCase());
}

// Function to validate password length
function validatePassword(password) {
    return password.length >= 6;
}

// Function to validate field is not empty
function validateField(field) {
    return field && field.trim().length > 0;
}

// Register endpoint
app.post('/register', async (req, res) => {
    const { email, nickname, password } = req.body;

    // Validate input
    if (!validateEmail(email) || !validatePassword(password) || !validateField(nickname)) {
        return res.status(400).send('Please fill out all fields correctly.');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Check if the user already exists
    const checkUserQuery = 'SELECT * FROM users WHERE email = ?';
    db.query(checkUserQuery, [email], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Error registering user');
        }

        if (results.length > 0) {
            return res.status(400).send('User already exists. Please login.');
        }

        // Insert new user into database
        const insertUserQuery = 'INSERT INTO users (email, nickname, password) VALUES (?, ?, ?)';
        db.query(insertUserQuery, [email, nickname, hashedPassword], (err, result) => {
            if (err) {
                console.error('Error inserting user into database:', err);
                return res.status(500).send('Error registering user');
            }
            res.send('User registered successfully');
        });
    });
});

// Login endpoint
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Validate input
    if (!validateEmail(email) || !validatePassword(password)) {
        return res.status(400).send('Please enter valid email and password.');
    }

    // Check if the user exists in the database
    const query = 'SELECT * FROM users WHERE email = ?';
    db.query(query, [email], async (err, results) => {
        if (err) {
            console.error('Error checking user:', err);
            return res.status(500).send('Error logging in');
        }

        if (results.length === 0) {
            return res.status(400).send('User not found. Please register.');
        }

        const user = results[0];

        // Compare password hashes
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(400).send('Incorrect password.');
        }

        // Password is correct, user can be logged in
        res.send('Login successful');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
