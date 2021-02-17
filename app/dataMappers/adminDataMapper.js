
const client = require('./client');

module.exports = {

    //LES TAGS

    /**
     * Affichage d'un tag
     * @param {Number} tagId 
     * @returns {Object} Element of this tag
     */
    findTagById: async function (tagId) {
        try {
            const result = await client.query('SELECT * FROM "tag" WHERE id = $1', [tagId]);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    /**
     * Ajout d'un tag à un produit
     * @param {Number} tagId 
     * @param {Number} productId 
     * @returns {Object} The details of the new tag
     */
    addTagToProduct: async function (tagId, productId) {
        try {
            const preparedQuery = {
                text: `
                    INSERT INTO "product_has_tag"
                    ("id_tag", "id_product")
                    VALUES
                    ($1, $2)
                    RETURNING *
                `,
                values: [tagId, productId]
            }
            const savedItem = await client.query(preparedQuery);
            return savedItem.rows[0];
        } catch (error) {
            return error
        }
    },
    /**
     * Liste des tag assigné a un produit
     * @param {Number} productId
     * @returns {Object} The list of the tags of this product 
     */
    findTagsOfProduct: async function (productId) {
        try {
            const result = await client.query('SELECT * FROM "product_has_tag" WHERE id_product = $1 ORDER BY id_tag ASC', [productId]);
            return result.rows;
        } catch (error) {
            return error
        }
    },

    /**
     * Suppression d'un tag sur un product
     * @param {Number} tagId 
     * @param {Number} productId 
     * @returns {String} Return the confirmation of the deletation
     */
    deleteTagFromProduct: async function (tagId, productId) {
        try {
            const result = await client.query('DELETE FROM "product_has_tag" WHERE id_tag = $1 AND id_product = $2', [tagId, productId]);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    //LES COMMENTAIRES
    /**
     * la liste des commentaires 
     * @returns {Object} return the list of all the comments of non ban and active users
     */
    findAllComments: async function () {
        try {
            const result = await client.query(`
                SELECT "product_has_comment".*, "user"."firstname", "user"."lastname", "product"."name" AS product_name
                FROM "product_has_comment"
                JOIN "product" ON "product"."id" = "id_product"
                JOIN "user" ON "user"."id" = "id_user"
                WHERE "user"."isBan" = false AND "user"."isActive" = true
                ORDER BY "product"."id" ASC, "user"."id" ASC;
            `);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    findOneComment: async function (theUser, theProduct) {
        try {
            const preparedQuery = {
                text: `
                SELECT * FROM "product_has_comment"
                WHERE id_user = $1 AND id_product = $2
            `,
                values: [theUser, theProduct]
            };
            const item = await client.query(preparedQuery);
            return item.rows[0];
        } catch (error) {
            return error
        }
    },
    //LES COLLECTIONS
    /**
     * la liste des collections
     * @returns {Object} Return the list of all the collections
     */
    findAllCollections: async function () {
        try {
            const result = await client.query(`
                SELECT * FROM collection ORDER BY id ASC;
            `);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //LES UTILISATEURS
    /**
     * la liste des utilisateurs
     * @returns {Object} Return the list of all the users
     */
    findAllUsers: async function () {
        try {
            const result = await client.query(`
                SELECT * FROM "user" ORDER BY "role" ASC, "lastname" ASC, "firstname" ASC  
            `);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    /**
     * Détails d'un user
     * @param {Number} userId
     * @returns {Object} Return the details of one user 
     */
    findUserById: async function (userId) {
        try {
            const preparedQuery = {
                text: `SELECT * FROM "user" WHERE id = $1`,
                values: [userId]
            }
            const result = await client.query(preparedQuery);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    /**
     * Liste des picture d'un produit
     * @param {Number} productId 
     * @returns {Object} Return all the pictures of a product
     */
    findPictureByProductId: async function (productId) {
        try {
            const preparedQuery = {
                text: `SELECT * FROM picture WHERE id_product = $1`,
                values: [productId]
            }
            const result = await client.query(preparedQuery);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    // Ajout d'un auteur/illustrateur à un produit
    addRoleToProduct: async function (productId, userId, myTable) {
        try {
            const preparedQuery = {
                text: `
                    INSERT INTO "${myTable}"
                    ("id_product", "id_user")
                    VALUES
                    ($1, $2)
                    RETURNING *
                `,
                values: [productId, userId]
            }
            const savedItem = await client.query(preparedQuery);
            return savedItem.rows[0];
        } catch (error) {
            return error
        }
    },
    // Suppression d'un auteur/illustrateur sur un produit
    deleteRoleToProduct: async function (productId, userId, myTable) {
        try {
            const preparedQuery = {
                text: `
                    DELETE FROM ${myTable} WHERE id_product = $1 AND id_user = $2
                `,
                values: [productId, userId]
            }
            const savedItem = await client.query(preparedQuery);
            return savedItem.rows[0];
        } catch (error) {
            return error
        }
    },
    // Verification si un user n'est pas deja auteur ou illustrateur sur un produit
    findUserWithRole: async function (productId, userId, myTable) {
        try {
            const preparedQuery = {
                text: `SELECT * FROM ${myTable} WHERE id_product = $1 AND id_user = $2`,
                values: [productId, userId]
            }
            const result = await client.query(preparedQuery);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    // LES INSERTIONS
    // méthode de creation d'une entrée dans la table indiquée
    insert: async function (myBody, myFile, myTable) {
        try {
            let insertFields = [];
            let insertValues = [];
            let i = 0;
            if (myFile.length >= 1) {
                myBody.picture_file = myFile[0]
            }
            for (let field in myBody) {
                insertFields.push(`"${field}"`);
            }
            for (let field in myBody) {
                insertValues.push(field);
            }
            const preparedQuery = {
                text: `
                INSERT INTO "${myTable}"
                (${insertFields.join()})
                VALUES
                (${insertFields.map(_ => '$' + ++i)})
                RETURNING *
            `,
                values: insertValues.map(field => myBody[field])
            }

            const savedItem = await client.query(preparedQuery);
            return savedItem.rows[0]
        } catch (error) {
            return error;
        }
    },
    // Ajout d'un produit
    insertProduct: async function (myBody, myFiles, myTable) {
        try {
            let insertFields = [];
            let insertValues = [];
            let insertedPicture = [];
            let i = 0;
            for (let field in myBody) {
                insertFields.push(`"${field}"`);
            }
            for (let field in myBody) {
                insertValues.push(field);
            }
            const preparedQuery = {
                text: `
                    INSERT INTO "${myTable}"
                    (${insertFields.join()})
                    VALUES
                    (${insertFields.map(_ => '$' + ++i)})
                    RETURNING *
                `,
                values: insertValues.map(field => myBody[field])
            }
            // console.log(preparedQuery);
            const savedItem = await client.query(preparedQuery);

            if (myFiles) {
                for (let file of myFiles) {
                    // // console.log('file in foreach : ', file.filename);

                    const preparedQueryPicture = {
                        text: `
                                INSERT INTO "picture"
                                ("picture_file", "id_product")
                                VALUES
                                ($1, $2)
                                RETURNING *
                            `,
                        values: [file, savedItem.rows[0].id]
                    }
                    const savedPicture = await client.query(preparedQueryPicture);
                    insertedPicture.push(savedPicture.rows[0].picture_file);
                }
            };
            return {
                savedProduct: savedItem.rows[0],
                savedPictures: insertedPicture
            };
        } catch (error) {
            return error;
        }
    },
    // Ajout d'un commentaire
    insertComment: async function (myBody, myTable) {
        try {
            let insertFields = [];
            let insertValues = [];
            let i = 0;
            for (let field in myBody) {
                insertFields.push(`"${field}"`);
            }
            for (let field in myBody) {
                insertValues.push(field);
            }
            const preparedQuery = {
                text: `
                    INSERT INTO "${myTable}"
                    (${insertFields.join()})
                    VALUES
                    (${insertFields.map(_ => '$' + ++i)})
                    RETURNING *
                `,
                values: insertValues.map(field => myBody[field])
            }
            const savedItem = await client.query(preparedQuery);
            return savedItem.rows[0];
        } catch (error) {
            return error;
        }
    },
    // LES MISES A JOUR
    // Méthode de mise a jour d'une entrée dans la table indiquée
    update: async function (myBody, myFile, myTable, id) {
        try {// On déclare le tableau des clés
            let updateFields = [];
            let updateList = [];
            if (myFile.length >= 1) {
                myBody.picture_file = myFile[0]
            }
            let i = 0;
            for (let field in myBody) {
                updateFields.push(field);
            }
            for (const field of updateFields) {
                updateList.push(`"${field}" = $${++i}`);
            }
            const preparedQuery = {
                text: `
                UPDATE "${myTable}"
                SET ${updateList.join()}
                WHERE id = $${++i}
                RETURNING *
            `,
                values: [...updateFields.map(field => myBody[field]), id]
            }
            const updatedItem = await client.query(preparedQuery);
            return updatedItem.rows[0];
        } catch (error) {
            return error;
        }
    },
    updateUser: async function (myBody, myFile, myTable, id) {
        // On déclare le tableau des clés
        try {
            let updateFields = [];
            let updateList = [];
            if (myFile.length >= 1) {
                myBody.picture_file = myFile[0]
            }
            let i = 0;
            for (let field in myBody) {
                updateFields.push(field);
            }
            for (const field of updateFields) {
                updateList.push(`"${field}" = $${++i}`);
            }
            const preparedQuery = {
                text: `
                    UPDATE "${myTable}"
                    SET ${updateList.join()}
                    WHERE id = $${++i}
                    RETURNING *
                `,
                values: [...updateFields.map(field => myBody[field]), id]
            }
            const updatedItem = await client.query(preparedQuery);
            return updatedItem.rows[0];
        } catch (error) {
            return error
        }
    },
    // Mise a jout d'un produit
    updateProduct: async function (myBody, myFiles, myTable, id) {
        // On déclare le tableau des clés
        try {
            let updateFields = [];
            let insertedPicture = [];
            let updateList = [];
            let updatedItem = []
            let i = 0;
            for (let field in myBody) {
                updateFields.push(field);
            }
            for (const field of updateFields) {
                updateList.push(`"${field}" = $${++i}`);
            }
            if (updateFields.length >= 1) {
                const preparedQuery = {
                    text: `
                    UPDATE "${myTable}"
                    SET ${updateList.join()}
                    WHERE id = $${++i}
                    RETURNING *
                `,
                    values: [...updateFields.map(field => myBody[field]), id]
                };
                // console.log('prepared equery update product : ', preparedQuery);
                updatedItem = await client.query(preparedQuery);
            }
            if (myFiles.length >= 1) {
                const preparedQueryDelete = {
                    text: `
                        DELETE FROM "picture"
                        WHERE id_product = $1
                    `,
                    values: [id]
                };
                const deletedItem = await client.query(preparedQueryDelete);
                for (let file of myFiles) {
                    const preparedQueryPicture = {
                        text: `
                                INSERT INTO "picture"
                                ("picture_file", "id_product")
                                VALUES
                                ($1, $2)
                                RETURNING *
                            `,
                        values: [file, id]
                    }
                    const savedPicture = await client.query(preparedQueryPicture);
                    insertedPicture.push(savedPicture.rows[0].picture_file);
                };
                return {
                    savedPictures: insertedPicture
                };
            };

            if (updatedItem = []) {
                return {
                    message: 'Mise à jour OK'
                }
            };

            return {
                updatedProduct: updatedItem.rows[0],
            };
        } catch (error) {
            return error
        }
    },
    //LES SUPPRESSIONS
    // Suppression "générique" 
    delete: async function (theId, myTable) {
        try {
            const preparedQuery = {
                text: `
                    DELETE FROM "${myTable}"
                    WHERE id = $1
                `,
                values: [theId]
            };
            const deletedItem = await client.query(preparedQuery);
            return `this ${myTable} has been deleted!`;
        } catch (error) {
            return error
        }
    },
    // Suppression d'un commentaire
    deleteComment: async function (theUser, theProduct) {
        try {
            const preparedQuery = {
                text: `
                DELETE FROM "product_has_comment"
                WHERE id_user = $1 AND id_product = $2
            `,
                values: [theUser, theProduct]
            };
            // console.log(preparedQuery);
            const deletedItem = await client.query(preparedQuery);
            return `this comment has been deleted!`;
        } catch (error) {
            return error
        }

    },
    deleteAllTagOfProduct: async function (theProduct) {
        try {
            const preparedQuery = {
                text: `
                    DELETE FROM "product_has_tag"
                    WHERE id_product = $1
                `,
                values: [theProduct]
            };
            const deletedItem = await client.query(preparedQuery);
            return `All Tags have been deleted!`;
        } catch (error) {
            return error;
        }
    },
    deleteAllRoleOfProduct: async function (theProduct, myTable) {
        try {
            const preparedQuery = {
                text: `
                    DELETE FROM "${myTable}"
                    WHERE id_product = $1
                `,
                values: [theProduct]
            };
            const deletedItem = await client.query(preparedQuery);
            return `All role have been deleted!`;
        } catch (error) {
            return error;
        }
    },

    //LES ADRESSES
    //trouver une adresse
    getAddressesOfOneUser: async function (userId) {
        try {
            const preparedQuery = {
                text: `
                SELECT * FROM "address" WHERE "id_user" = $1 
                `,
                values: [userId]
            };
            const result = await client.query(preparedQuery);
            return result.rows;
        } catch (error) {
            return error
        }
    },

};