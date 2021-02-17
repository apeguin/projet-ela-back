const express = require('express');

const router = express.Router();

const authController = require('../controllers/authController');
const recoveryController = require('../controllers/recoveryController');
const adminController = require('../controllers/adminController');
const publicController = require('../controllers/publicController');

//mot de passe oublié
router.get('/forgotpassword', recoveryController.pwdRecoveryFirstForm);
//envoie du mail pour mot de passe oublié
router.post('/email', recoveryController.pwdRecoveryEmail);

//formulaire pour changer le mot de passe
router.get('/resetpassword/:id_user(\\d+)/:token(([a-zA-Z0-9+]+).([a-zA-Z0-9+]+).([a-zA-Z0-9+]+))', recoveryController.pwdRecoveryForm);

//changement du mot de passe
router.post('/reset', recoveryController.pwdRecoveryChangeForm);

module.exports = router;
