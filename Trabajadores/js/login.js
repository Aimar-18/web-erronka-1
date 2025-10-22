// Configuración del login - Usuarios válidos
const VALID_USERS = {
    'admin': {
        password: 'admin',
        redirect: 'Users/admin/admin.html'
    },
    'jurivisaida': {
        password: 'admin',
        redirect: 'Users/jurivisaida/jurivisaida.html'
    }
};

// Elementos del DOM
const loginForm = document.getElementById('loginForm');
const errorMessage = document.getElementById('error-message');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

// Event listener para el formulario
loginForm.addEventListener('submit', function(event) {
    event.preventDefault(); // Evitar el envío normal del formulario
    
    // Obtener valores
    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    
    // Limpiar mensaje de error previo
    errorMessage.classList.remove('show');
    errorMessage.textContent = '';
    
    // Validar credenciales
    if (VALID_USERS[username] && VALID_USERS[username].password === password) {
        // Login exitoso
        showSuccess();
        
        // Esperar un momento antes de redirigir
        setTimeout(function() {
            // Redirigir a la página correspondiente
            window.location.href = VALID_USERS[username].redirect;
        }, 1500);
        
    } else {
        // Login fallido
        showError('❌ Erabiltzailea edo pasahitza okerra. Saiatu berriro.');
        
        // Limpiar campos
        passwordInput.value = '';
        passwordInput.focus();
        
        // Añadir efecto de vibración
        loginForm.style.animation = 'none';
        setTimeout(() => {
            loginForm.style.animation = '';
        }, 10);
    }
});

// Función para mostrar error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    errorMessage.style.animation = 'shake 0.5s';
}

// Función para mostrar éxito
function showSuccess() {
    errorMessage.style.backgroundColor = 'rgba(0, 200, 0, 0.7)';
    errorMessage.textContent = '✅ Sarbidea baimenduta! Zerbitzarira birbideratzen...';
    errorMessage.classList.add('show');
    errorMessage.style.animation = 'none';
    
    // Deshabilitar el formulario
    usernameInput.disabled = true;
    passwordInput.disabled = true;
    loginForm.querySelector('.login-button').disabled = true;
}

// Limpiar mensaje de error al escribir
usernameInput.addEventListener('input', function() {
    if (errorMessage.classList.contains('show')) {
        errorMessage.classList.remove('show');
    }
});

passwordInput.addEventListener('input', function() {
    if (errorMessage.classList.contains('show')) {
        errorMessage.classList.remove('show');
    }
});