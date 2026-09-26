const jwt = require("jsonwebtoken");
const TokenService = require("../../domain/ports/TokenService");

class JwtTokenService extends TokenService {
    constructor() {
        super();
        if (!process.env.JWT_SECRET) {
            throw new Error("Falta configurar JWT_SECRET");
        }
    }

    sign(payload) {
        return jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || "1d"
        });
    }

    verify(token) {
        return jwt.verify(token, process.env.JWT_SECRET);
    }
}

module.exports = JwtTokenService;
