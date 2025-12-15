// Referencias a elementos del DOM
const takePhotoBtn = document.getElementById('takePhotoBtn');
const cameraContainer = document.getElementById('cameraContainer');
const video = document.getElementById('video');
const captureBtn = document.getElementById('captureBtn');
const cancelBtn = document.getElementById('cancelBtn');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Modal elementos
const photoModal = document.getElementById('photoModal');
const capturedImage = document.getElementById('capturedImage');
const latitudeSpan = document.getElementById('latitude');
const longitudeSpan = document.getElementById('longitude');
const mapsLink = document.getElementById('mapsLink');
const closeModal = document.querySelector('.close');

let stream = null;

// Función para abrir la cámara
async function openCamera() {
    try {
        // Solicitar acceso a la cámara
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment', // Preferir cámara trasera
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        video.srcObject = stream;
        
        // Mostrar contenedor de cámara
        cameraContainer.style.display = 'block';
        takePhotoBtn.style.display = 'none';

        console.log('Cámara abierta correctamente');
    } catch (error) {
        console.error('Error al abrir cámara:', error);
        alert('No se pudo acceder a la cámara. Por favor, verifica los permisos.');
    }
}

// Función para cerrar la cámara
function closeCamera() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        video.srcObject = null;
    }
    cameraContainer.style.display = 'none';
    takePhotoBtn.style.display = 'block';
}

// Función para obtener geolocalización
function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Geolocalización no soportada'));
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                console.error('Error al obtener ubicación:', error);
                reject(error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    });
}

// Función para capturar foto + GPS
async function capturePhotoWithLocation() {
    try {
        // Capturar la imagen del video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convertir a Base64
        const photoDataUrl = canvas.toDataURL('image/jpeg', 0.9);

        console.log('Foto capturada');

        // Obtener ubicación GPS
        console.log('Obteniendo ubicación GPS...');
        const location = await getLocation();

        console.log('Ubicación obtenida:', location);

        // Cerrar cámara
        closeCamera();

        // Mostrar modal con foto y datos
        showPhotoModal(photoDataUrl, location);

    } catch (error) {
        console.error('Error al capturar foto con ubicación:', error);
        
        if (error.code === 1) {
            alert('Permiso de ubicación denegado. Por favor, habilita el acceso a la ubicación.');
        } else if (error.code === 2) {
            alert('No se pudo obtener la ubicación. Verifica tu conexión GPS.');
        } else if (error.code === 3) {
            alert('Tiempo de espera agotado al obtener la ubicación.');
        } else {
            alert('Error al capturar foto con ubicación: ' + error.message);
        }
        
        closeCamera();
    }
}

// Función para mostrar el modal con la foto y ubicación
function showPhotoModal(photoDataUrl, location) {
    // Establecer la imagen
    capturedImage.src = photoDataUrl;

    // Establecer coordenadas
    latitudeSpan.textContent = location.latitude.toFixed(6);
    longitudeSpan.textContent = location.longitude.toFixed(6);

    // Crear enlace a Google Maps
    const mapsUrl = `https://www.google.com/maps?q=${location.latitude},${location.longitude}`;
    mapsLink.href = mapsUrl;

    // Mostrar modal
    photoModal.style.display = 'block';
}

// Event Listeners
takePhotoBtn.addEventListener('click', openCamera);

captureBtn.addEventListener('click', capturePhotoWithLocation);

cancelBtn.addEventListener('click', closeCamera);

// Cerrar modal
closeModal.addEventListener('click', () => {
    photoModal.style.display = 'none';
});

// Cerrar modal al hacer clic fuera
window.addEventListener('click', (event) => {
    if (event.target === photoModal) {
        photoModal.style.display = 'none';
    }
});

// Limpiar recursos al cerrar la página
window.addEventListener('beforeunload', closeCamera);

console.log(' App inicializada correctamente');
