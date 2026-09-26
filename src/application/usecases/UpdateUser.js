const User = require("../../domain/entities/User");

class UpdateUser {
    constructor(userRepository, passwordHasher) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
    }

    async execute(id, nombre, email, password) {
        if (!nombre || !email || !password) {
            throw new Error("Todos los campos son obligatorios");
        }

        if (password.length < 6) {
            throw new Error("La contraseña debe tener al menos 6 caracteres");
        }

        const currentUser = await this.userRepository.findById(id);

        if (!currentUser) {
            throw new Error("Usuario no encontrado");
        }

        const userWithEmail =
            await this.userRepository.findByEmail(email);

        if (
            userWithEmail &&
            Number(userWithEmail.id) !== Number(id)
        ) {
            throw new Error("El correo electrónico ya está registrado");
        }

        const hashedPassword =
            await this.passwordHasher.hash(password);

        const user = new User(
            id,
            nombre,
            email,
            hashedPassword
        );

        return await this.userRepository.update(user);
    }
}

module.exports = UpdateUser;
