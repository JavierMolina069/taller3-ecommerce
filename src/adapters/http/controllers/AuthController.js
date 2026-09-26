class AuthController {
    constructor(authenticateUser) {
        this.authenticateUser = authenticateUser;
    }

    async register(req, res) {
        try {
            const result = await this.authenticateUser.register(req.body);
            res.status(201).json(result);
        } catch (error) {
            const status = error.code === "23505" ? 409 : 400;
            res.status(status).json({ error: error.message });
        }
    }

    async login(req, res) {
        try {
            const result = await this.authenticateUser.login(
                req.body.email,
                req.body.password
            );
            res.status(200).json(result);
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    }
}

module.exports = AuthController;
