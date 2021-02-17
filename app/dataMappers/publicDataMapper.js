const client = require('./client');

module.exports = {
    //LE TYPE
    findTypeById: async function (typeId) {
        try {
            const result = await client.query('SELECT * FROM type WHERE id = $1', [typeId]);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    //LA COLLECTION
    findCollectionById: async function (collectionId) {
        try {
            const result = await client.query('SELECT * FROM collection WHERE id = $1', [collectionId]);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    //L'UTILISATEUR
    findUserByRole: async function () {
        try {
            const result = await client.query(`SELECT * FROM "user" WHERE role = 'Lecteur'`);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    //LES TAGS
    findAllTags: async function () {
        try {
            const result = await client.query('SELECT * FROM "tag" ORDER BY id ASC')
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //LES EDITIONS
    //la liste de toutes les éditions
    findAllEditions: async function () {
        try {
            const result = await client.query(`SELECT * FROM "edition" ORDER BY id ASC`)
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //le détail d'une édition
    findEditionById: async function (editionId) {
        try {
            const result = await client.query('SELECT * FROM edition WHERE id = $1', [editionId]);
            // console.log(result.rows[0]);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    //LES PRODUITS
    // la liste de tous les produits
    findAllProducts: async function () {
        try {
            const result = await client.query(`SELECT * FROM get_all_products() ORDER BY release_date DESC`);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //récupérer le détail d'un produit
    findProductById: async function (productId) {
        try {
            const result = await client.query('SELECT * FROM get_one_product($1)', [productId]);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },

    //LIVRE
    // la liste de tous les livres
    findAllBooks: async function () {
        try {
            const result = await client.query('SELECT * FROM get_all_books() ORDER BY release_date DESC');
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //tous les livres d'une collection
    findBookByCollectionId: async function (collectionId) {
        try {
            const collection = await this.findCollectionById(collectionId);
            if (!collection) {
                throw new publicDataMapper.CollectionNotFoundException(collectionId);
            }
            const result = await client.query('SELECT * FROM product WHERE id_collection = $1 AND id_type = $2;', [collectionId, 1]);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //LES GOODIES
    //tous les goodies
    findAllGoodies: async function () {
        try {
            const result = await client.query('SELECT * FROM get_all_goodies() ORDER BY release_date DESC');
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //les goodies par type
    findGoodiesByTypeId: async function (typeId) {
        try {
            const type = await this.findTypeById(typeId);
            if (!type) {
                throw new publicDataMapper.TypeNotFoundException(typeId);
            }
            const result = await client.query('SELECT * FROM product WHERE id_type = $1', [typeId]);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //LES TYPES
    //tous les types
    findAllTypes: async function () {
        try {
            const result = await client.query('SELECT * FROM type ORDER BY id ASC');
            return result.rows;
        } catch (error) {
            return error
        }
    },
    // LE CREW
    //la liste de la meute
    findAllCrew: async function () {
        try {
            const result = await client.query(`SELECT * FROM "user" WHERE role <> 'Lecteur' ORDER BY "role" ASC, "firstname" ASC`);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //LES ILLUSTRATIONS
    //la liste des illustrations
    findAllGalleries: async function () {
        try {
            const result = await client.query(`
                SELECT "gallery".*, "user"."firstname", "user"."lastname" AS gallery_user
                FROM "gallery"
                JOIN "user" ON "user"."id" = "id_user"
                WHERE "user"."isBan" = false AND "user"."isActive" = true
                ORDER BY "gallery"."id" DESC, "user"."id" ASC`);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //la liste des illustrations par utilisateur
    findGalleriesByUserId: async function (userId) {
        try {
            const result = await client.query('SELECT * FROM gallery WHERE id_user = $1 ORDER BY "id" DESC', [userId]);
            return result.rows;
        } catch (error) {
            return error
        }
    },

    findGalleriesById: async function (galleryId) {
        try {
            const result = await client.query(`			
                SELECT "gallery".*, "user"."firstname", "user"."lastname"
                FROM "gallery"
                JOIN "user" ON "user"."id" = "id_user"
                WHERE "gallery".id = $1`, [galleryId]);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },
    //LES EVENEMENTS
    //la liste des évènements
    findAllEvents: async function () {
        try {
            const result = await client.query('SELECT * FROM event ORDER BY start_date DESC, name ASC');
            return result.rows;
        } catch (error) {
            return error
        }
    },
    //le détail d'un évènement
    findOneEvent: async function (eventId) {
        try {
            const result = await client.query('SELECT * FROM event WHERE id = $1', [eventId]);
            return result.rows[0];
        } catch (error) {
            return error
        }
    },

    // COMMENTAIRES
    findCommentsOfOneProduct: async function (productId) {
        try {
            const result = await client.query(`
                SELECT "product_has_comment".*, "user"."firstname", "user"."lastname", "product"."name" AS product_name
                FROM "product_has_comment"
                JOIN "product" ON "product"."id" = "id_product"
                JOIN "user" ON "user"."id" = "id_user"
                WHERE "user"."isBan" = false AND "user"."isActive" = true AND "product".id = $1
                ORDER BY "product"."id" ASC, "user"."id" ASC;
            `, [productId]);
            return result.rows;
        } catch (error) {
            return error
        }
    },
    // Ajout d'une adresse
    insertAddressByUserId: async function (myBody, myTable) {
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
            return error
        }
    },
    findAddressById: async function (addressId) {
        try {
            const preparedQuery = {
                text: `
                    SELECT * FROM "address" WHERE id = $1
                `,
                values: [addressId]
            }
            const item = await client.query(preparedQuery);
            return item.rows[0];
        } catch (error) {
            return error
        }
    },


    //LES EXCEPTIONS
    TypeNotFoundException: function () {
        this.message = `Le type  n'existe pas`;
        this.toString = () => this.message;
    },
    CollectionNotFoundException: function () {
        this.message = `La collection n'existe pas`;
        this.toString = () => this.message;
    },
}
