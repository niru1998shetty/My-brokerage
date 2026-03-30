const express = require('express');
const router = express.Router();
const { login } = require('../controllers/authController');
const { loginValidator } = require('../middleware/validators');

router.post('/login', loginValidator, login);

module.exports = router;
