class AuthenticateUser {
    constructor(userRepository, passwordHasher, tokenService, createUser) {
        this.userRepository = userRepository;
        this.passwordHasher = passwordHasher;
        this.tokenService = tokenService;
        this.createUser = createUser;
    }

    async register(data = {}) {
        const nombre = String(data.nombre || "").trim();
        const email = String(data.email || "").trim().toLowerCase();
        const password = String(data.password || "");

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            throw new Error("Correo electrónico inválido");
        }

        const user = await this.createUser.execute(nombre, email, password);
        return this.createSession(user);
    }

    async login(email, password) {
        const normalizedEmail = String(email || "").trim().toLowerCase();

        if (!normalizedEmail || !password) {
            throw new Error("Correo y contraseña son obligatorios");
        }

        const user = await this.userRepository.findByEmail(normalizedEmail);
        const passwordMatches = user
            ? await this.passwordHasher.compare(password, user.password)
            : false;

        if (!passwordMatches || user.activo === false) {
            throw new Error("Correo o contraseña incorrectos");
        }

        return this.createSession(user);
    }

    createSession(user) {
        const safeUser = {
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            rol: user.rol || "cliente"
        };

        const token = this.tokenService.sign({
            sub: String(safeUser.id),
            rol: safeUser.rol
        });

        return { token, user: safeUser };
    }
}

module.exports = AuthenticateUser;
