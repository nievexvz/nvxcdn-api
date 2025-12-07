const express = require('express');
const axios = require('axios');
const { generateUrlId } = require('../utils/shortId');
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

        const content = response.data.files['urlsdata.json'].content;
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
                    'urlsdata.json': {
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

// POST /api/v1/short - untuk membuat short URL
router.post('/', async (req, res) => {
    try {
        const { url, customId } = req.body;

        if (!url) {
            return res.status(400).json({
                success: false,
                message: 'URL tujuan diperlukan'
            });
        }

        // Validasi URL
        try {
            new URL(url);
        } catch (error) {
            return res.status(400).json({
                success: false,
                message: 'URL tidak valid'
            });
        }

        // Baca data saat ini dari Gist
        const gistData = await getGistData();
        
        // Generate short ID atau gunakan custom ID
        const shortId = customId || generateUrlId();
        
        // Cek jika ID sudah ada
        if (gistData[shortId]) {
            return res.status(400).json({
                success: false,
                message: 'ID sudah digunakan, silakan gunakan ID lain'
            });
        }

        // Tambahkan data baru
        gistData[shortId] = {
            url: url,
            createdAt: new Date().toISOString(),
            clicks: 0
        };

        // Update Gist
        const updateResult = await updateGistData(gistData);

        if (!updateResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Gagal menyimpan data ke Gist',
                error: updateResult.error
            });
        }

        // Return success response
        res.json({
            success: true,
            message: 'Short URL berhasil dibuat',
            creator: 'NvLabs',
            data: {
                id: shortId,
                original_url: url,
                short_url: `${process.env.APP_DOMAIN}/r/${shortId}`,
                createdAt: gistData[shortId].createdAt
            }
        });

    } catch (error) {
        console.error('Create short URL error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat membuat short URL',
            error: error.message
        });
    }
});

module.exports = router;
