/**
 * Lider Elektrik - Karar Destek Sistemi (KDS)
 * Main Express Server
 * 
 * This is the entry point for the Decision Support System backend.
 * It serves the static frontend and provides API endpoints for analysis.
 */

// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const apiRoutes = require('./routes/api');

// Initialize Express app
const app = express();

// ======================
// Middleware Configuration
// ======================

// Enable CORS for all origins (can be restricted later)
app.use(cors());

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ======================
// API Routes (must come BEFORE static files)
// ======================

// Simple login endpoint (demo credentials)
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    if (username === "Lider Elektrik" && password === "123") {
        return res.json({ success: true, redirect: "/index.html" });
    }

    return res.status(401).json({
        success: false,
        message: "Kullanıcı adı veya şifre hatalı."
    });
});

// Mount API routes at /api
app.use('/api', apiRoutes);

// ======================
// Static Files & SPA Fallback
// ======================

// Default entry: login page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Serve static files from the /public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve images statically
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));

// Fallback: serve index.html for any unmatched routes (SPA-style)
// This must come AFTER API routes to avoid catching /api/* requests
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ======================
// Error Handling Middleware
// ======================

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.'
    });
});

// ======================
// Start Server
// ======================

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log('🔌 Lider Elektrik - Karar Destek Sistemi');
    console.log('='.repeat(50));
    console.log(`✅ Sunucu çalışıyor: http://localhost:${PORT}`);
    console.log(`📁 Statik dosyalar: /public`);
    console.log(`🔗 API endpoint: /api`);
    console.log('='.repeat(50));
});

module.exports = app;

