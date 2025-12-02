const express = require('express');
const axios = require('axios');
const router = express.Router();

// Fungsi untuk membaca data dari Gist
async function getGistData() {
    try {
        const response = await axios.get(
            `https://api.github.com/gists/${process.env.GIST_ID}`,
            {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        const content = response.data.files['urlsdata'].content;
        return JSON.parse(content);
    } catch (error) {
        console.error('Error reading Gist:', error.response?.data || error.message);
        return {};
    }
}

// Fungsi untuk update data ke Gist
async function updateGistData(data) {
    try {
        const response = await axios.patch(
            `https://api.github.com/gists/${process.env.GIST_ID}`,
            {
                description: 'URL Shortener Database',
                files: {
                    'urlsdata': {
                        content: JSON.stringify(data, null, 2)
                    }
                }
            },
            {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                }
            }
        );

        return { success: true };
    } catch (error) {
        console.error('Error updating Gist:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

// Fungsi untuk mendapatkan file dari GitHub
async function getFileFromGitHub(filename) {
    try {
        const response = await axios.get(
            `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.CDN_REPO}/contents/${filename}`,
            {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json'
                }
            }
        );

        return {
            success: true,
            content: Buffer.from(response.data.content, 'base64'),
            size: response.data.size,
            download_url: response.data.download_url
        };
    } catch (error) {
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

// Public access untuk file CDN: GET /:filename
router.get('https://shinai.my.id/:filename', async (req, res) => {
    try {
        const { filename } = req.params;

        // Dapatkan file dari GitHub
        const fileResult = await getFileFromGitHub(filename);

        if (!fileResult.success) {
            return res.status(404).json({
                success: false,
                message: 'File tidak ditemukan'
            });
        }

        // Tentukan content type berdasarkan extension
        const extension = filename.split('.').pop().toLowerCase();
        const contentTypes = {
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'png': 'image/png',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'svg': 'image/svg+xml',
            'pdf': 'application/pdf',
            'txt': 'text/plain',
            'json': 'application/json',
            'js': 'application/javascript',
            'css': 'text/css',
            'html': 'text/html',
            'mp4': 'video/mp4',
            'mp3': 'audio/mpeg',
            'zip': 'application/zip'
        };

        const contentType = contentTypes[extension] || 'application/octet-stream';

        // Set headers dan kirim file
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', fileResult.content.length);
        res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache 1 tahun
        res.send(fileResult.content);

    } catch (error) {
        console.error('File access error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat mengakses file',
            error: error.message
        });
    }
});

// Public redirect untuk short URL: GET /r/:id
router.get('https://shinai.my.id/r/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Baca data dari Gist
        const gistData = await getGistData();
        
        const urlData = gistData[id];

        if (!urlData) {
            return res.status(404).json({
                success: false,
                message: 'Short URL tidak ditemukan'
            });
        }

        // Update click count
        urlData.clicks = (urlData.clicks || 0) + 1;
        urlData.lastAccessed = new Date().toISOString();
        
        // Simpan update ke Gist
        await updateGistData(gistData);

        // Redirect ke URL tujuan
        res.redirect(302, urlData.url);

    } catch (error) {
        console.error('Redirect error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat redirect',
            error: error.message
        });
    }
});

module.exports = router;
