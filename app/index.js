import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import jwt from 'jsonwebtoken';

mongoose.set('strictQuery', true);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({
  origin: process.env.DOMAIN || 'https://localhost:10000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(join(__dirname, '../public')));

// Esquemas MongoDB
const usuarioSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  subscription: {
    plan: String,
    startDate: Date,
    endDate: Date,
    status: { type: String, enum: ['active', 'inactive'], default: 'inactive' }
  }
});

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario' },
  plan: String,
  price: Number,
  status: String,
  createdAt: { type: Date, default: Date.now }
});

const Usuario = mongoose.model('Usuario', usuarioSchema);
const Order = mongoose.model('Order', orderSchema);

// Middleware de autenticación
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No autorizado' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await Usuario.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado' });
  }
  next();
};


// Esquema para los mensajes de contacto
const contactoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true },
  mensaje: { type: String, required: true },
  fecha: { type: Date, default: Date.now },
  estado: { type: String, enum: ['nuevo', 'leído', 'respondido'], default: 'nuevo' }
});

const Contacto = mongoose.model('Contacto', contactoSchema);

// Rutas de autenticación
app.post("/api/registro", async (req, res) => {
  try {
    console.log('Datos recibidos:', req.body);

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: "Todos los campos son requeridos" 
      });
    }

    const usuarioExistente = await Usuario.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (usuarioExistente) {
      console.log('Usuario existente:', usuarioExistente);
      return res.status(400).json({ 
        message: "El usuario o email ya está registrado" 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const usuario = new Usuario({ 
      username, 
      email, 
      password: hashedPassword 
    });

    console.log('Usuario antes de guardar:', usuario);
    await usuario.save();
    console.log('Usuario guardado exitosamente');

    const token = jwt.sign(
      { id: usuario._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({ 
      message: "Usuario registrado exitosamente",
      token, 
      user: { 
        id: usuario._id, 
        username, 
        email 
      } 
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    res.status(500).json({ 
      message: "Error al registrar el usuario",
      error: error.message 
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const usuario = await Usuario.findOne({ username });
    
    if (!usuario || !(await bcrypt.compare(password, usuario.password))) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id: usuario._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, user: { id: usuario._id, username: usuario.username, email: usuario.email } });
  } catch (error) {
    res.status(500).json({ message: "Error al iniciar sesión" });
  }
});

// Rutas de pago
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { paymentMethodId, amount, email } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'usd',
      payment_method: paymentMethodId,
      confirm: true
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Ruta para el formulario de contacto
app.post("/api/contact", async (req, res) => {
  try {
      const { nombre, email, mensaje } = req.body;

      if (!nombre || !email || !mensaje) {
          return res.status(400).json({
              message: "Todos los campos son requeridos"
          });
      }

      const contacto = new Contacto({
          nombre,
          email,
          mensaje
      });

      await contacto.save();

      res.status(201).json({
          message: "Mensaje enviado exitosamente",
          id: contacto._id
      });

  } catch (error) {
      console.error('Error al enviar mensaje:', error);
      res.status(500).json({
          message: "Error al enviar el mensaje",
          error: error.message
      });
  }
});

// Rutas protegidas
app.use('public/administrador/*', authMiddleware, adminMiddleware);
app.use('public/admin.html', authMiddleware);

// Conexión MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: { version: '1', strict: true, deprecationErrors: true }
})
.then(() => {
  console.log('✅ Conectado exitosamente a MongoDB Atlas');
})
.catch(err => {
  console.error('❌ Error de conexión:', err);
  console.error('URI:', process.env.MONGODB_URI);
});

// Monitores de conexión MongoDB
mongoose.connection.on('error', err => {
  console.error('Error de Mongoose:', err);
});

mongoose.connection.on('connected', () => {
  console.log('Mongoose conectado a MongoDB Atlas');
});

// Middleware para archivos estáticos
app.use(express.static(join(__dirname, '/public')));

// Rutas específicas
app.get('/', (req, res) => {
    res.sendFile(join(__dirname, '/public/login.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(join(__dirname, '/public/registro.html'));
});


app.post('/logout', (req, res) => {
  res.clearCookie('jwt'); // Elimina la cookie
  res.json({ status: 'ok', message: 'Sesión cerrada con éxito' });
});

app.get('/planes', authMiddleware, adminMiddleware, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/planes.html'));  
});


const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});





// Ruta para verificar token
app.get('/api/verify-token', authMiddleware, (req, res) => {
  try {
      res.json({ valid: true, user: req.user });
  } catch (error) {
      res.status(401).json({ message: "Token inválido" });
  }
});

// Ruta para obtener perfil de usuario
app.get('/api/user-profile', authMiddleware, async (req, res) => {
  try {
      const user = await Usuario.findById(req.user.id).select('-password');
      res.json(user);
  } catch (error) {
      res.status(500).json({ message: "Error al obtener perfil" });
  }
});

// Ruta para obtener actividad del usuario
app.get('/api/user-activity', authMiddleware, async (req, res) => {
  try {
      const activity = await Order.find({ userId: req.user.id })
          .sort({ createdAt: -1 })
          .limit(5);
      res.json(activity);
  } catch (error) {
      res.status(500).json({ message: "Error al obtener actividad" });
  }
});


// En tu index.js
app.get('/api/user-plans', authMiddleware, async (req, res) => {
  try {
      const user = await Usuario.findById(req.user.id);
      res.json(user.subscription ? [user.subscription] : []);
  } catch (error) {
      res.status(500).json({ message: "Error al obtener planes" });
  }
});

app.get('/api/plans/:id', authMiddleware, async (req, res) => {
  
});


