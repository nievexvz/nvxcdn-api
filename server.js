require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const authMiddleware = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 6767;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files dari folder public
app.use(express.static(path.join(__dirname, 'public')));

// Routes dengan API Key protection untuk API
app.use('/5/upload', authMiddleware, require('./routes/cdn'));
app.use('/5/cdn', authMiddleware, require('./routes/cdn'));
app.use('/upload', authMiddleware, require('./routes/cdn'));
app.use('/cdn', authMiddleware, require('./routes/cdn'));
app.use('/5/short', authMiddleware, require('./routes/short'));
app.use('/shorten', authMiddleware, require('./routes/short'));

// Public routes untuk akses file dan redirect
app.use('/', require('./routes/public'));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Root endpoint - serve index.html
app.get('/', (req, res) => {a
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: 'Terjadi kesalahan internal server',
        error: err.message
    });
});

// 404 handler untuk API routes
app.use('/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint API tidak ditemukan'
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Server berjalan di ${process.env.APP_DOMAIN}`);
    console.log(`📊 Health check: ${process.env.APP_DOMAIN}/health`);
    console.log(`🖥️  Demo tersedia di: ${process.env.APP_DOMAIN}`);
    console.log(`🔑 API Key: ${process.env.API_KEY}`);
});
