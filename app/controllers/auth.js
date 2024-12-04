import express from "express";
const router = express.Router();

// Endpoint para manejar el registro
router.post("/register", (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  // Simular el registro (en un entorno real usarías una base de datos)
  console.log("Nuevo usuario registrado:", { username, email });
  
  res.status(201).json({ message: "Usuario registrado exitosamente" });
});

export default router;
