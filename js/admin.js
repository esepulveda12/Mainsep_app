// Definición de las secciones del dashboard
const sections = {
    dashboard: `
        <div class="header">
            <h1>Bienvenido, <span id="username"></span></h1>
            <p class="date" id="current-date"></p>
        </div>
        <div class="dashboard-grid">
            <div class="card">
                <h2>Información de Usuario</h2>
                <div id="user-info">
                    <p><i class="material-icons">email</i> <span id="user-email"></span></p>
                    <p><i class="material-icons">verified</i> <span id="user-role"></span></p>
                </div>
            </div>
            <div class="card">
                <h2>Suscripciones Activas</h2>
                <div id="subscriptions-list"></div>
            </div>
            <div class="card">
                <h2>Actividad Reciente</h2>
                <div id="recent-activity"></div>
            </div>
        </div>
    `,
    planes: `
    <div class="header">
        <h1>Gestión de Planes</h1>
    </div>
    <div class="dashboard-grid">
        <!-- Planes Activos -->
        <div class="card">
            <h2>Planes Activos</h2>
            <div id="active-plans"></div>
        </div>
        
        <!-- Planes Disponibles -->
        <div class="card">
            <h2>Planes Disponibles</h2>
            <div class="plans-grid" id="available-plans">
                <!-- Los planes se cargarán dinámicamente aquí -->
            </div>
        </div>
    </div>
    `,
    usuarios: `
        <div class="header">
            <h1>Gestión de Usuarios</h1>
        </div>
        <div class="card">
            <div id="users-list"></div>
        </div>
    `,
    ayuda: `
    <div class="header">
    <h1>Centro de Ayuda</h1>
</div>
<div class="dashboard-grid">
    <!-- Búsqueda Rápida -->
    <div class="card">
        <h2>Búsqueda Rápida</h2>
        <div class="search-box">
            <input type="text" id="help-search" placeholder="¿Qué necesitas saber?">
            <i class="material-icons">search</i>
        </div>
    </div>

    <!-- Preguntas Frecuentes -->
    <div class="card">
        <h2>Preguntas Frecuentes</h2>
        <div class="faq-list">
            <div class="faq-item">
                <div class="faq-question">
                    <i class="material-icons">add</i>
                    <span>¿Cómo cambio mi plan actual?</span>
                </div>
                <div class="faq-answer">
                    Para cambiar tu plan, ve a la sección "Gestionar Planes" y selecciona el nuevo plan que deseas. Podrás ver la diferencia de precios y realizar el cambio.
                </div>
            </div>
            <div class="faq-item">
                <div class="faq-question">
                    <i class="material-icons">add</i>
                    <span>¿Cómo actualizo mi método de pago?</span>
                </div>
                <div class="faq-answer">
                    Puedes actualizar tu método de pago en la sección de "Pagos". Allí encontrarás la opción para agregar o modificar tus tarjetas.
                </div>
            </div>
            <div class="faq-item">
                <div class="faq-question">
                    <i class="material-icons">add</i>
                    <span>¿Dónde encuentro mis facturas?</span>
                </div>
                <div class="faq-answer">
                    Todas tus facturas están disponibles en la sección "Facturas". Puedes descargarlas en PDF cuando lo necesites.
                </div>
            </div>
        </div>
    </div>

    <!-- Contacto Directo -->
    <div class="card">
        <h2>Contacto Directo</h2>
        <div class="contact-options">
            <button class="contact-option">
                <i class="material-icons">chat</i>
                <span>Chat en Vivo</span>
                <small>Tiempo de espera estimado: 5 min</small>
            </button>
            <button class="contact-option">
                <i class="material-icons">mail</i>
                <span>Enviar Correo</span>
                <small>Respuesta en 24 horas</small>
            </button>
            <button class="contact-option">
                <i class="material-icons">phone</i>
                <span>Llamar al Soporte</span>
                <small>Lun-Vie 9:00-18:00</small>
            </button>
        </div>
    </div>

    <!-- Guías Rápidas -->
    <div class="card">
        <h2>Guías Rápidas</h2>
        <div class="guides-list">
            <a href="#" class="guide-item">
                <i class="material-icons">book</i>
                <div class="guide-content">
                    <h3>Primeros Pasos</h3>
                    <p>Guía básica para comenzar a usar tu cuenta</p>
                </div>
            </a>
            <a href="#" class="guide-item">
                <i class="material-icons">security</i>
                <div class="guide-content">
                    <h3>Seguridad y Privacidad</h3>
                    <p>Cómo mantener tu cuenta segura</p>
                </div>
            </a>
            <a href="#" class="guide-item">
                <i class="material-icons">payment</i>
                <div class="guide-content">
                    <h3>Gestión de Pagos</h3>
                    <p>Todo sobre facturación y pagos</p>
                </div>
            </a>
        </div>
    </div>
</div>

    `
};

// Verificar autenticación cuando se carga la página
document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    try {
        const response = await fetchWithAuth('/api/verify-token');
        if (!response || !response.ok) {
            throw new Error('Token inválido');
        }

        setupMenu();
        loadSection('dashboard');
        updateDate();
    } catch (error) {
        console.error('Error de autenticación:', error);
        localStorage.clear();
        window.location.href = 'login.html';
    }
});

function setupFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const icon = question.querySelector('.material-icons');
            
            answer.style.display = answer.style.display === 'block' ? 'none' : 'block';
            icon.textContent = answer.style.display === 'block' ? 'remove' : 'add';
        });
    });
}



// Función para hacer peticiones autenticadas
async function fetchWithAuth(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = 'login.html';
        return;
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });
        if (response.status === 401) {
            localStorage.clear();
            window.location.href = 'login.html';
            return null;
        }
        return response;
    } catch (error) {
        console.error('Error en fetchWithAuth:', error);
        throw error;
    }
}

// Cargar datos del usuario
async function loadUserData() {
    try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem('user'));
        
        const response = await fetchWithAuth('/api/user-profile');
        if (!response || !response.ok) return;

        const userData = await response.json();
        
        document.getElementById('username').textContent = userData.username || user.username || 'Usuario';
        document.getElementById('user-email').textContent = userData.email || user.email || 'No disponible';
        document.getElementById('user-role').textContent = userData.role || 'Usuario';

        // Cargar suscripción si existe
        if (userData.subscription) {
            loadSubscriptions([userData.subscription]);
        } else {
            const subsContainer = document.getElementById('subscriptions-list');
            if (subsContainer) {
                subsContainer.innerHTML = '<p class="no-data">No hay suscripciones activas</p>';
            }
        }

        await loadActivityData();
    } catch (error) {
        console.error('Error al cargar datos del usuario:', error);
        const subsContainer = document.getElementById('subscriptions-list');
        if (subsContainer) {
            subsContainer.innerHTML = '<p class="error"> No hay suscripciones activas</p>';
        }
    }
}

async function loadActivityData() {
    try {
        const response = await fetchWithAuth('/api/user-activity');
        if (!response || !response.ok) return;

        const activity = await response.json();
        const container = document.getElementById('recent-activity');
        
        if (!container) return;

        container.innerHTML = activity.length ? 
            activity.map(item => `
                <div class="activity-item">
                    <i class="material-icons">${getActivityIcon(item.type)}</i>
                    <div class="activity-content">
                        <p>${item.plan || item.description}</p>
                        <small>${new Date(item.createdAt || item.date).toLocaleDateString()}</small>
                    </div>
                </div>
            `).join('') :
            '<p class="no-data">No hay actividad reciente</p>';
    } catch (error) {
        console.error('Error al cargar actividad:', error);
        const container = document.getElementById('recent-activity');
        if (container) {
            container.innerHTML = '<p class="error">Error al cargar la actividad reciente</p>';
        }
    }
}

// Funciones de suscripción
async function renewSubscription(subId) {
    try {
        const response = await fetchWithAuth(`/api/subscriptions/${subId}/renew`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Suscripción renovada exitosamente');
            await loadUserData();
        } else {
            const error = await response.json();
            alert(error.message || 'Error al renovar la suscripción');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la solicitud');
    }
}

async function cancelSubscription(subId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta suscripción?')) return;

    try {
        const response = await fetchWithAuth(`/api/subscriptions/${subId}/cancel`, {
            method: 'POST'
        });

        if (response.ok) {
            alert('Suscripción cancelada exitosamente');
            await loadUserData();
        } else {
            const error = await response.json();
            alert(error.message || 'Error al cancelar la suscripción');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al procesar la solicitud');
    }
}

// Funciones de utilidad
function getActivityIcon(type) {
    const icons = {
        payment: 'payment',
        subscription: 'subscriptions',
        login: 'login',
        profile: 'person',
        default: 'info'
    };
    return icons[type] || icons.default;
}

function updateDate() {
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
}

function setupMenu() {
    document.querySelectorAll('.menu a').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = e.target.closest('a').getAttribute('href').slice(1);
            
            if (section === 'logout') {
                logout();
                return;
            }
            
            loadSection(section);
        });
    });
}

function loadSection(sectionId) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = sections[sectionId] || sections.dashboard;

    document.querySelectorAll('.menu a').forEach(item => 
        item.classList.toggle('active', item.getAttribute('href') === `#${sectionId}`)
    );

    if (sectionId === 'dashboard') {
        loadUserData();
        updateDate();
    } else if (sectionId === 'planes') {
        loadAvailablePlans();
        loadActivePlans();
    } else if (sectionId === 'ayuda') {
        setupFAQ();
    }
}

async function logout() {
    try {
        await fetchWithAuth('/api/logout', { 
            method: 'POST'
        });
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
    } finally {
        localStorage.clear();
        window.location.href = 'login.html';
    }
}

async function loadAvailablePlans() {
    const plansData = [
        {
        id: 'inicio',
        name: 'Plan Inicio',
        price: 15,
        description: 'Ideal para pequeñas empresas que recién están iniciando',
        icon: 'cohete (1).png',
        features: [
            'Hosting y dominio incluidos',
            'Diseño web básico',
            'Hasta 2 páginas',
            'Soporte vía email',
            'Seguridad básica'
        ]
    },
    {
        id: 'basico',
        name: 'Plan Básico',
        price: 49,
        description: 'Ideal para pequeñas empresas que buscan una solución profesional',
        icon: 'operacion.png',
        features: [
            'Todo incluido del Plan Starter',
            'Diseño web responsivo',
            'Hasta 5 páginas',
            'Soporte técnico estándar',
            'Seguridad SSL básica'
        ]
    },
    {
        id: 'profesional',
        name: 'Plan Profesional',
        price: 79,
        description: 'Perfecto para negocios en crecimiento que necesitan más flexibilidad',
        icon: 'edificio.png',
        features: [
            'Todo incluido del Plan Básico',
            'Hasta 8 páginas',
            'Soporte prioritario',
            'Optimización SEO básica',
            'Seguridad avanzada SSL'
        ]
    },
    {
        id: 'empresarial',
        name: 'Plan Empresarial',
        price: 99,
        description: 'Para grandes empresas que requieren soluciones personalizadas y completas',
        icon: 'corona (3).png',
        features: [
            'Todo incluido del Plan Profesional',
            'Hasta 15 páginas',
            'Soporte 24/7',
            'Consultoría en estrategias digitales',
            'Seguridad avanzada y contratos inteligentes en blockchain'
        ]
    },
        
    ];

    const container = document.getElementById('available-plans');
    if (!container) return;

    container.innerHTML = plansData.map(plan => `
        <div class="plan-card">
            <div class="plan-header">
                <img src="imagenes/iconos/${plan.icon}" alt="${plan.name}" class="plan-icon">
                <h3>${plan.name}</h3>
            </div>
            <div class="plan-price">
                <h4>$${plan.price} USD/mes</h4>
            </div>
            <div class="plan-features">
                ${plan.features.map(feature => `<p><i class="material-icons">check</i>${feature}</p>`).join('')}
            </div>
            <div class="plan-actions">
                <button onclick="initiatePlanPurchase('${plan.id}')" class="btn-primary">
                    Contratar Plan
                </button>
            </div>
        </div>
    `).join('');
}

// Función para cargar los planes activos del usuario
async function loadActivePlans() {
    try {
        const response = await fetchWithAuth('/api/user-plans');
        if (!response.ok) return;

        const plans = await response.json();
        const container = document.getElementById('active-plans');
        if (!container) return;

        if (plans.length === 0) {
            container.innerHTML = '<p class="no-data">No tienes planes activos</p>';
            return;
        }

        container.innerHTML = plans.map(plan => `
            <div class="active-plan-card">
                <div class="plan-info">
                    <h3>${plan.name}</h3>
                    <p>Estado: <span class="status ${plan.status}">${plan.status}</span></p>
                    <p>Fecha de inicio: ${new Date(plan.startDate).toLocaleDateString()}</p>
                    <p>Próxima facturación: ${new Date(plan.nextBilling).toLocaleDateString()}</p>
                </div>
                <div class="plan-actions">
                    <button onclick="managePlan('${plan.id}')" class="btn-secondary">
                        Gestionar Plan
                    </button>
                    <button onclick="cancelPlan('${plan.id}')" class="btn-danger">
                        Cancelar Plan
                    </button>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error al cargar planes activos:', error);
    }
}

// Función para iniciar la compra de un plan
async function initiatePlanPurchase(planId) {
    try {
        const plan = await fetchWithAuth(`/api/plans/${planId}`);
        if (!plan.ok) throw new Error('Error al obtener información del plan');

        const planData = await plan.json();
        
        // Guardar información del plan seleccionado
        const selectedPlan = {
            plans: [{
                name: planData.name,
                price: planData.price,
                quantity: 1,
                icon: planData.icon,
                description: planData.description,
                features: planData.features
            }],
            total: planData.price
        };

        localStorage.setItem('selectedPlans', JSON.stringify(selectedPlan));
        window.location.href = 'pagos.html';
    } catch (error) {
        console.error('Error al iniciar la compra:', error);
        alert('Error al procesar la solicitud de compra');
    }
}

// Actualizar la función loadSection para incluir la carga de planes
function loadSection(sectionId) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = sections[sectionId] || sections.dashboard;

    document.querySelectorAll('.menu a').forEach(item => 
        item.classList.toggle('active', item.getAttribute('href') === `#${sectionId}`)
    );

    if (sectionId === 'dashboard') {
        loadUserData();
        updateDate();
    } else if (sectionId === 'planes') {
        loadAvailablePlans();
        loadActivePlans();
    }
}