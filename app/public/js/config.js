// config.js
require('dotenv').config();

const config = {
    mongoURI: process.env.MONGO_URI,
    dbName: 'mainsep_db',
    collection: 'contacts'
};

module.exports = config;

// server.js
const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const config = require('./config');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar a MongoDB
const client = new MongoClient(config.mongoURI);

app.post('/api/contact', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(config.dbName);
        const contacts = db.collection(config.collection);

        const { nombre, email, mensaje } = req.body;
        
        const newContact = {
            nombre,
            email,
            mensaje,
            fecha: new Date(),
            estado: 'nuevo'
        };

        await contacts.insertOne(newContact);
        
        res.status(201).json({ message: 'Mensaje enviado correctamente' });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Error al enviar el mensaje' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});