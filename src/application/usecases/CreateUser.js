const User = require("../../domain/entities/User");

class CreateUser {
    constructor(userRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    async execute(nombre, email, password) {
        if (!nombre || !email || !password) {
            throw new Error("Todos los campos son obligatorios");
        }

        if (password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }

        const existingUser = await this.userRepository.findByEmail(email);

        if (existingUser) {
            throw new Error("El correo electrónico ya está registrado");
        }

        const hashedPassword = await this.passwordHasher.hash(password);

        const user = new User(
            null,
            nombre,
            email,
            hashedPassword
        );

        return await this.userRepository.create(user);
    }
}

module.exports = CreateUser;
