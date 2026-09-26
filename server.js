const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: ".env.ecommerce" });

const userRoutes = require("./src/adapters/http/routes/userRoutes");
const authRoutes = require("./src/adapters/http/routes/authRoutes");
const orderRoutes = require("./src/adapters/http/routes/orderRoutes");
const catalogRoutes = require("./src/adapters/http/routes/catalogRoutes");

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173"
}));
app.use(express.json({ limit: "1mb" }));

app.get("/", (req, res) => {
    res.json({ message: "API funcionando correctamente" });
});

app.use("/auth", authRoutes);
app.use(orderRoutes);
app.use("/usuarios", userRoutes);
app.use(catalogRoutes);

app.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
});

const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, "0.0.0.0", () => {
    console.log("Servidor ejecutándose en http://localhost:" + PORT);
});
