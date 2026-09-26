const express = require("express");

const PostgresUserRepository =
    require("../../../infrastructure/repositories/PostgresUserRepository");
const BcryptPasswordHasher =
    require("../../../infrastructure/security/BcryptPasswordHasher");
const JwtTokenService =
    require("../../../infrastructure/security/JwtTokenService");
const CreateUser =
    require("../../../application/usecases/CreateUser");
const AuthenticateUser =
    require("../../../application/usecases/AuthenticateUser");
const AuthController =
    require("../controllers/AuthController");

const router = express.Router();
const userRepository = new PostgresUserRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenService = new JwtTokenService();
const createUser = new CreateUser(userRepository, passwordHasher);
const authenticateUser = new AuthenticateUser(
    userRepository,
    passwordHasher,
    tokenService,
    createUser
);
const controller = new AuthController(authenticateUser);

router.post("/register", (req, res) => controller.register(req, res));
router.post("/login", (req, res) => controller.login(req, res));

module.exports = router;
