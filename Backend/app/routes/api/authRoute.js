const express = require('express');
const AuthController = require('../../controller/api/AuthController');
const Auth = require('../../middleware/auth');
const validate = require('../../middleware/validate');
const userValidation = require('../../utils/userValidation');
const router = express.Router();



router.post('/register', validate(userValidation), AuthController.register)
router.post('/verify-otp', AuthController.verifyOtp)
router.post('/login', validate(userValidation.loginValidation), AuthController.login)
router.post('/logout', AuthController.logout)
router.post('/refresh-token', AuthController.refreshToken)
router.post('/reset-password-link', AuthController.resetPasswordLink);
router.post('/reset-password/:id/:token', AuthController.resetPassword);
router.use(Auth)
router.get('/dashboard', AuthController.dashboard)
router.post('/update-profile', validate(userValidation.updateProfileValidation), AuthController.updateProfile)

module.exports = router;