// Konfigurasi API
const API_BASE = 'https://www.nievexsviz.my.id';
const API_KEY = 'nvxc';

// State management
let state = {
    filesUploaded: 0,
    urlsCreated: 0
};

// Inisialisasi
document.addEventListener('DOMContentLoaded', function() {
    checkApiStatus();
    setupEventListeners();
    loadStats();
});

// Setup event listeners
function setupEventListeners() {
    // Drag and drop untuk file upload
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-blue-500', 'bg-blue-50');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });
}

// Handle file selection
function handleFileSelect(file) {
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('selectedFileName');
    const fileSize = document.getElementById('selectedFileSize');

    fileName.textContent = file.name;
    fileSize.textContent = formatFileSize(file.size);
    fileInfo.classList.remove('hidden');

    // Validasi ukuran file
    if (file.size > 25 * 1024 * 1024) {
        showNotification('Ukuran file melebihi 25MB', 'error');
        fileInfo.classList.add('hidden');
        fileInput.value = '';
    }
}

// Fungsi untuk menampilkan notifikasi
function showNotification(message, type = 'info') {
    // Hapus notifikasi sebelumnya
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };

    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-triangle',
        info: 'fa-info-circle',
        warning: 'fa-exclamation'
    };

    const notification = document.createElement('div');
    notification.className = `notification fixed top-6 right-6 ${colors[type]} text-white px-6 py-4 rounded-2xl shadow-2xl transform transition-all duration-500 translate-x-32 opacity-0 z-50`;
    notification.innerHTML = `
        <div class="flex items-center">
            <i class="fas ${icons[type]} mr-3 text-lg"></i>
            <span class="font-medium">${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    // Animasi masuk
    setTimeout(() => {
        notification.classList.remove('translate-x-32', 'opacity-0');
        notification.classList.add('translate-x-0', 'opacity-100');
    }, 100);

    // Animasi keluar setelah 4 detik
    setTimeout(() => {
        notification.classList.remove('translate-x-0', 'opacity-100');
        notification.classList.add('translate-x-32', 'opacity-0');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 4000);
}

// Fungsi untuk cek status API
async function checkApiStatus() {
    const statusElement = document.getElementById('apiStatus');
    try {
        const response = await fetch(`${API_BASE}/health`);
        if (response.ok) {
            statusElement.innerHTML = '<span class="inline-flex items-center"><i class="fas fa-circle mr-2 text-green-500"></i>Online</span>';
        } else {
            throw new Error('API tidak merespon');
        }
    } catch (error) {
        statusElement.innerHTML = '<span class="inline-flex items-center"><i class="fas fa-circle mr-2 text-red-500"></i>Offline</span>';
    }
}

// Fungsi untuk upload file
async function uploadFile() {
    const fileInput = document.getElementById('fileInput');
    const uploadBtn = document.getElementById('uploadBtn');
    const uploadResult = document.getElementById('uploadResult');
    const uploadProgress = document.getElementById('uploadProgress');

    if (!fileInput.files[0]) {
        showNotification('Pilih file terlebih dahulu', 'error');
        return;
    }

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
        // Tampilkan progress bar
        uploadProgress.classList.remove('hidden');
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Uploading...';

        const xhr = new XMLHttpRequest();
        
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
                const percentComplete = (e.loaded / e.total) * 100;
                document.getElementById('progressBar').style.width = percentComplete + '%';
                document.getElementById('progressPercent').textContent = Math.round(percentComplete) + '%';
            }
        });

        xhr.addEventListener('load', () => {
            if (xhr.status === 200) {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    // Tampilkan hasil
                    document.getElementById('fileUrl').value = response.data.url;
                    document.getElementById('fileName').textContent = response.data.filename;
                    document.getElementById('fileSize').textContent = formatFileSize(response.data.size);
                    
                    uploadResult.classList.remove('hidden');
                    state.filesUploaded++;
                    updateStats();
                    showNotification('File berhasil diupload ke GitHub!', 'success');
                    
                    // Reset form
                    fileInput.value = '';
                    document.getElementById('fileInfo').classList.add('hidden');
                } else {
                    throw new Error(response.message);
                }
            } else {
                throw new Error('Upload gagal - ' + xhr.status);
            }
        });

        xhr.addEventListener('error', () => {
            throw new Error('Terjadi kesalahan jaringan');
        });

        xhr.open('POST', `${API_BASE}/api/v1/cdn`);
        xhr.setRequestHeader('x-api-key', API_KEY);
        xhr.send(formData);

    } catch (error) {
        showNotification(error.message, 'error');
    } finally {
        // Reset button dan progress
        setTimeout(() => {
            uploadBtn.disabled = false;
            uploadBtn.innerHTML = '<i class="fas fa-upload mr-2"></i>Upload';
            uploadProgress.classList.add('hidden');
            document.getElementById('progressBar').style.width = '0%';
            document.getElementById('progressPercent').textContent = '0%';
        }, 2000);
    }
}

// Fungsi untuk copy ke clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    element.setSelectionRange(0, 99999);
    
    try {
        navigator.clipboard.writeText(element.value);
        showNotification('URL disalin ke clipboard!', 'success');
    } catch (err) {
        // Fallback untuk browser lama
        document.execCommand('copy');
        showNotification('URL disalin!', 'success');
    }
}

// Fungsi untuk format ukuran file
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Fungsi untuk load dan update stats
function loadStats() {
    // Load dari localStorage jika ada
    const savedStats = localStorage.getItem('cdnStats');
    if (savedStats) {
        state = { ...state, ...JSON.parse(savedStats) };
    }
    updateStats();
}

function updateStats() {
    document.getElementById('filesCount').textContent = state.filesUploaded;
    document.getElementById('urlsCount').textContent = state.urlsCreated;
    
    // Save ke localStorage
    localStorage.setItem('cdnStats', JSON.stringify(state));
}
