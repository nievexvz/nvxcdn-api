# NVX Cloud

Upload file dan dapatkan permanent live URL serta pendekkan link yang sangat panjang

## Teknologi:
- Node.js
- Express.js
- Font Awesome
- Vercel (Serverless)

---

**Demo available on [nievexsviz.my.id](https://nievexsviz.my.id)**

## API

**Endpoint: **
- `https://nievexsviz.my.id/api/v1/cdn`
- `https://nievexsviz.my.id/api/v1/short`

---

<details open>
<summary>Contoh upload menggunakan cURL:</summary>

 ```bash
# Upload file image
curl -X POST  https://nievexsviz.my.id/api/v1/cdn \
  -H "x-api-key: nvxc" \
  -F "file=@./test-image.jpg"

# Upload file PDF
curl -X POST https://nievexsviz.my.id/api/v1/cdn \
  -H "x-api-key: nvxc" \
  -F "file=@./document.pdf"

# Upload file text
curl -X POST https://nievexsviz.my.id/api/v1/cdn \
  -H "x-api-key: nvxc" \
  -F "file=@./notes.txt"
```    
   
</details>

---

<details>
<summary>Contoh shorten menggunakan cURL:</summary>

```bash
# Short URL dengan auto-generated ID
curl -X POST https://nievexsviz.my.id/api/v1/short \
  -H "x-api-key: nvxc" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://github.com/nievexvz/nvxcdn1"
  }'

# Short URL dengan custom ID
curl -X POST https://nievexsviz.my.id/api/v1/short \
  -H "x-api-key: nvxc" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/very-long-path/page.html",
    "customId": "my-page"
  }'
```

</details>

---

<details>
<summary>Contoh upload menggunakan Node.js (min v18+)</summary>

```js
const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function uploadFile(filePath) {
    try {
        console.log(`📤 Uploading: ${filePath}`);
        
        const formData = new FormData();
        formData.append('file', fs.createReadStream(filePath));

        const response = await axios.post('https://nievexsviz.my.id/api/v1/cdn', formData, {
            headers: {
                'x-api-key': 'nvxc',
                ...formData.getHeaders()
            }
        });

        if (response.data.success) {
            console.log('✅ Upload Success!');
            console.log(`📁 File ID: ${response.data.data.id}`);
            console.log(`🔗 URL: ${response.data.data.url}`);
            return response.data;
        }
    } catch (error) {
        console.log('❌ Upload Failed:', error.response?.data?.message || error.message);
    }
}

// Contoh penggunaan
// uploadFile('gambar.jpg');
// uploadFile('document.pdf');

// Jalankan jika file ada
if (process.argv[2]) {
    uploadFile(process.argv[2]);
} else {
    console.log('Usage: node simple-upload.js <file-path>');
    console.log('Example: node simple-upload.js image.jpg');
}
```

</details>

---

<details>
<summary>Contoh shorten dengan Node.js (min v18+)</summary>

```js
const axios = require('axios');

async function createShortUrl(longUrl, customId = null) {
    try {
        console.log(`🔗 Shortening: ${longUrl}`);
        
        const data = { url: longUrl };
        if (customId) data.customId = customId;

        const response = await axios.post('https://nievexsviz.my.id/api/v1/short', data, {
            headers: {
                'x-api-key': 'nvxc',
                'Content-Type': 'application/json'
            }
        });

        if (response.data.success) {
            console.log('✅ Short URL Created!');
            console.log(`🆔 ID: ${response.data.data.id}`);
            console.log(`🔗 Short URL: ${response.data.data.short_url}`);
            return response.data;
        }
    } catch (error) {
        console.log('❌ Shorten Failed:', error.response?.data?.message || error.message);
    }
}

// Contoh penggunaan
// createShortUrl('https://google.com');
// createShortUrl('https://github.com', 'mygithub');

// Jalankan dari command line
if (process.argv[2]) {
    const customId = process.argv[3] || null;
    createShortUrl(process.argv[2], customId);
} else {
    console.log('Usage: node simple-shorten.js <url> [custom-id]');
    console.log('Example: node simple-shorten.js https://google.com');
    console.log('Example: node simple-shorten.js https://github.com mygit');
}
```

</details>

---

## — 2025 NineTwelve.

