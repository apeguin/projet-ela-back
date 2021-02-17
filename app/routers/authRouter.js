const express = require('express');
const router = express.Router();
//mise en place du controller
const authController = require('../controllers/authController');

/**
 * @route POST /auth/
 * @param {mail} mail.path.required
 */
router.post('/', authController.authentification);
router.get('/check', authController.authCheck);
// Log Out
/**
 * @route GET /auth/logout
 */
router.route('/logout')
    .get(authController.logout);

module.exports = router;
