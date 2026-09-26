const JwtTokenService =
    require("../../../infrastructure/security/JwtTokenService");

const tokenService = new JwtTokenService();

function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ")
        ? header.slice(7)
        : null;

    if (!token) {
        return res.status(401).json({ error: "Se requiere iniciar sesión" });
    }

    try {
        req.auth = tokenService.verify(token);
        return next();
    } catch (error) {
        return res.status(401).json({ error: "Token inválido o vencido" });
    }
}

function requireAdmin(req, res, next) {
    if (req.auth.rol !== "administrador") {
        return res.status(403).json({ error: "Se requiere rol administrador" });
    }

    return next();
}

module.exports = { requireAuth, requireAdmin };
