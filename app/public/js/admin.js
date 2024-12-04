const MONGODB_API = '/api';

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
                    <p><i class="material-icons">account_balance_wallet</i> <span id="wallet-address"></span></p>
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
        <div class="card">
            <div class="card-header">
                <h2>Planes Disponibles</h2>
                <button class="btn-add" onclick="addPlan()">Nuevo Plan</button>
            </div>
            <div id="plans-list"></div>
        </div>
    `,
    usuarios: `
        <div class="header">
            <h1>Gestión de Usuarios</h1>
        </div>
        <div class="card">
            <div id="users-list"></div>
        </div>
    `
};

document.addEventListener('DOMContentLoaded', () => {
    loadUserData();
    setupMenu();
    updateDate();
 });
 
 async function loadUserData() {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`/api/users/${userId}`);
        const user = await response.json();
 
        if(user) {
            document.getElementById('username').textContent = user.name;
            document.getElementById('user-email').textContent = user.email;
            document.getElementById('user-role').textContent = user.role || 'Usuario';
            document.getElementById('wallet-address').textContent = user.walletAddress || 'No conectada';
            
            loadSubscriptions(user.subscriptions);
            loadActivityData();
        }
    } catch (error) {
        console.error('Error:', error);
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
 
 async function loadActivityData() {
    try {
        const userId = localStorage.getItem('userId');
        const response = await fetch(`/api/users/${userId}/activity`);
        const activity = await response.json();
        
        const activityContainer = document.getElementById('recent-activity');
        if (activityContainer) {
            activityContainer.innerHTML = activity.length ? 
                activity.map(item => `
                    <div class="activity-item">
                        <i class="material-icons">${getActivityIcon(item.type)}</i>
                        <div class="activity-content">
                            <p>${item.description}</p>
                            <small>${new Date(item.date).toLocaleDateString()}</small>
                        </div>
                    </div>
                `).join('') :
                '<p class="no-data">No hay actividad reciente</p>';
        }
    } catch (error) {
        console.error('Error:', error);
    }
 }
 
 function getActivityIcon(type) {
    const icons = {
        'payment': 'payment',
        'subscription': 'subscriptions',
        'login': 'login',
        'profile': 'person'
    };
    return icons[type] || 'info';
 }

async function loadSubscriptions(subscriptions = []) {
    const container = document.getElementById('subscriptions-list');
    if (!container) return;

    if (subscriptions.length === 0) {
        container.innerHTML = '<p class="no-data">No hay suscripciones activas</p>';
        return;
    }

    container.innerHTML = subscriptions.map(sub => `
        <div class="subscription-item">
            <div class="sub-header">
                <h3>${sub.planName}</h3>
                <span class="status ${sub.status}">${sub.status}</span>
            </div>
            <p>Iniciado: ${new Date(sub.startDate).toLocaleDateString()}</p>
            <p>Próximo pago: ${new Date(sub.nextPayment).toLocaleDateString()}</p>
            <p>Monto: $${sub.amount} USD</p>
            <div class="sub-actions">
                <button onclick="renewSubscription('${sub._id}')">Renovar</button>
                <button onclick="cancelSubscription('${sub._id}')" class="btn-danger">Cancelar</button>
            </div>
        </div>
    `).join('');
}

function loadSection(sectionId) {
    const mainContent = document.getElementById('main-content');
    mainContent.innerHTML = sections[sectionId] || sections.dashboard;

    const menuItems = document.querySelectorAll('.menu a');
    menuItems.forEach(item => item.classList.remove('active'));
    document.querySelector(`[href="#${sectionId}"]`)?.classList.add('active');

    if (sectionId === 'dashboard') {
        loadUserData();
    }
}

function logout() {
    localStorage.clear();
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', () => {
    const menuItems = document.querySelectorAll('.menu a');
    menuItems.forEach(item => {
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

    // Cargar dashboard por defecto
    loadSection('dashboard');
    
    // Actualizar fecha
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        dateElement.textContent = new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
});
 

// dashboard.js - Función actualizada para mostrar suscripciones
async function loadUserData() {
  try {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/users/${userId}`);
      const user = await response.json();

      if(user) {
          document.getElementById('username').textContent = user.name;
          document.getElementById('user-email').textContent = user.email;
          
          const subscriptionsList = document.getElementById('subscriptions-list');
          if (user.subscriptions && user.subscriptions.length > 0) {
              const subsHTML = user.subscriptions.map(sub => `
                  <div class="subscription-item">
                      <div class="sub-header">
                          <h3>${sub.planName}</h3>
                          <span class="status ${sub.status.toLowerCase()}">${sub.status}</span>
                      </div>
                      <p><i class="material-icons">calendar_today</i> Inicio: ${new Date(sub.startDate).toLocaleDateString()}</p>
                      <p><i class="material-icons">update</i> Próximo pago: ${new Date(sub.nextPayment).toLocaleDateString()}</p>
                      <p><i class="material-icons">attach_money</i> Monto: $${sub.amount} USD</p>
                      <div class="sub-actions">
                          <button onclick="renewSubscription('${sub._id}')">Renovar</button>
                          <button class="btn-danger" onclick="cancelSubscription('${sub._id}')">Cancelar</button>
                      </div>
                  </div>
              `).join('');
              subscriptionsList.innerHTML = subsHTML;
          } else {
              subscriptionsList.innerHTML = '<p class="no-data">No hay suscripciones activas</p>';
          }
      }
  } catch (error) {
      console.error('Error:', error);
  }
}

async function renewSubscription(subId) {
  try {
      const response = await fetch(`/api/subscriptions/${subId}/renew`, {
          method: 'POST'
      });
      if(response.ok) {
          loadUserData();
      }
  } catch (error) {
      console.error('Error:', error);
  }
}

async function cancelSubscription(subId) {
  if(confirm('¿Estás seguro de cancelar esta suscripción?')) {
      try {
          const response = await fetch(`/api/subscriptions/${subId}/cancel`, {
              method: 'POST'
          });
          if(response.ok) {
              loadUserData();
          }
      } catch (error) {
          console.error('Error:', error);
      }
  }
}