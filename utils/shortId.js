// Fungsi sederhana untuk generate short ID yang lebih reliable
function generateShortId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Fungsi untuk CDN files (6-8 karakter)
function generateFileId() {
    return generateShortId(6);
}

// Fungsi untuk short URLs (5-6 karakter)  
function generateUrlId() {
    return generateShortId(5);
}

module.exports = {
    generateShortId,
    generateFileId,
    generateUrlId
};
