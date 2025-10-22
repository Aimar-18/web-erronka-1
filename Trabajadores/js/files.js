// Sistema de gestión de archivos estilo Drive

// Almacenamiento local de archivos
let filesDatabase = JSON.parse(localStorage.getItem('aimaitz_files')) || [];

// Elementos del DOM
const uploadBtn = document.getElementById('uploadBtn');
const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('fileInput');
const fileLabel = document.querySelector('.file-label');
const fileListPreview = document.getElementById('file-list');
const uploadSubmit = document.getElementById('uploadSubmit');
const uploadCancel = document.getElementById('uploadCancel');
const filesContainer = document.getElementById('filesContainer');
const searchInput = document.getElementById('searchInput');
const fileViewer = document.getElementById('file-viewer');
const closeViewer = document.getElementById('closeViewer');
const viewerFileName = document.getElementById('viewerFileName');
const viewerBody = document.getElementById('viewerBody');
const viewerDownload = document.getElementById('viewerDownload');

let selectedFiles = [];
let currentViewingFile = null;

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    renderFiles();
    setupEventListeners();
});

// Configurar event listeners
function setupEventListeners() {
    // Mostrar/ocultar área de subida
    uploadBtn.addEventListener('click', function(e) {
        e.preventDefault();
        uploadArea.classList.toggle('hidden');
    });

    // Cancelar subida
    uploadCancel.addEventListener('click', function() {
        uploadArea.classList.add('hidden');
        fileInput.value = '';
        selectedFiles = [];
        renderFilePreview();
    });

    // Seleccionar archivos
    fileInput.addEventListener('change', function(e) {
        selectedFiles = Array.from(e.target.files);
        renderFilePreview();
    });

    // Drag and drop
    fileLabel.addEventListener('dragover', function(e) {
        e.preventDefault();
        fileLabel.style.borderColor = '#ff6b9d';
        fileLabel.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    });

    fileLabel.addEventListener('dragleave', function() {
        fileLabel.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        fileLabel.style.backgroundColor = 'transparent';
    });

    fileLabel.addEventListener('drop', function(e) {
        e.preventDefault();
        fileLabel.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        fileLabel.style.backgroundColor = 'transparent';
        
        selectedFiles = Array.from(e.dataTransfer.files);
        renderFilePreview();
    });

    // Subir archivos
    uploadSubmit.addEventListener('click', function() {
        uploadFiles();
    });

    // Buscar archivos
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        renderFiles(searchTerm);
    });

    // Cerrar visor
    closeViewer.addEventListener('click', function() {
        fileViewer.classList.add('hidden');
        currentViewingFile = null;
    });

    // Descargar desde visor
    viewerDownload.addEventListener('click', function() {
        if (currentViewingFile) {
            downloadFile(currentViewingFile);
        }
    });
}

// Renderizar preview de archivos seleccionados
function renderFilePreview() {
    if (selectedFiles.length === 0) {
        fileListPreview.innerHTML = '';
        return;
    }

    fileListPreview.innerHTML = selectedFiles.map((file, index) => `
        <div class="file-preview-item">
            <span>${getFileIcon(file.name)} ${file.name} (${formatFileSize(file.size)})</span>
            <button onclick="removeFileFromSelection(${index})" style="background: rgba(255,0,0,0.7); color: white; border: none; padding: 5px 10px; border-radius: 5px; cursor: pointer;">✖</button>
        </div>
    `).join('');
}

// Eliminar archivo de la selección
function removeFileFromSelection(index) {
    selectedFiles.splice(index, 1);
    renderFilePreview();
}

// Subir archivos
function uploadFiles() {
    if (selectedFiles.length === 0) {
        alert('Ez dago fitxategirik hautatuta!');
        return;
    }

    selectedFiles.forEach(file => {
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const fileData = {
                id: Date.now() + Math.random(),
                name: file.name,
                size: file.size,
                type: file.type,
                data: e.target.result,
                uploadDate: new Date().toISOString()
            };

            filesDatabase.push(fileData);
            saveToLocalStorage();
            renderFiles();
        };

        reader.readAsDataURL(file);
    });

    // Limpiar
    uploadArea.classList.add('hidden');
    fileInput.value = '';
    selectedFiles = [];
    renderFilePreview();
    
    alert('Fitxategiak behar bezala igo dira! ✅');
}

// Guardar en localStorage
function saveToLocalStorage() {
    localStorage.setItem('aimaitz_files', JSON.stringify(filesDatabase));
}

// Renderizar archivos
function renderFiles(searchTerm = '') {
    let filesToShow = filesDatabase;

    // Filtrar por búsqueda
    if (searchTerm) {
        filesToShow = filesDatabase.filter(file => 
            file.name.toLowerCase().includes(searchTerm)
        );
    }

    if (filesToShow.length === 0) {
        filesContainer.innerHTML = `
            <div class="no-files">
                📁 Ez dago fitxategirik momentuz.<br>
                Egin klik "Igo fitxategia" botoian lehenengo fitxategia gehitzeko.
            </div>
        `;
        return;
    }

    filesContainer.innerHTML = filesToShow.map(file => `
        <div class="file-card" data-file-id="${file.id}">
            <div class="file-icon">${getFileIcon(file.name)}</div>
            <div class="file-name">${file.name}</div>
            <div class="file-info">
                ${formatFileSize(file.size)}<br>
                ${formatDate(file.uploadDate)}
            </div>
            <div class="file-actions">
                <button class="btn-view" onclick="viewFile(${file.id})">👁️ Ikusi</button>
                <button class="btn-download" onclick="downloadFile(${file.id})">⬇️</button>
                <button class="btn-delete" onclick="deleteFile(${file.id})">🗑️</button>
            </div>
        </div>
    `).join('');
}

// Obtener icono según tipo de archivo
function getFileIcon(filename) {
    const extension = filename.split('.').pop().toLowerCase();
    
    const icons = {
        // Imágenes
        'jpg': '🖼️', 'jpeg': '🖼️', 'png': '🖼️', 'gif': '🖼️', 'svg': '🖼️', 'webp': '🖼️',
        // Documentos
        'pdf': '📄', 'doc': '📝', 'docx': '📝', 'txt': '📝', 'rtf': '📝',
        // Hojas de cálculo
        'xls': '📊', 'xlsx': '📊', 'csv': '📊',
        // Presentaciones
        'ppt': '📊', 'pptx': '📊',
        // Archivos comprimidos
        'zip': '📦', 'rar': '📦', '7z': '📦', 'tar': '📦', 'gz': '📦',
        // Código
        'html': '💻', 'css': '💻', 'js': '💻', 'json': '💻', 'xml': '💻',
        'py': '🐍', 'java': '☕', 'php': '🐘',
        // Video
        'mp4': '🎥', 'avi': '🎥', 'mov': '🎥', 'wmv': '🎥', 'mkv': '🎥',
        // Audio
        'mp3': '🎵', 'wav': '🎵', 'ogg': '🎵', 'flac': '🎵',
    };

    return icons[extension] || '📄';
}

// Formatear tamaño de archivo
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Formatear fecha
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('eu') + ' ' + date.toLocaleTimeString('eu', {hour: '2-digit', minute: '2-digit'});
}

// Ver archivo
function viewFile(fileId) {
    const file = filesDatabase.find(f => f.id === fileId);
    if (!file) return;

    currentViewingFile = fileId;
    viewerFileName.textContent = file.name;
    
    const extension = file.name.split('.').pop().toLowerCase();
    
    // Renderizar según tipo
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(extension)) {
        // Imagen
        viewerBody.innerHTML = `<img src="${file.data}" alt="${file.name}">`;
    } else if (extension === 'pdf') {
        // PDF
        viewerBody.innerHTML = `<iframe src="${file.data}" type="application/pdf"></iframe>`;
    } else if (['mp4', 'webm', 'ogg'].includes(extension)) {
        // Video
        viewerBody.innerHTML = `<video controls><source src="${file.data}" type="video/${extension}"></video>`;
    } else if (['mp3', 'wav', 'ogg'].includes(extension)) {
        // Audio
        viewerBody.innerHTML = `<audio controls><source src="${file.data}" type="audio/${extension}"></audio>`;
    } else if (extension === 'txt') {
        // Texto plano
        fetch(file.data)
            .then(response => response.text())
            .then(text => {
                viewerBody.innerHTML = `<pre style="white-space: pre-wrap; font-family: monospace;">${text}</pre>`;
            });
    } else {
        // Otros archivos
        viewerBody.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <div style="font-size: 5rem; margin-bottom: 20px;">${getFileIcon(file.name)}</div>
                <h3>${file.name}</h3>
                <p>Fitxategi mota hau ezin da aurrebistan ikusi.</p>
                <p>Egin klik "Deskargatu" botoian fitxategia jaisteko.</p>
            </div>
        `;
    }

    fileViewer.classList.remove('hidden');
}

// Descargar archivo
function downloadFile(fileId) {
    const file = filesDatabase.find(f => f.id === fileId);
    if (!file) return;

    const link = document.createElement('a');
    link.href = file.data;
    link.download = file.name;
    link.click();
}

// Eliminar archivo
function deleteFile(fileId) {
    if (!confirm('Ziur zaude fitxategia ezabatu nahi duzula?')) return;

    filesDatabase = filesDatabase.filter(f => f.id !== fileId);
    saveToLocalStorage();
    renderFiles();
    
    alert('Fitxategia ezabatu da! 🗑️');
}
