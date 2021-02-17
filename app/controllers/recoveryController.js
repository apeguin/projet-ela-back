const adminDataMapper = require('../dataMappers/adminDataMapper');
const authDataMapper = require('../dataMappers/authDataMapper');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'loupargent.pwd@gmail.com',
        pass: 'mimolette51'
    }
});

module.exports = {
    pwdRecoveryEmail: async function (request, response) {
        try {
            if (request.body.email !== undefined) {
                const emailAddress = request.body.email;
                const user = await authDataMapper.findUserByEmail(emailAddress);
                if (!user) {
                    throw `Cet email n'existe pas`;
                }
                const payload = {
                    id: user.id,        // User ID from database
                    email: user.email,
                    expiration: Date.now() + 172800000
                };
                const secret = user.password + user.email;
                const token = jwt.sign(payload, secret);
                const mailOptions = {
                    from: 'loupargent.pwd@gmail.com',
                    to: `${user.email}`,
                    subject: 'Loup d\'Argent - réinitialisation de votre mot de passe',
                    html: `
                    <!DOCTYPE html>
                    <html lang="fr">
                    <head>
                        <meta charset="UTF-8">                    
                        <head>
                            <title>Loup d'argent - mot de passe oublié</title>
                            <meta name="viewport" content="width = 375, initial-scale = -1">
                        </head>
                        <link
                            href="https://fonts.googleapis.com/css2?family=Lato:ital,wght@0,100;0,300;0,400;0,700;0,900;1,100;1,300;1,400;1,700;1,900&display=swap"
                            rel="stylesheet">
                    </head>                   
                    <body style="background-color: #ffffff;  font-size: 16px; font-family: 'Lato', sans-serif;">
                        <center>
                            <table align="center" border="0" cellpadding="0" cellspacing="0" style="height:100%; width:600px;">
                                <!-- BEGIN EMAIL -->
                                <tr>
                                    <td align="center"
                                        style="padding:30px; background-image: url('https://nsa40.casimages.com/img/2020/10/06/201006110615163650.png'); background-repeat: no-repeat; background-position: center; background-size: 50%">
                                        <p style="text-align:left">Bonjour ${user.firstname},<br><br> Nous avons reçu une demande de réinitialisation de mot de passe pour cet email. Afin de procéder à ce changement, merci de cliquer sur le lien ci-dessous.                   
                                        </p>
                                        <p>
                                            <a target="_blank"
                                                style="text-decoration:none; background-color: #8229C6; border: #8229C6 1px solid; color: #fff; padding:10px 10px; display:block;"
                                                href="https://loupargent-oclock.fr/recovery/${payload.id}/${token}">
                                                <strong>Réinitialisation du mot de passe</strong></a>
                                        </p>
                                        <p style="text-align:left">Ce lien ne peut être utilisé qu'une seule fois et n'est valable que 48h.
                                            Si le délai de 48h est dépassé ou si vous avez besoin de réiniatiliser votre mot de passe une
                                            fois nouvelle fois, merci de refaire une demande sur <a
                                                href="https://loupargent-oclock.fr/recovery/">www.loupargent.fr</a>.<br><br>Si vous
                                            n'avez pas fait cette demande, vous pouvez ignorer ce mail.</p>
                                        <p style="text-align:left">
                                            Sincèrement,<br>L'équipe des
                                            <a
                                                href="https://loupargent-oclock.fr/recovery/">Editions Loup d'Argent</a>
                                        </p>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </center>
                    </body>
                    </html>
              `
                };
                const emailer = await transporter.sendMail(mailOptions);
                const postal = {
                    message: `Email envoyé à ${emailer.envelope.to}`,
                    response: emailer.response
                };
                response.status(200).json(postal);
            } else {
                response.status(200).json(`L'adresse email est manquante`);
            }
        } catch (error) {
            return response.status(404).json(error);
        }
    },

    pwdRecoveryForm: async function (request, response) {
        const user = await adminDataMapper.findUserById(request.params.id_user);
        if (!user) {
            return response.status(404).json(`Cet utilisateur n'existe pas`);
        }
        const secret = user.password + user.email;
        jwt.verify(request.params.token, secret, async (err, decoded) => {
            if (err) {
                return response.status(400).json('Le lien n\'est plus actif, veuillez refaire une demande de réinitialisation');
            } else {
                console.log(decoded);
                if (decoded.expiration < Date.now()) {
                    return response.status(404).json(`Le lien n'est plus valable`);
                }
                response.send('<form action="/recovery/reset" method="POST">' +
                    '<input type="hidden" name="token" value="' + request.params.token + '" />' +
                    '<input type="password" name="password" value="" placeholder="Enter your new password..." />' +
                    '<input type="password" name="passwordConfirm" value="" placeholder="Enter your new password confirmation..." />' +
                    '<input type="submit" value="Reset Password" />' +
                    '</form>');
            }
        });
    },
    pwdRecoveryChangeForm: async function (request, response) {
        const { id, password, passwordConfirm } = request.body;
        request.files = [];
        const user = await adminDataMapper.findUserById(id);
        if (!user) {
            return response.status(404).json(`Cet utilisateur n'existe pas`);
        }
        const secret = user.password + user.email;
        jwt.verify(request.body.token, secret, async (err, decoded) => {
            if (err) {
                return response.status(400).json('Le lien n\'est plus actif, veuillez refaire une demande de réinitialisation');
            } else {
                if (decoded.expiration < Date.now()) {
                    return response.status(404).json(`Le lien n'est plus valable`);
                }
                if (password) {
                    if (!password.trim()) {
                        return response.status(400).json(`Aucun mot de passe saisi`);
                    }
                    // - 4: le mdp et la confirmation ne correspondent pas
                    if (password !== passwordConfirm) {
                        return response.status(400).json(`La confirmation du mot de passe ne correspond pas`);
                    }
                    const encryptedPassword = bcrypt.hashSync(password, 10);
                    request.body.password = encryptedPassword;
                    delete request.body.passwordConfirm;
                    delete request.body.token;
                    delete request.body.id;
                }
                const updatedUser = await adminDataMapper.update(request.body, request.files, 'user', decoded.id);
                response.status(200).json('Votre mot de passe a été modifié');
            }
        });
    },
    pwdRecoveryFirstForm: async function (_, response) {
        response.send('<form action="/recovery/email" method="POST">' +
            '<input type="email" name="email" value="" placeholder="Enter your email address..." />' +
            '<input type="submit" value="Reset Password" />' +
            '</form>');
    }
};
