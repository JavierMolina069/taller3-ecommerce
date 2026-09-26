class TokenService {
    sign(payload) {
        throw new Error("sign() no implementado");
    }

    verify(token) {
        throw new Error("verify() no implementado");
    }
}

module.exports = TokenService;
