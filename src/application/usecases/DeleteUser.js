class DeleteUser {
    constructor(userRepository) {
        this.userRepository = userRepository;
    }

    async execute(id) {
        const user = await this.userRepository.findById(id);

        if (!user) {
            throw new Error("Usuario no encontrado");
        }

        await this.userRepository.deleteById(id);

        return {
            message: "Usuario eliminado correctamente"
        };
    }
}

module.exports = DeleteUser;
