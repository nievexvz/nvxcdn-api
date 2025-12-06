const express = require('express');
const multer = require('multer');
const axios = require('axios');
const { generateFileId } = require('../utils/shortId');
const router = express.Router();

// Konfigurasi Multer untuk file upload
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 25 * 1024 * 1024 // 25MB
    }
});

// Fungsi untuk upload file ke GitHub
async function uploadToGitHub(filename, content) {
    try {
        console.log(`Uploading file: ${filename} to GitHub...`);
        
        const response = await axios.put(
            `https://api.github.com/repos/${process.env.GITHUB_USER}/${process.env.CDN_REPO}/contents/${filename}`,
            {
                message: `Upload file: ${filename}`,
                content: content.toString('base64'),
                branch: 'main'
            },
            {
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Upload successful:', response.data);
        return {
            success: true,
            download_url: response.data.content.download_url,
            sha: response.data.content.sha
        };
    } catch (error) {
        console.error('Error uploading to GitHub:', error.response?.data || error.message);
        return {
            success: false,
            error: error.response?.data || error.message
        };
    }
}

// POST /api/v1/cdn - untuk upload file
router.post('/', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'Tidak ada file yang diupload'
            });
        }

        console.log('File received:', {
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        });

        // Generate short filename
        const originalName = req.file.originalname;
        const extension = originalName.split('.').pop() || 'file';
        const fileId = generateFileId();
        const filename = `${fileId}.${extension}`;

        const creator = 'NvLabs'

        console.log('Generated filename:', filename);

        // Upload ke GitHub
        const uploadResult = await uploadToGitHub(filename, req.file.buffer);

        if (!uploadResult.success) {
            console.error('Upload failed:', uploadResult.error);
            return res.status(500).json({
                success: false,
                message: 'Gagal mengupload file ke GitHub',
                error: uploadResult.error
            });
        }

        // Return success response
        const responseData = {
            success: true,
            message: 'File berhasil diupload',
            data: {
                creator: creator,
                id: fileId,
                filename: filename,
                originalName: originalName,
                size: req.file.size,
                mimeType: req.file.mimetype,
                url: `${process.env.APP_DOMAIN}/${filename}`,
                access_url: `${process.env.APP_DOMAIN}/${filename}`
            }
        };

        console.log('Upload successful, returning:', responseData);
        res.json(responseData);

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({
            success: false,
            message: 'Terjadi kesalahan saat upload',
            error: error.message
        });
    }
});

module.exports = router;
