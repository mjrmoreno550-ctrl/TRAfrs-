const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
const path = require("path");

app.use(express.static(path.join(__dirname)));



const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "transfrs"
});

db.connect((err) => {
    if (err) {
        console.log("Error conectando a MySQL");
        console.log(err);
        return;
    }

    console.log("✅ Base de datos conectada");
});

app.get("/", (req, res) => {
    res.send("🚀 API TRAfrs funcionando");
});
const bcrypt = require("bcryptjs");

// REGISTRO
app.post("/api/register", async (req, res) => {

    console.log("Datos recibidos:", req.body);

    const { nombre, email, password } = req.body;

    try {

        const hash = await bcrypt.hash(password, 10);

        const sql = `
            INSERT INTO usuarios(nombre, email, password)
            VALUES (?, ?, ?)
        `;

        db.query(sql, [nombre, email, hash], (err, result) => {

            if (err) {
                return res.status(500).json({
                    error: err.message
                });
            }

            res.json({
                mensaje: "Usuario registrado correctamente"
            });

        });

    } catch (error) {

        res.status(500).json({
            error: error.message
        });

    }

});

// LOGIN
app.post("/api/login", (req, res) => {

    const { email, password } = req.body;

    const sql = "SELECT * FROM usuarios WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        if (results.length === 0) {
            return res.status(401).json({
                mensaje: "Usuario no encontrado"
            });
        }

        const usuario = results[0];

        const coincide = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!coincide) {
            return res.status(401).json({
                mensaje: "Contraseña incorrecta"
            });
        }

        res.json({
            mensaje: "Login correcto",
            usuario: {
                id: usuario.id,
                nombre: usuario.nombre,
                email: usuario.email
            }
        });

    });

});

app.post("/api/productos", (req, res) => {

    const { nombre, descripcion, tipo } = req.body;

    const sql = `
        INSERT INTO productos(nombre, descripcion, tipo)
        VALUES (?, ?, ?)
    `;

    db.query(sql, [nombre, descripcion, tipo], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            mensaje: "Producto agregado correctamente"
        });

    });

});

app.get("/api/productos", (req, res) => {

    const sql = "SELECT * FROM productos ORDER BY id DESC";

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json(results);

    });

});

app.delete("/api/productos/:id", (req, res) => {

    const { id } = req.params;

    const sql = "DELETE FROM productos WHERE id = ?";

    db.query(sql, [id], (err, result) => {

        if (err) {
            return res.status(500).json({
                error: err.message
            });
        }

        res.json({
            mensaje: "Producto eliminado"
        });

    });

});

app.listen(3000, () => {
    console.log("Servidor ejecutándose en puerto 3000");
});