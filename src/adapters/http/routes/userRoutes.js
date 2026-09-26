const express = require("express");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");

const PostgresUserRepository =
    require("../../../infrastructure/repositories/PostgresUserRepository");

const BcryptPasswordHasher =
    require("../../../infrastructure/security/BcryptPasswordHasher");

const CreateUser =
    require("../../../application/usecases/CreateUser");

const GetUsers =
    require("../../../application/usecases/GetUsers");

const UpdateUser =
    require("../../../application/usecases/UpdateUser");

const DeleteUser =
    require("../../../application/usecases/DeleteUser");

const UserController =
    require("../controllers/UserController");

const router = express.Router();
router.use(requireAuth, requireAdmin);

const userRepository =
    new PostgresUserRepository();

const passwordHasher =
    new BcryptPasswordHasher();

const createUser =
    new CreateUser(
        userRepository,
        passwordHasher
    );

const getUsers =
    new GetUsers(userRepository);

const updateUser =
    new UpdateUser(
        userRepository,
        passwordHasher
    );

const deleteUser =
    new DeleteUser(userRepository);

const userController =
    new UserController(
        createUser,
        getUsers,
        updateUser,
        deleteUser
    );

router.post("/", (req, res) => {
    userController.create(req, res);
});

router.get("/", (req, res) => {
    userController.getAll(req, res);
});

router.put("/:id", (req, res) => {
    userController.update(req, res);
});

router.delete("/:id", (req, res) => {
    userController.delete(req, res);
});

module.exports = router;
