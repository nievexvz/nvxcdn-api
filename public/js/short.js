// Fungsi untuk membuat short URL
async function createShortUrl() {
    const longUrl = document.getElementById('longUrl').value;
    const customId = document.getElementById('customId').value;
    const shortenBtn = document.getElementById('shortenBtn');
    const shortenResult = document.getElementById('shortenResult');

    if (!longUrl) {
        showNotification('Masukkan URL tujuan', 'error');
        return;
    }

    try {
        shortenBtn.disabled = true;
        shortenBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Memproses...';

        const response = await fetch(`${API_BASE}/api/v1/short`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': API_KEY
            },
            body: JSON.stringify({
                url: longUrl,
                customId: customId || undefined
            })
        });

        const data = await response.json();

        if (data.success) {
            // Tampilkan hasil
            document.getElementById('shortUrl').value = data.data.short_url;
            document.getElementById('urlId').textContent = data.data.id;
            document.getElementById('originalUrl').textContent = data.data.original_url;
            
            shortenResult.classList.remove('hidden');
            state.urlsCreated++;
            updateStats();
            showNotification('Short URL berhasil dibuat!', 'success');
            
            // Reset form
            document.getElementById('longUrl').value = '';
            document.getElementById('customId').value = '';
        } else {
            throw new Error(data.message);
        }

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        shortenBtn.disabled = false;
        shortenBtn.innerHTML = '<i class="fas fa-compress-alt mr-2"></i>Buat Short URL';
    }
}

// Event listeners untuk input enter
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('longUrl').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createShortUrl();
    });

    document.getElementById('customId').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') createShortUrl();
    });
});
