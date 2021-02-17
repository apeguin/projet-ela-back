const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const Cookies = require('cookies');

const adminDataMapper = require('../dataMappers/adminDataMapper');
const publicDataMapper = require('../dataMappers/publicDataMapper');

module.exports = {
    checkAdmin: async (request, response, next) => {
        let token = request.headers['cookie'];
        if (!!token && token.startsWith('access-token=')) {
            token = token.slice(13, token.length);
        }
        if (token) {
            jwt.verify(token, SECRET_KEY, async (err, decoded) => {
                if (err) {
                    return response.status(401).json('Veuillez vous reconnecter');
                } else {
                    request.decoded = decoded;
                    const myUser = await adminDataMapper.findUserById(decoded.user.id);
                    if (!myUser) {
                        return response.status(404).json('Cet utilisateur n\'existe pas');
                    }
                    if (myUser.role != 'Editeur') {
                        return response.status(401).json('Vous n\'avez pas l\'autorisation d\'accéder à cette page');
                    }
                    const expiresIn = 24 * 60 * 60;
                    const newToken = jwt.sign({
                        user: decoded.user
                    },
                        SECRET_KEY,
                        {
                            expiresIn: expiresIn
                        });
                    response.header('Authorization', 'Bearer ' + newToken);
                    next();
                }
            });
        } else {
            return response.status(401).json('Veuillez vous connecter pour retenter d\'accéder à cette page');
        }
    },

    checkLecteur: async (request, response, next) => {
        let token = request.headers['cookie'];
        if (!!token && token.startsWith('access-token=')) {
            token = token.slice(13, token.length);
        }
        if (token) {
            jwt.verify(token, SECRET_KEY, async (err, decoded) => {
                if (err) {
                    return response.status(401).json('Veuillez vous reconnecter');
                } else {
                    request.decoded = decoded;
                    const myUser = await adminDataMapper.findUserById(decoded.user.id);
                    if (!myUser) {
                        return response.status(404).json('Cet utilisateur n\'existe pas');
                    }
                    if (myUser.role != 'Lecteur') {
                        return response.status(401).json('Vous n\'avez pas l\'autorisation d\'accéder à cette page');
                    }
                    const expiresIn = 24 * 60 * 60;
                    const newToken = jwt.sign({
                        user: decoded.user
                    },
                        SECRET_KEY,
                        {
                            expiresIn: expiresIn
                        });
                    response.header('Authorization', 'Bearer ' + newToken);
                    next();
                }
            });
        } else {
            return response.status(401).json('Veuillez vous connecter pour retenter d\'accéder à cette page');
        }
    },
    checkAuteur: async (request, response, next) => {
        let token = request.headers['cookie'];
        if (!!token && token.startsWith('access-token=')) {
            token = token.slice(13, token.length);
        }
        if (token) {
            jwt.verify(token, SECRET_KEY, async (err, decoded) => {
                if (err) {
                    return response.status(401).json('Veuillez vous reconnecter');
                } else {
                    request.decoded = decoded;
                    const myUser = await adminDataMapper.findUserById(decoded.user.id);
                    if (!myUser) {
                        return response.status(404).json('Cet utilisateur n\'existe pas');
                    }
                    if (myUser.role != 'Auteur') {
                        return response.status(401).json('Vous n\'avez pas l\'autorisation d\'accéder à cette page');
                    }
                    const expiresIn = 24 * 60 * 60;
                    const newToken = jwt.sign({
                        user: decoded.user
                    },
                        SECRET_KEY,
                        {
                            expiresIn: expiresIn
                        });
                    response.header('Authorization', 'Bearer ' + newToken);
                    next();
                }
            });
        } else {
            return response.status(401).json('Veuillez vous connecter pour retenter d\'accéder à cette page');
        }
    },
    checkIllustrateur: async (request, response, next) => {
        let token = request.headers['cookie'];
        if (!!token && token.startsWith('access-token=')) {
            token = token.slice(13, token.length);
        }
        if (token) {
            jwt.verify(token, SECRET_KEY, async (err, decoded) => {
                if (err) {
                    return response.status(401).json('Veuillez vous reconnecter');
                } else {
                    request.decoded = decoded;
                    const myUser = await adminDataMapper.findUserById(decoded.user.id);
                    if (!myUser) {
                        return response.status(404).json('Cet utilisateur n\'existe pas');
                    }
                    if (myUser.role != 'Illustrateur') {
                        return response.status(401).json('Vous n\'avez pas l\'autorisation d\'accéder à cette page');
                    }
                    const expiresIn = 24 * 60 * 60;
                    const newToken = jwt.sign({
                        user: decoded.user
                    },
                        SECRET_KEY,
                        {
                            expiresIn: expiresIn
                        });
                    response.header('Authorization', 'Bearer ' + newToken);
                    next();
                }
            });
        } else {
            return response.status(401).json('Veuillez vous connecter pour retenter d\'accéder à cette page');
        }
    },
    checkUser: async (request, response, next) => {
        let token = request.headers['cookie'];
        if (!!token && token.startsWith('access-token=')) {
            token = token.slice(13, token.length);
        }
        if (token) {
            jwt.verify(token, SECRET_KEY, async (err, decoded) => {
                if (err) {
                    return response.status(401).json('Veuillez vous reconnecter');
                } else {
                    request.decoded = decoded;

                    const myUser = await adminDataMapper.findUserById(decoded.user.id);
                    if (!myUser) {
                        return response.status(404).json('Cet utilisateur n\'existe pas');
                    }
                    if (request.params.id_user) {
                        if (request.params.id_user != decoded.user.id) {
                            return response.status(401).json('Vous n\'avez pas l\'autorisation d\'accéder à cette page');
                        }
                    }
                    if (request.body.id_user) {
                        if (request.body.id_user != decoded.user.id) {
                            return response.status(401).json('Vous n\'avez pas l\'autorisation d\'accéder à cette page');
                        }
                    }
                    if (myUser.role != 'Editeur' && myUser.role != 'Illustrateur' && myUser.role != 'Auteur' && myUser.role != 'Lecteur') {
                        return response.status(401).json('Vous n\'avez pas l\'autorisation d\'accéder à cette page');
                    }
                    if (request.params.id_address) {
                        const isAddress = await publicDataMapper.findAddressById(request.params.id_address);
                        // console.log(isAddress);
                        if (isAddress && isAddress.id_user != decoded.user.id) {
                            return response.status(401).json('Vous n\'avez pas l\'autorisation d\'accéder à cette page');
                        }
                    }
                    const expiresIn = 24 * 60 * 60;
                    const newToken = jwt.sign({
                        user: decoded.user
                    },
                        SECRET_KEY,
                        {
                            expiresIn: expiresIn
                        });
                    response.header('Authorization', 'Bearer ' + newToken);
                    next();
                }
            });
        } else {
            return response.status(401).json('Veuillez vous connecter pour retenter d\'accéder à cette page');
        }
    }
}
