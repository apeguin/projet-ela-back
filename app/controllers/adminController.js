//mise en place des datamappers
const adminDataMapper = require('../dataMappers/adminDataMapper');
const publicDataMapper = require('../dataMappers/publicDataMapper');

//mise en place de Joi
const Joi = require('joi');
let sharp = require("sharp");
// Joi pour les insertions
const { productSchemaInsert, typeSchemaInsert, gallerySchemaInsert, eventSchemaInsert, tagSchemaInsert, editionSchemaInsert, collectionSchemaInsert } = require('../validations/schema');

//Joi pour la mise à jour
const { productSchemaUpdate, typeSchemaUpdate, gallerySchemaUpdate, eventSchemaUpdate, tagSchemaUpdate, editionSchemaUpdate, collectionSchemaUpdate } = require('../validations/schema');

//mise en place de multer
const multer = require('multer');
const fs = require('fs');
const promisify = require('util').promisify
const deleteFile = promisify(fs.unlink)
//mise en olace des upload avec multer
let storage = multer.memoryStorage();
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
    //récupération de la liste d'un tag
    tagById: async function (request, response) {
        try {
            const tag = await adminDataMapper.findTagById(request.params.id_tag);
            if (!tag) {
                response
                    .status(404)
                    .json(`Aucun tag avec l'id ${request.params.id_tag}`);
                return;
            }
            response.status(200).json(tag);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //ajout/modif d'un tag
    saveTag: async function (request, response) {
        try {
            let table = 'tag';
            request.files = [];
            let picturesArray = [];
            if (request.params.id_tag) {
                const isTag = await adminDataMapper.findTagById(request.params.id_tag);
                // console.log(isTag);
                if (!isTag) throw 'Ce tag n\'existe pas';
            }
            upload(request, response, async function (err) {
                //Joi pour l'insertion d'un tag
                if (!request.params.id_tag) {
                    const result = await tagSchemaInsert.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                } else {
                    //Joi pour la mise à jour d'un tag
                    const result = await tagSchemaUpdate.validate(request.body);

                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                }
                //Multer pour les tags
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
                            const newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
                            await sharp(file.buffer)
                                .resize({
                                    width: 75,
                                    height: 75,
                                    fit: sharp.fit.cover
                                })
                                .toFormat("png")
                                .png()
                                .toFile(`public/img/${newFilename}`);
                            picturesArray.push(newFilename);
                        }),
                    );
                }
                if (!request.params.id_tag) {
                    const savedTag = await adminDataMapper.insert(request.body, picturesArray, table);
                    response.status(201).json(savedTag);
                }
                else {
                    if (request.files.length >= 1) {
                        // console.log(request.files);
                        const tagToUpdate = await adminDataMapper.findTagById(request.params.id_tag);
                        try {
                            const deletedPhoto = await deleteFile(`public/img/${tagToUpdate.picture_file}`);
                        } catch (error) {
                        }
                        const updatedTag = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_tag);
                        response.status(201).json(updatedTag);
                    } else {
                        const updatedTag = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_tag);
                        response.status(201).json(updatedTag);
                    }
                }
            });
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    addTagToProduct: async function (request, response) {
        // On vérifie que le tag existe
        try {
            const isTag = await adminDataMapper.findTagById(request.params.id_tag);
            if (!isTag) {
                return response.status(404).json(`Ce tag n'existe pas`);
            }
            // On vérifie que le produit existe
            const isProduct = await publicDataMapper.findProductById(request.params.id_product);
            if (!isProduct) {
                return response.status(404).json(`Ce produit n'existe pas`);
            }
            // On vérifie que le produit n'a pas deja 3 tags
            const isToMuchTag = await adminDataMapper.findTagsOfProduct(request.params.id_product);
            if (isToMuchTag.length === 3) {
                return response.status(403).json(`Ce produit a dejà 3 tags`);
            }
            // On vérifie que ce tag n'est pas deja assigné a ce produit
            const alreadyWithThisTag = isToMuchTag.find(tag => tag.id_product === request.params.id_product);
            if (alreadyWithThisTag) {
                return response.status(403).json(`Ce produit a dejà ce tag`);
            }
            const addedTag = await adminDataMapper.addTagToProduct(request.params.id_tag, request.params.id_product);
            response.json(addedTag);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    deleteTagFromProduct: async function (request, response) {
        // On vérifie que le tag existe
        try {
            const isTag = await adminDataMapper.findTagById(request.params.id_tag);
            if (!isTag) {
                return response.status(404).json(`Ce tag n'existe pas`);
            }
            // On vérifie que le produit existe
            const isProduct = await publicDataMapper.findProductById(request.params.id_product);
            if (!isProduct) {
                return response.status(404).json(`Ce produit n'existe pas`);
            }
            // On vérifie que ce tag est bien assigné à ce produit
            const tagsOfOneProduct = await adminDataMapper.findTagsOfProduct(request.params.id_product);
            const isTagOnProduct = tagsOfOneProduct.filter(function (tag) {
                if (tag.id_product === parseInt(request.params.id_product) && tag.id_tag === parseInt(request.params.id_tag)) {
                    return true;
                }
                return false;
            });
            if (isTagOnProduct.length === 0) {
                return response.status(403).json(`Ce tag n'est pas assigné à ce produit`);
            }
            const deletedTagFromProduct = await adminDataMapper.deleteTagFromProduct(request.params.id_tag, request.params.id_product);
            response.status(404).json('Ce tag n\'est plus assigné à ce produit');
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES COMMENTAIRES
    //Liste de tous les commentaires 
    findAllComments: async function (_, response) {
        try {
            const comments = await adminDataMapper.findAllComments();
            if (!comments) {
                response
                    .status(404)
                    .json(`Pas de commentaire`);
                return;
            }
            response.status(200).json(comments);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //suppresion d'un commentaire
    deleteComment: async function (request, response) {
        try {
            const commentToDelete = await adminDataMapper.findOneComment(request.params.id_user, request.params.id_product);
            if (!commentToDelete) {
                return response.status(404).json(`Ce commentaire n'existe pas`);
            }
            const deletedComment = await adminDataMapper.deleteComment(request.params.id_user, request.params.id_product);
            response.status(200).json(deletedComment);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES COLLECTIONS
    //la liste des collections
    allCollections: async function (_, response) {
        try {
            const collections = await adminDataMapper.findAllCollections();
            if (!collections) {
                response
                    .status(404)
                    .json(`Il n'y a aucunes collections`);
                return;
            }
            response.status(200).json(collections);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //ajout/modif d'une collection
    saveCollection: async function (request, response) {
        try {
            let table = 'collection';
            request.files = [];
            let picturesArray = [];
            if (request.params.id_collection) {
                const isCollection = await publicDataMapper.findCollectionById(request.params.id_collection);
                if (!isCollection) {
                    return response.status(404).json('Cette collection n\'existe pas');
                }
            }
            upload(request, response, async function (err) {
                //Joi pour l'insertion d'une collection
                if (!request.params.id_collection) {
                    const result = await collectionSchemaInsert.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                } else {
                    //Joi pour la mise à jour d'une collection
                    const result = await collectionSchemaUpdate.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                }
                //Multer pour les collections
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
                            const newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
                            await sharp(file.buffer)
                                .resize({
                                    width: 75,
                                    height: 75,
                                    fit: sharp.fit.cover
                                })
                                .toFormat("png")
                                .png()
                                .toFile(`public/img/${newFilename}`);
                            picturesArray.push(newFilename);
                        }),
                    );
                }
                if (!request.params.id_collection) {
                    const savedCollection = await adminDataMapper.insert(request.body, picturesArray, table);
                    response.status(201).json(savedCollection);
                }
                else {
                    if (request.files.length >= 1) {
                        // console.log(request.files);
                        const collectionToUpdate = await publicDataMapper.findCollectionById(request.params.id_collection);
                        try {
                            const deletedPhoto = await deleteFile(`public/img/${collectionToUpdate.picture_file}`);
                        } catch (error) {
                        }
                        const updatedCollection = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_collection);
                        response.status(201).json(updatedCollection);
                    } else {
                        const updatedCollection = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_collection);
                        response.status(201).json(updatedCollection);
                    }
                }
            });
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //suppression d'une collection
    deleteCollection: async function (request, response) {
        let table = 'collection';
        const collectionToDelete = await publicDataMapper.findCollectionById(request.params.id_collection);
        if (!collectionToDelete) {
            return response.status(404).json(`Cette collection n'existe pas`);
        }
        const isEmpty = await publicDataMapper.findBookByCollectionId(request.params.id_collection);
        // console.log(collectionToDelete, isEmpty);
        if (isEmpty.length >= 1) {
            productsToChange = [];
            for (product of isEmpty) {
                productsToChange.push(product.id);
            }
            return response.status(500).json(`Veuillez enlever les produits ${productsToChange.join(', ')} de cette collection avant de la supprimer`);
        }
        const deletedCollection = await adminDataMapper.delete(request.params.id_collection, table);
        try {
            const deletedPhoto = await deleteFile(`public/img/${collectionToDelete.picture_file}`);
        } catch (error) {
        }
        response.status(204).json(deletedCollection);
    },
    //LES UTILISATEURS
    //liste des utilisateurs
    allUsers: async function (_, response) {
        try {
            const users = await adminDataMapper.findAllUsers();
            if (!users) {
                response
                    .status(404)
                    .json(`Il n'y a pas d'utilisateurs`);
                return;
            }
            response.status(200).json(users);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    oneUserAdmin: async function (request, response) {
        try {
            const user = await adminDataMapper.findUserById(request.params.id_user);
            if (!user) {
                response
                    .status(404)
                    .json(`Il n'y a pas d'administrateur avec l'id ${request.params.id_user}`);
                return;
            }
            response.status(200).json(user);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    oneUserPublic: async function (request, response) {
        try {
            const user = await adminDataMapper.findUserById(request.params.id_user);
            if (!user) {
                response
                    .status(404)
                    .json(`Il n'existe pas de lecteur avec l'id ${request.params.id_user}`);
                return;
            }
            delete user.optin;
            delete user.isBan;
            delete user.isActive;
            delete user.password;
            response.status(200).json(user);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //lES PRODUITS
    //ajout/modif d'un produit
    saveProduct: async function (request, response) {
        try {
            let table = 'product';
            request.files = [];
            let thisproduct;
            upload(request, response, async function (err) {
                let tag = [];
                let author = [];
                let illustrator = [];
                let picturesArray = [];
                //Joi pour l'insertion d'un produit
                if (request.body.id) {
                    delete request.body.id;
                }
                if (request.body.tag) {
                    tag = request.body.tag;
                    delete request.body.tag;
                }
                if (request.body.author) {
                    author = request.body.author;
                    delete request.body.author;
                }
                if (request.body.illustrator) {
                    illustrator = request.body.illustrator;
                    delete request.body.illustrator;
                }
                if (!request.params.id_product) {
                    thisproduct = request.body
                    const result = await productSchemaInsert.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                } else {
                    thisproduct = await publicDataMapper.findProductById(request.params.id_product);
                    if (!thisproduct) {
                        return response.status(404).json('Ce produit n\'existe pas.');
                    }
                    if (tag.length >= 1) {
                        const tagOfProduct = await adminDataMapper.findTagsOfProduct(request.params.id_product)
                        for (let oneTag of tagOfProduct) {
                            const tagToDeleteFromProduct = await adminDataMapper.deleteTagFromProduct(oneTag.id_tag, request.params.id_product);
                        }
                        for (let oneTag of tag) {
                            const tagToAddToProduct = await adminDataMapper.addTagToProduct(oneTag, request.params.id_product);
                        }
                    }
                    if (author.length >= 1) {
                        const deleteAllAuthorsOfPrpduct = await adminDataMapper.deleteAllRoleOfProduct(request.params.id_product, 'product_has_writer');
                        for (let oneAuthor of author) {
                            const authorToAddToProduct = await adminDataMapper.addRoleToProduct(request.params.id_product, oneAuthor, 'product_has_writer');
                        }
                    }
                    if (illustrator.length >= 1) {
                        const deleteAllTagsOfPrpduct = await adminDataMapper.deleteAllRoleOfProduct(request.params.id_product, 'product_has_illustrator');
                        for (let oneIllustrator of illustrator) {
                            const authorToAddToProduct = await adminDataMapper.addRoleToProduct(request.params.id_product, oneIllustrator, 'product_has_illustrator');
                        }
                    }
                    //Joi pour la mise à jour d'un produit
                    const result = await productSchemaUpdate.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                }
                //Multer pour les products
                if (err instanceof multer.MulterError) {
                    return response.status(500).json(err)
                    // A Multer error occurred when uploading.
                } else if (err) {
                    return response.status(500).json(err)
                    // An unknown error occurred when uploading.
                }
                if (request.files.length >= 1) {
                    if (parseInt(thisproduct.id_type) === 1) {
                        // console.log('un livre');
                        await Promise.all(
                            request.files.map(async file => {
                                const filename = file.originalname.replace(/\..+$/, "");
                                const newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.jpg`;
                                await sharp(file.buffer)
                                    .resize({
                                        width: 300,
                                        height: 400,
                                        fit: sharp.fit.outside
                                    })
                                    .toFormat("jpg")
                                    .jpeg({ quality: 80 })
                                    .flatten({ background: { r: 255, g: 255, b: 255 } })
                                    .toFile(`public/img/${newFilename}`);

                                picturesArray.push(newFilename);
                            }),
                        );
                    } 
                    if (parseInt(thisproduct.id_type) > 1) {
                        await Promise.all(
                            request.files.map(async file => {
                                const filename = file.originalname.replace(/\..+$/, "");
                                const newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
                                await sharp(file.buffer)
                                    .resize({
                                        width: 300,
                                        height: 300,
                                        fit: sharp.fit.outside
                                    })
                                    .toFormat("png")
                                    .png({ progressive: false, compressionLevel: 9, force: true })
                                    .toFile(`public/img/${newFilename}`);
                                picturesArray.push(newFilename);
                            }),
                        );
                    }
                }
                if (!request.params.id_product) {
                    const savedProduct = await adminDataMapper.insertProduct(request.body, picturesArray, table);
                    for (let oneTag of tag) {
                        const tagToAddToProduct = await adminDataMapper.addTagToProduct(oneTag, savedProduct.savedProduct.id);
                    }
                    for (let oneAuthor of author) {
                        const authorToAddToProduct = await adminDataMapper.addRoleToProduct(savedProduct.savedProduct.id, oneAuthor, 'product_has_writer');
                    }
                    for (let oneIllustrator of illustrator) {
                        const illustratorToAddToProduct = await adminDataMapper.addRoleToProduct(savedProduct.savedProduct.id, oneIllustrator, 'product_has_illustrator');
                    }
                    const newProduct = await publicDataMapper.findProductById(savedProduct.savedProduct.id);
                    response.status(201).json(newProduct);
                }
                else {
                    if (request.files.length >= 1) {
                        const productToUpdate = await publicDataMapper.findProductById(request.params.id_product);
                        if (productToUpdate.picture_file.length >= 1) {
                            for (let file of productToUpdate.picture_file) {
                                try {
                                    // console.log('file ', file);
                                    const deletedPhoto = await deleteFile(`public/img/${file}`);
                                    // console.log('deleted photo : ', deletedPhoto);
                                } catch (error) {
                                }
                            }
                        }
                        const updatedProduct = await adminDataMapper.updateProduct(request.body, picturesArray, table, request.params.id_product);
                    } else {
                        const updatedProduct = await adminDataMapper.updateProduct(request.body, picturesArray, table, request.params.id_product);
                    }
                    const newProduct = await publicDataMapper.findProductById(request.params.id_product);
                    response.status(201).json(newProduct);
                }
            });
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //suppression d'un produit
    deleteProduct: async function (request, response) {
        let table = 'product';
        try {
            const productToDelete = await publicDataMapper.findProductById(request.params.id_product);
            if (!productToDelete) {
                return response.status(404).json('Ce produit n\'existe pas');
            }
            if (productToDelete.picture_file.length >= 1) {
                for (let file of productToDelete.picture_file) {
                    try {
                        const deletedPhoto = await deleteFile(`public/img/${file}`);
                    } catch (error) {
                    }
                }
            }
            const deletedProduct = await adminDataMapper.delete(request.params.id_product, table);
            response.status(204).json(deletedProduct);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    addRoleToProduct: async function (request, response) {
        // On vérifie que le produit existe
        try {
            const productToUpdate = await publicDataMapper.findProductById(request.params.id_product);
            if (!productToUpdate) {
                return response.status(404).json(`Ce produit n'existe pas`);
            }
            // On vérifie que l'utilisateur existe
            const userToAdd = await adminDataMapper.findUserById(request.params.id_user);
            if (!userToAdd) {
                return response.status(404).json(`Cet utilisateur n'existe pas`);
            }
            // On converti le role de l'url avec la premiere lettre ne majuscule et le reste en minuscule
            let role = request.params.role.slice(0, 1).toUpperCase() + request.params.role.toLowerCase().slice(1, request.params.role.length);
            let table;
            // On verifie que le role indiqué correspond aux deux possibles
            if (role != 'Illustrateur' && role != 'Auteur') {
                return response.status(404).json(`Le rôle "${role}" n'existe pas`);
            }
            // On redirige vers la bonne table
            if (role === 'Illustrateur') {
                table = "product_has_illustrator"
            }
            if (role === 'Auteur') {
                table = "product_has_writer"
            }
            // On vérifie que cette utilisateur n'est pas deja indiqué dans ce role sur ce produit
            const isAlreadyInRole = await adminDataMapper.findUserWithRole(request.params.id_product, request.params.id_user, table);
            if (isAlreadyInRole) {
                return response.status(400).json(`Cet utilisateur est deja indiqué comme ${role} sur ce produit`);
            }
            // On peut ajouter cet utilisateur dans ce role sur ce produit
            const roleAdded = await adminDataMapper.addRoleToProduct(request.params.id_product, request.params.id_user, table);
            // On récupere le detail de ce produit pour le renvoyer en json avec les nouvelles infos
            const updatedProduct = await publicDataMapper.findProductById(request.params.id_product);
            response.status(201).json(updatedProduct);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    deleteRoleToProduct: async function (request, response) {
        // On vérifie que le produit existe
        try {
            const productToUpdate = await publicDataMapper.findProductById(request.params.id_product);
            if (!productToUpdate) {
                return response.status(404).json(`Ce produit n'existe pas`);
            }
            // On vérifie que l'utilisateur existe
            const userToAdd = await adminDataMapper.findUserById(request.params.id_user);
            if (!userToAdd) {
                return response.status(404).json(`Cet utilisateur n'existe pas`);
            }
            // On converti le role de l'url avec la premiere lettre ne majuscule et le reste en minuscule
            let theRole = request.params.role.slice(0, 1).toUpperCase() + request.params.role.toLowerCase().slice(1, request.params.role.length);
            let table;
            // On verifie que le role indiqué correspond aux deux possibles
            if (theRole != 'Illustrateur' && theRole != 'Auteur') {
                return response.status(404).json(`Le rôle "${theRole}" n'existe pas`);
            }
            // On redirige vers la bonne table
            if (theRole === 'Illustrateur') {
                table = "product_has_illustrator"
            }
            if (theRole === 'Auteur') {
                table = "product_has_writer"
            }
            let roleToDelete;
            // On vérifie que cette utilisateur est bien dans ce role sur le produit
            const roleOfOneProduct = await publicDataMapper.findProductById(request.params.id_product);
            if (theRole === 'Illustrateur') {
                roleToDelete = roleOfOneProduct.illustrator.find(user => user[0] === request.params.id_user);
            }
            if (theRole === 'Auteur') {
                roleToDelete = roleOfOneProduct.writer.find(user => user[0] === request.params.id_user);
            }
            if (!roleToDelete) {
                return response.status(400).json(`Cet utilisateur n'est pas ${theRole} sur ce produit`);
            }
            const roleDeleted = await adminDataMapper.deleteRoleToProduct(request.params.id_product, request.params.id_user, table);
            const updatedProduct = await publicDataMapper.findProductById(request.params.id_product);
            response.status(201).json(updatedProduct);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES ILLUSTRATIONS
    //ajout/modif d'une illustration
    saveIllustration: async function (request, response) {
        try {
            let table = 'gallery';
            request.files = [];
            let picturesArray = [];
            if (request.params.id_gallery) {
                const IllustrationToUpdate = await publicDataMapper.findGalleriesById(request.params.id_gallery);
                if (!IllustrationToUpdate) {
                    return response.status(404).json('Cette illustration n\'existe pas');
                }
            }
            upload(request, response, async function (err) {
                //Joi pour l'insertion d'une illustration
                if (!request.params.id_gallery) {
                    const result = await gallerySchemaInsert.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                } else {
                    //Joi pour la mise à jour d'une illustration
                    const result = await gallerySchemaUpdate.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                }
                //Multer pour les illustrations
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
                            const newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.jpg`
                            await sharp(file.buffer)
                                .resize({
                                    width: 850,
                                    height: 650,
                                    fit: sharp.fit.inside
                                })
                                .toFormat("jpg")
                                .jpeg({ quality: 80 })
                                .flatten({ background: { r: 255, g: 255, b: 255 } })
                                .toFile(`public/img/${newFilename}`);
                            picturesArray.push(newFilename);
                        }),
                    );
                }
                if (!request.params.id_gallery) {
                    const savedIllustration = await adminDataMapper.insert(request.body, picturesArray, table);
                    response.status(201).json(savedIllustration);
                }
                else {
                    if (request.files.length >= 1) {
                        // console.log(request.files);
                        const IllustrationToUpdate = await publicDataMapper.findGalleriesById(request.params.id_gallery);
                        if (!IllustrationToUpdate) {
                            return response.status(404).json('Cette illustration n\'existe pas');
                        }
                        try {
                            const deletedPhoto = await deleteFile(`public/img/${IllustrationToUpdate.picture_file}`)
                        } catch (error) {
                        }
                        const updatedUser = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_gallery);
                        response.status(201).json(updatedUser);
                    } else {
                        const updatedUser = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_gallery);
                        response.status(201).json(updatedUser);
                    }
                }
            });
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //suppression d'une illustration
    deleteIllustration: async function (request, response) {
        let table = 'gallery';
        const illustrationToDelete = await publicDataMapper.findGalleriesById(request.params.id_gallery);
        if (!illustrationToDelete) {
            return response.status(404).json('Cette illustration n\'existe pas');
        }
        const deletedIllustration = await adminDataMapper.delete(request.params.id_gallery, table);
        try {
            const deletedPhoto = await deleteFile(`public/img/${illustrationToDelete.picture_file}`);
        } catch (error) {
        }
        response.status(204).json(deletedIllustration);
    },
    //LES EVENEMENTS
    //ajout/modif d'un évènement
    saveEvent: async function (request, response) {
        try {
            let table = 'event';
            request.files = [];
            let picturesArray = [];
            if (request.params.id_event) {
                const isEvent = await publicDataMapper.findOneEvent(request.params.id_event);
                if (!isEvent) {
                    return response.status(404).json('Cet evenement n\'existe pas')
                }
            }
            upload(request, response, async function (err) {
                //Joi pour l'insertion d'un évènement
                if (!request.params.id_event) {
                    const result = await eventSchemaInsert.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                } else {
                    //Joi pour la mise à jour d'un évènement
                    const result = await eventSchemaUpdate.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                }
                if (request.files.length >= 1) {
                    await Promise.all(
                        request.files.map(async file => {
                            const filename = file.originalname.replace(/\..+$/, "");
                            const newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.jpg`;
                            await sharp(file.buffer)
                                .resize({
                                    width: 650,
                                    height: 650,
                                    fit: sharp.fit.inside
                                })
                                .toFormat("jpg")
                                .jpeg({ quality: 60 })
                                .flatten({ background: { r: 255, g: 255, b: 255 } })
                                .toFile(`public/img/${newFilename}`);
                            picturesArray.push(newFilename);
                        }),
                    );
                }
                //Multer pour les évènements
                if (err instanceof multer.MulterError) {
                    return response.status(500).json(err);
                    // A Multer error occurred when uploading.
                } else if (err) {
                    return response.status(500).json(err);
                    // An unknown error occurred when uploading.
                }
                if (!request.params.id_event) {
                    const savedEvent = await adminDataMapper.insert(request.body, picturesArray, table);
                    response.status(201).json(savedEvent);
                }
                else {
                    if (request.files.length >= 1) {
                        // console.log(request.files);
                        const eventToUpdate = await publicDataMapper.findOneEvent(request.params.id_event);
                        try {
                            const deletedPhoto = await deleteFile(`public/img/${eventToUpdate.picture_file}`);
                        } catch (error) {
                        }
                        const updatedEvent = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_event);
                        response.status(201).json(updatedEvent);
                    } else {
                        const updatedEvent = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_event);
                        response.status(201).json(updatedEvent);
                    }
                }
            });
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //suppression d'un évènement
    deleteEvent: async function (request, response) {
        let table = 'event';
        const eventToDelete = await publicDataMapper.findOneEvent(request.params.id_event);
        if (!eventToDelete) {
            return response.status(404).json('Cette event n\'existe pas')
        }
        const deletedEvent = await adminDataMapper.delete(request.params.id_event, table);
        response.status(204).json(deletedEvent);
    },
    //LES EDITIONS
    //ajout/modif d'une édition
    saveEdition: async function (request, response) {
        try {
            let table = 'edition';
            request.files = [];
            let picturesArray = [];
            if (request.params.id_edition) {
                const isEdition = await publicDataMapper.findEditionById(request.params.id_edition);
                if (!isEdition) throw 'Cette édition n\'existe pas';
            }
            upload(request, response, async function (err) {
                //Joi pour l'insertion d'une édition
                if (!request.params.id_edition) {
                    const result = await editionSchemaInsert.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                } else {
                    //Joi pour la mise à jour d'un édition
                    const result = await editionSchemaUpdate.validate(request.body);
                    if (result.error) {
                        return response.status(400).json(result.error.details.map(detail => detail.message));
                    }
                }
                //multer pour les éditions
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
                            const newFilename = `${Date.now()}-${Math.floor(Math.random() * 1000000)}.png`;
                            await sharp(file.buffer)
                                .resize({
                                    width: 75,
                                    height: 75,
                                    fit: sharp.fit.cover
                                })
                                .toFormat("png")
                                .png()
                                .toFile(`public/img/${newFilename}`);
                            picturesArray.push(newFilename);
                        }),
                    );
                }
                if (!request.params.id_edition) {
                    const savedEdition = await adminDataMapper.insert(request.body, picturesArray, table);
                    response.status(201).json(savedEdition);
                }
                else {
                    if (request.files.length >= 1) {
                        const userToUpdate = await publicDataMapper.findEditionById(request.params.id_edition);
                        try {
                            const deletedPhoto = await deleteFile(`public/img/${userToUpdate.picture_file}`);
                        } catch (error) {
                        }
                        const updatedEdition = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_edition);
                        response.status(201).json(updatedEdition);
                    } else {
                        // console.log('pas de fichier');
                        const updatedEdition = await adminDataMapper.update(request.body, picturesArray, table, request.params.id_edition);
                        response.status(201).json(updatedEdition);
                    }
                }
            });
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //suppression d'une édition
    deleteEdition: async function (request, response) {
        let table = 'edition';
        try {
            const editionToDelete = await publicDataMapper.findEditionById(request.params.id_edition);
            const deletedEdition = await adminDataMapper.delete(request.params.id_edition, table);
            try {
                const deletedPhoto = await deleteFile(`public/img/${editionToDelete.picture_file}`);
            } catch (error) {
            }
            response.status(204).json(deletedEdition);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    // LES TYPES
    // Ajout / modif d'un type
    saveType: async function (request, response) {
        // Joi pour l'insertion d'un type
        try {
            let table = 'type';
            request.files = [];
            if (request.params.id_type) {
                const isType = await publicDataMapper.findTypeById(request.params.id_type);
                if (!isType) {
                    return response.status(404).json('Ce type n\'existe pas')
                }
            }
            if (!request.params.id_type) {
                const result = await typeSchemaInsert.validate(request.body);
                if (result.error) {
                    return response.status(400).json(result.error.details.map(detail => detail.message));
                }
            } else {
                //Joi pour la mise à jour d'un type
                const result = await typeSchemaUpdate.validate(request.body);
                if (result.error) {
                    return response.status(400).json(result.error.details.map(detail => detail.message));
                }
            }
            if (!request.params.id_type) {
                const saveType = await adminDataMapper.insert(request.body, request.files, table);
                response.status(201).json(saveType);
            }
            else {
                const updatedType = await adminDataMapper.update(request.body, request.files, table, request.params.id_type);
                response.status(201).json(updatedType);
            }
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    deleteTag: async function (request, response) {
        let table = 'tag';
        try {
            const tagToDelete = await adminDataMapper.findTagById(request.params.id_tag);
            if (!tagToDelete) {
                return response.status(404).json('Ce tag n\'existe pas');
            }
            const deletedtag = await adminDataMapper.delete(request.params.id_tag, table);
            try {
                const deletedPhoto = await deleteFile(`public/img/${tagToDelete.picture_file}`);
            } catch (error) {
            }
            response.status(204).json(deletedtag);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    deleteType: async function (request, response) {
        let table = 'type';
        try {
            const typeToDelete = await publicDataMapper.findTypeById(request.params.id_type);
            if (!typeToDelete) {
                return response.status(404).json('Ce type n\'existe pas');
            }
            const deletedtype = await adminDataMapper.delete(request.params.id_type, table);
            response.status(204).json(deletedtype);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
    //LES ADRESSES
    //retrouver une adresse
    addressesOfOneUser: async function (request, response) {
        try {
            const address = await adminDataMapper.getAddressesOfOneUser(request.params.id_user);
            if (!address) {
                response
                    .status(404)
                    .json(`L'utilisateur ${request.params.id_user} n'a pas d'adresse`);
                return;
            }
            response.status(200).json(address);
        } catch (error) {
            return response.status(500).json(error)
        }
    },
};