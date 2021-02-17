//mise en place des datamappers
const adminDataMapper = require('../dataMappers/adminDataMapper');
const publicDataMapper = require('../dataMappers/publicDataMapper');
const authDataMapper = require('../dataMappers/authDataMapper');
//Joi pour les users
const { userSchemaInsert, addressSchemaInsert } = require('../validations/schema');
//Joi pour la mise à jour d'un user
const { userSchemaUpdate, addressSchemaUpdate } = require('../validations/schema');
//mise en place de bcrypt
const bcrypt = require('bcryptjs');
//mise en place de multer
let multer = require('multer');
let sharp = require("sharp");
let fs = require('fs');
let storage = multer.memoryStorage();
const promisify = require('util').promisify;
const deleteFile = promisify(fs.unlink);

//mise en place des upload avec multer
let upload = multer({
    storage: storage,
    limits: {
        // fileSize: 512 * 1000,
        // files: 5
    },
    fileFilter: function (request, file, cb) {
        if (file.mimetype !== 'image/png' && file.mimetype !== 'image/gif' && file.mimetype !== 'image/jpeg') {
            request.fileValidationError = `Le format de fichier n'est pas valable, uniquement jpg, gif et png`;
            return cb(null, false, new Error(`Le format de fichier n'est pas valable, uniquement jpg, gif et png`));
        }
        cb(null, true);
    }
}).array('picture_file');

module.exports = {
    //LES TAGS
    //liste de tous les tags
    allTags: async function (_, response, next) {
        try {
            const tags = await publicDataMapper.findAllTags();
            if (!tags) {
                response
                    .status(404)
                    .json(`Il n'existe pas de tags`);
                return;
            }
            response.status(200).json(tags);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES EDITIONS
    //toutes les éditions
    allEditions: async function (_, response, next) {
        try {
            const editions = await publicDataMapper.findAllEditions();
            if (!editions) {
                response
                    .status(404)
                    .json(`Il n'existe pas d'éditions`);
                return;
            }
            response.status(200).json(editions);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //détail d'une édition
    editionById: async function (request, response, next) {
        try {
            const edition = await publicDataMapper.findEditionById(request.params.id_edition);
            if (!edition) {
                response
                    .status(404)
                    .json(`Il n'existe pas d'édition avec l'id ${request.params.id_edition}`);
                return;
            }
            response.status(200).json(edition);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES PRODUITS
    // Tous les produits
    allProducts: async function (_, response, next) {
        try {
            const products = await publicDataMapper.findAllProducts();
            if (!products) {
                response
                    .status(404)
                    .json(`Il n'existe pas de produits`);
                return;
            }
            response.status(200).json(products);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //détail d'un produit
    productById: async function (request, response, next) {
        try {
            const product = await publicDataMapper.findProductById(request.params.id_product);
            if (!product) {
                response
                    .status(404)
                    .json(`Il n'existe pas de produit avec l'id ${request.params.id_product}`);
                return;
            }
            response.status(200).json(product);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES TYPE
    // Tous les types
    allTypes: async function (_, response, next) {
        try {
            const types = await publicDataMapper.findAllTypes();
            if (!types) {
                response
                    .status(404)
                    .json(`Il n'existe pas de types`);
                return;
            }
            response.status(200).json(types);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //détail d'un type
    typeById: async function (request, response, next) {
        try {
            const type = await publicDataMapper.findTypeById(request.params.id_type);
            if (!type) {
                response
                    .status(404)
                    .json(`Il n'existe pas de type avec l'id ${request.params.id_product}`);
                return;
            }
            response.status(200).json(type);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES LIVRES
    //tous les livres
    allBooks: async function (_, response, next) {
        try {
            const products = await publicDataMapper.findAllBooks();
            if (!products) {
                response
                    .status(404)
                    .json(`Il n'existe pas de livres`);
                return;
            }
            response.status(200).json(products);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //livre par collection
    bookByCollectionId: async function (request, response, next) {
        try {
            const products = await publicDataMapper.findBookByCollectionId(request.params.id_collection);
            if (!products) {
                response
                    .status(404)
                    .json(`il n'existe pas de livre avec la collection ${request.params.id_collection}`);
                return;
            }
            response.status(200).json(products);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES GOODIES
    // tous les goodies
    allGoodies: async function (_, response) {
        try {
            const product = await publicDataMapper.findAllGoodies();
            if (!product) {
                response, se
                    .status(404)
                    .json(`Il n'existe pas de goodies `);
                return;
            }
            response.status(200).json(product);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //les goodies par type
    goodiesByTypeId: async function (request, response, next) {
        try {
            const products = await publicDataMapper.findGoodiesByTypeId(request.params.id_type);
            if (!products) {
                response
                    .status(404)
                    .json(`Il n'existe pas de goodies avec le type ${request.params.id_type}`);
                return;
            }
            response.status(200).json(products);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LE CREW
    //le crew
    listCrew: async function (_, response, next) {
        try {
            const crew = await publicDataMapper.findAllCrew();
            if (!crew) {
                response
                    .status(404)
                    .json(`Il n'existe pas de crew`);
                return;
            }
            response.status(200).json(crew);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES ILLUSTRATIONS
    //liste des illustrations
    allGalleries: async function (_, response, next) {
        try {
            const galleries = await publicDataMapper.findAllGalleries();
            if (!galleries) {
                response
                    .status(404)
                    .json(`Il n'existe pas d'illustrations `);
                return;
            }
            response.status(200).json(galleries);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //détail d'un illustration
    galleryById: async function (request, response, next) {
        try {
            const galleries = await publicDataMapper.findGalleriesById(request.params.id_gallery);
            if (!galleries) {
                response
                    .status(404)
                    .json(`Il n'existe pas d'illustration ${request.params.id_gallery}`);
                return;
            }
            response.status(200).json(galleries);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //liste des illustrations par utilisateur
    galleryByUserId: async function (request, response, next) {
        try {
            const galleries = await publicDataMapper.findGalleriesByUserId(request.params.id_user);
            if (!galleries) {
                response
                    .status(404)
                    .json(`L'utilisateur ${request.params.id_user} n'a pas d'illustrations`);
                return;
            }
            response.status(200).json(galleries);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES EVENEMENTS
    //la liste des évènements
    allEvents: async function (_, response, next) {
        try {
            const events = await publicDataMapper.findAllEvents();
            if (!events) {
                response
                    .status(404)
                    .json(`Il n'existe pas d'événements `);
                return;
            }
            response.status(200).json(events);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    oneEvent: async function (request, response) {
        try {
            const events = await publicDataMapper.findOneEvent(request.params.id_event);
            if (!events) {
                response
                    .status(404)
                    .json(`Il n'exite pas d'événement ${request.params.id_event} `);
                return;
            }
            response.status(200).json(events);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    insertComment: async function (request, response) {
        let table = 'product_has_comment';
        const isAlreadyCommented = await publicDataMapper.findCommentsOfOneProduct(request.body.id_product);
        for (comment of isAlreadyCommented) {
            if (comment.id_user === request.body.id_user) {
                return response.status(400).json('Vous avez déja commenté ce produit');
            }
        }
        const isProduct = await publicDataMapper.findProductById(request.body.id_product);
        if (!isProduct) {
            return response.status(404).json('Ce produit n\'existe pas');
        }
        const savedComment = await adminDataMapper.insertComment(request.body, table);
        response.status(201).json(savedComment);
    },
    findCommentsOfOneProduct: async function (request, response, next) {
        try {
            const commentOfOneProduct = await publicDataMapper.findCommentsOfOneProduct(request.params.id_product);
            response.status(200).json(commentOfOneProduct);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES UTILISATEURS
    saveUser: async function (request, response, next) {
        try {
            let table = 'user';
            request.files = [];
            let picturesArray = [];
            upload(request, response, async function (err) {
                // console.log('requestFiles début de requete : ', request.files);
                const { email, password, passwordConfirm } = request.body;
                //Joi pour l'insertion d'un utilisateur
                if (!request.params.id_user) {
                    const result = await userSchemaInsert.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                } else {
                    //Joi pour la mise à jour d'un utilisateur
                    const result = await userSchemaUpdate.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                }
                const isEmail = await authDataMapper.findUserByEmail(email);
                if (isEmail) {
                    return response.status(400).json(`Un compte existe déja avec cet adresse email, veuillez en choisir une autre.`);
                }
                if (request.body.alias) {
                    const isAlias = await authDataMapper.findUserByAlias(request.body.alias);
                    if (isAlias) {
                        return response.status(400).json(`Ce pseudonyme existe deja, veuillez en choisir un autre.`);
                    }
                }
                // - 3: le mdp n'est pas vide
                if (password) {
                    if (!password.trim()) {
                        return response.status(400).json(`Veuillez saisir un mot de passe et sa confirmation`);
                    }
                    // - 4: le mdp et la confirmation ne correspondent pas
                    if (password !== passwordConfirm) {
                        return response.status(400).json(`La confirmation du mot de passe ne correspond pas au mot de passe saisi.`);
                    }
                    const encryptedPassword = bcrypt.hashSync(password, 10);
                    request.body.password = encryptedPassword;
                    delete request.body.passwordConfirm;
                }
                if (err instanceof multer.MulterError) {
                    return response.status(500).json(err);
                    // A Multer error occurred when uploading.
                } else if (err) {
                    return response.status(500).json(err);
                    // An unknown error occurred when uploading.
                }
                if (request.files.length >= 1) {
                    await Promise.all(
                        request.files.map(async file => {
                            const filename = file.originalname.replace(/\..+$/, "");
                            const newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.jpg`;
                            await sharp(file.buffer)
                                .resize({
                                    width: 150,
                                    height: 150,
                                    fit: sharp.fit.cover
                                })
                                .toFormat("jpg")
                                .jpeg({ quality: 60 })
                                .flatten({ background: { r: 255, g: 255, b: 255 } })
                                .toFile(`public/img/${newFilename}`);
                            picturesArray.push(newFilename);
                        }),
                    );
                }
                if (!request.params.id_user) {
                    const savedUser = await adminDataMapper.insert(request.body, picturesArray, table);
                    response.json(savedUser);
                }
                else {
                    if (password) {
                        if (!request.body.oldPassword) {
                            return response.status(400).json('Veuillez saisir votre mot de passe actuel')
                        };
                        const userToUpdate = await adminDataMapper.findUserById(request.params.id_user);
                        const checkOldPwd = await bcrypt.compare(request.body.oldPassword, userToUpdate.password);
                        if (!checkOldPwd) {
                            return response.status(400).json('Le mot de passe actuel saisi n\'est pas valide');
                        };
                        delete request.body.oldPassword;
                    }
                    if (request.files.length >= 1) {
                        // console.log(request.files);
                        const userToUpdate = await adminDataMapper.findUserById(request.params.id_user);
                        if (userToUpdate.picture_file != 'avatar/default-avatar.jpg') {
                            // fs.unlink(`public/img/${userToUpdate.picture_file}`, function (err) {
                            //     if (err) throw err;
                            // });
                            try {
                                const deletedPhoto = await deleteFile(`public/img/${userToUpdate.picture_file}`)
                            } catch (error) {
                            }
                        }
                        const updatedUser = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_user);
                        response.status(201).json(updatedUser);
                    } else {
                        const updatedUser = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_user);
                        response.status(201).json(updatedUser);
                    }
                };
            });
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES ADRESSES
    //insertion d'une adresse
    saveAddress: async function (request, response, next) {
        let table = 'address';
        request.files = [];
        try {
            if (!request.params.id_address) {
                const result = await addressSchemaInsert.validate(request.body);
                if (result.error) {
                    return response.status(400).json(result.error.details.map(detail => detail.message));
                }
                const isAlreadyAdresses = await adminDataMapper.getAddressesOfOneUser(request.body.id_user);
                const test = isAlreadyAdresses.filter(address => {
                    if (address.type === request.body.type) {
                        return true;
                    } else {
                        return false;
                    }
                });
                if (test.length >= 1) {
                    return response.status(404).json(`vous avez deja une adresse de ${request.body.type}`)
                }
                const savedAddress = await adminDataMapper.insert(request.body, request.files, table);
                if (savedAddress.name === 'error') {
                    return response.status(500).json(savedAddress);
                }
                response.status(201).json(savedAddress);
            } else {
                const result = await addressSchemaUpdate.validate(request.body);
                if (result.error) {
                    return response.status(400).json(result.error.details.map(detail => detail.message));
                }
                const isAddress = await publicDataMapper.findAddressById(request.params.id_address);
                if (!isAddress) {
                    return response.status(404).json('Cette adresse n\'existe pas');
                }
                if (request.body.id_user) {
                    request.body.id_user = isAddress.id_user;
                }
                const updatedAddress = await adminDataMapper.update(request.body, request.files, table, request.params.id_address);
                if (updatedAddress.name === 'error') {
                    return response.status(500).json(updatedAddress);
                }
                response.status(201).json(updatedAddress);
            }
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    deleteAddress: async function (request, response) {
        let table = "address";
        try {
            const isAddress = await publicDataMapper.findAddressById(request.params.id_address);
            if (!isAddress) {
                return response.status(404).json('Cette adresse n\'existe pas');
            }
            const deletedAddress = await adminDataMapper.delete(request.params.id_address, table);
            response.status(204).json(deletedAddress);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    mailContact: async function (request, response) {
        console.log(request.body);
    }
}
