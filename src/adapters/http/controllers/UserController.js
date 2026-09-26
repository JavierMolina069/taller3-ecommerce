class UserController {
    constructor(createUser, getUsers, updateUser, deleteUser) {
        this.createUser = createUser;
        this.getUsers = getUsers;
        this.updateUser = updateUser;
        this.deleteUser = deleteUser;
    }

    async create(req, res) {
        try {
            const { nombre, email, password } = req.body;

            const user = await this.createUser.execute(
                nombre,
                email,
                password
            );

            res.status(201).json({
                message: "Usuario registrado correctamente",
                user
            });

        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }

    async getAll(req, res) {
        try {
            const users = await this.getUsers.execute();

            res.status(200).json(users);

        } catch (error) {
            res.status(500).json({
                error: "Error al obtener los usuarios"
            });
        }
    }

    async update(req, res) {
        try {
            const { id } = req.params;
            const { nombre, email, password } = req.body;

            const user = await this.updateUser.execute(
                id,
                nombre,
                email,
                password
            );

            res.status(200).json({
                message: "Usuario actualizado correctamente",
                user
            });

        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }

    async delete(req, res) {
        try {
            const { id } = req.params;

            const result =
                await this.deleteUser.execute(id);

            res.status(200).json(result);

        } catch (error) {
            res.status(400).json({
                error: error.message
            });
        }
    }
}

module.exports = UserController;
