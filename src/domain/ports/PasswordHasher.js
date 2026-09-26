class PasswordHasher {
    async hash(password) {
        throw new Error("hash() no implementado");
    }

    async compare(password, encodedPassword) {
        throw new Error("compare() no implementado");
    }
}

module.exports = PasswordHasher;
