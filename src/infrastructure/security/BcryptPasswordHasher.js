const bcrypt = require("bcrypt");
const PasswordHasher = require("../../domain/ports/PasswordHasher");

class BcryptPasswordHasher extends PasswordHasher {
    async hash(password) {
        return bcrypt.hash(password, 10);
    }

    async compare(password, encodedPassword) {
        return bcrypt.compare(password, encodedPassword);
    }
}

module.exports = BcryptPasswordHasher;
