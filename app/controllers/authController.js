const adminDataMapper = require('../dataMappers/adminDataMapper');
const authDataMapper = require('../dataMappers/authDataMapper');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Cookies = require('cookies');
const { json, response } = require('express');

module.exports = {
    // MEthode pour l'authentification route POST /auth
    authentification: async function (request, response) {
        try {
            const { email, password } = request.body;
            // On vérifie que l'utilisateur existe
            let user = await authDataMapper.findUserByEmail(email);
            // Si l'utilisateur existe
            if (user) {
                // On vérifie que le mot de passé envoyé correspond au mot de passe en BDD
                const checkpwd = await bcrypt.compare(password, user.password)
                // Si le mot de passe ne correspond pas, on envoie une erreur
                if (!checkpwd) {
                    throw 'Mauvaise combinaison email / mot de passe';
                }
                // On supprime des clés qu'on ne veut pas voir apparaitre dans le token
                delete user.isBan;
                delete user.password;
                delete user.isActive;
                delete user.newPassword;
                delete user.optin;
                delete user.role;
                // On indique l'expiration du token
                const expireIn = 15 * 60; // 15min
                // On crée le token
                const token = jwt.sign({
                    user: user
                },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: expireIn
                    });
                // On renvoie un nouveau cookie avec le token mis a jour
                if (process.env.NODE_ENV === 'production') {
                    new Cookies(request, response).set('access-token', token, {
                        httpOnly: true,
                        secure: true,
                        sameSite: 'None'
                    });
                } else {
                    new Cookies(request, response).set('access-token', token, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 15 * 60 * 1000, // 15min
                        sameSite: 'None'
                    });
                }
                // On renvoie le token en Authorization
                response.header('Authorization', 'Bearer ' + token);
                const myUser = await adminDataMapper.findUserById(user.id);
                // On crée un objet des informations qu'on veut envoyé au front
                const userDetails = {
                    message: 'Vous êtes connecté',
                    id: user.id,
                    role: myUser.role,
                    email: user.email
                }
                // Si tout va bien, on envoie les informations au front poiur indiquer que l'utilisateur est bien connecté
                return response.status(201).json(userDetails);
            } else {
                // Si l'utilisateur n'existe pas, on envoie une erreur
                return response.status(404).json(`Cet email n''existe pas`);
            }
        } catch (error) {
            // A la moindre erreur, on l'envoie au front
            return response.status(501).json(error);
        }
    },
    // Vérification si le token envoyé par le client est valide
    authCheck: async function (request, response) {
        try {

            if (!request.headers['cookie']) {
                const userDetails = {
                    message: 'Veuillez vous connecter',
                    token: false
                }
                return response.json(userDetails);
            }

            let token = request.headers['cookie'];
            // Si il y a bien un token, on le découpe du reste
            if (!!token && token.startsWith('access-token=')) {
                token = token.slice(13, token.length);
            }

            if (token) {

                // On vérifie que le token est valide
                const verify = await jwt.verify(token, process.env.SECRET_KEY);
                // On récupere les infos de l'utilisateur
                const myUser = await adminDataMapper.findUserById(verify.user.id);
                // On crée un objet des informations que l'on veut envoyer au front
                const userDetails = {
                    token: true,
                    id: verify.user.id,
                    role: myUser.role,
                    email: verify.user.email
                }
                const expireIn = 15 * 60; // 15min
                // On crée le token
                token = jwt.sign({
                    user: verify.user
                },
                    process.env.SECRET_KEY,
                    {
                        expiresIn: expireIn
                    });
                if (process.env.NODE_ENV === 'production') {
                    new Cookies(request, response).set('access-token', token, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 15 * 60 * 1000, // 15min
                        sameSite: 'None'
                    });
                } else {
                    new Cookies(request, response).set('access-token', token, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 15 * 60 * 1000, // 15min
                        sameSite: 'None'
                    });
                }
                // Si tout va bien, on envoie les info au front pour lui indiquer le token est valide
                response.status(200).json(userDetails);
            } else {
                // console.log('pas de token');

                // Si il n'y a pas de token, on invite le client a se connecter
                const userDetails = {
                    message: 'Veuillez vous connecter',
                    token: false
                }
                response.status(200).json(userDetails);
            }
            // On récupere le cookie dans le header de la requete du client

        } catch (error) {
            // On récupere les erreur pour les envoyer au front
            return response.status(501).json(error);
        }
    },
    logout: async function (request, response) {
        try {
            // On récupere le cookie dans le header de la requete du client
            let token = request.headers['cookie'];
            // Si il y a bien un token, on le découpe du reste
            if (!!token && token.startsWith('access-token=')) {
                token = token.slice(13, token.length);
            }
            if (token) {
                if (process.env.NODE_ENV === 'production') {
                    new Cookies(request, response).set('access-token', token, {
                        httpOnly: true,
                        secure: true,
                        maxAge: 1, // 15min
                        sameSite: 'None'
                    });
                } else {
                    new Cookies(request, response).set('access-token', token, {
                        httpOnly: true,
                        secure: false,
                        maxAge: 1, // 15min
                        sameSite: 'None'
                    });
                }
                return response.status(200).json('Vous avez été déconnecté(e).')
            } else {
                // Si il n'y a pas de token, on invite le client a se connecter
                throw 'Vous n\'êtes pas connecté(e).';
            }
        } catch (error) {
            // On récupere les erreur pour les envoyer au front
            return response.status(501).json(error);
        }
    }
};
