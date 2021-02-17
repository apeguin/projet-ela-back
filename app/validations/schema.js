//mise en place de Joi
const Joi = require('joi');


// LES PRODUITS

//Joi pour les products
const productSchemaInsert = Joi.object({

    name: Joi.string().required(),
    legal_deposit: Joi.string(),
    id_edition: Joi.number(),
    synopsys: Joi.string().required().min(5).max(3000),
    excerpt: Joi.string().min(20).max(1500),
    price: Joi.number().required().precision(2),
    copyright_photo: Joi.string(),
    cover_designer: Joi.string(),
    release_date: Joi.date(),
    isbn: Joi.string(),
    size: Joi.string(),
    pages: Joi.number().min(1),
    copyright: Joi.string(),
    ean: Joi.string(),
    weight: Joi.number().precision(2),
    stock_quantity: Joi.number().min(0).required(),
    id_type: Joi.number().required(),
    id_collection: Joi.number(),
    url_kindle: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    url_booknode: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),

});
 
//Joi pour la mise à jour d'un product
const productSchemaUpdate = Joi.object({

    name: Joi.string(),
    legal_deposit: Joi.string(),
    id_edition: Joi.number(),
    weight: Joi.number().precision(2),
    synopsys: Joi.string().min(5).max(3000),
    excerpt: Joi.string().min(5).max(1500),
    price: Joi.number().precision(2),
    copyright_photo: Joi.string(),
    cover_designer: Joi.string(),
    release_date: Joi.date(),
    isbn: Joi.string(),
    size: Joi.string(),
    pages: Joi.number().min(1),
    copyright: Joi.string(),
    ean: Joi.string(),
    stock_quantity: Joi.number().min(0),
    id_type: Joi.number(),
    id_collection: Joi.number(),
    url_kindle: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    url_booknode: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),

});

//LES ILLUSTRATIONS

//Joi pour les illustrations
const gallerySchemaInsert = Joi.object({
    title: Joi.string().required(),
    id_user: Joi.number().required()
});

//Joi pour la mise à jour des illustrations
const gallerySchemaUpdate = Joi.object({
    title: Joi.string(),
    id_user: Joi.number()
});

//LES TYPES

//Joi pour les types
const typeSchemaInsert = Joi.object({
    label: Joi.string().required()
});

//Joi pour la mise à jour des types
const typeSchemaUpdate = Joi.object({
    label: Joi.string()
});
//LES EVENEMENTS

//Joi pour les évènements
const eventSchemaInsert = Joi.object({
    name: Joi.string().required(),
    location: Joi.string().required(),
    start_date: Joi.date().required().raw(),
    end_date: Joi.string().required(),
    address: Joi.string().required()
});


//Joi pour la mise à jour des évènements
const eventSchemaUpdate = Joi.object({
    name: Joi.string(),
    location: Joi.string(),
    start_date: Joi.date().raw(),
    end_date: Joi.string(),
    address: Joi.string()
});


//LES TAGS

//Joi pour les tags
const tagSchemaInsert = Joi.object({
    label: Joi.string().required(),
});

//Joi pour la mie à jour d'un tag
const tagSchemaUpdate = Joi.object({
    label: Joi.string(),
});

//LES EDITIONS

//Joi pour les éditions
const editionSchemaInsert = Joi.object({
    name: Joi.string().required(),
});

//Joi pour la mise à jour des éditions
const editionSchemaUpdate = Joi.object({
    name: Joi.string(),
});


//LES COLLECTIONS

//Joi pour les collections
const collectionSchemaInsert = Joi.object({

    label: Joi.string().required(),
});

//Joi pour la mise à jour d'une collection
const collectionSchemaUpdate = Joi.object({
    label: Joi.string()
})

//LES UTILISATEURS

//Joi pour les users
const userSchemaInsert = Joi.object({
    lastname: Joi.string().required().min(2).max(30),
    firstname: Joi.string().required().min(2).max(30),
    email: Joi.string().email().required(),
    alias: Joi.string(),
    role: Joi.string(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    passwordConfirm: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    // access_token: [
    //     Joi.string(),
    //     Joi.number()
    // ],
    facebook: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    instagram: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    twitter: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    linkedin: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    biography: Joi.string(),
    optin: Joi.boolean().truthy(),
    isBan: Joi.boolean().falsy(),
    isActive: Joi.boolean().truthy(),
    newPassword: Joi.boolean().falsy()
});

//Joi pour la mise a jour d'un utilisateur
const userSchemaUpdate = Joi.object({
    lastname: Joi.string().min(2).max(30),
    firstname: Joi.string().min(2).max(30),
    email: Joi.string().email(),
    alias: Joi.string(),
    role: Joi.string(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    // access_token: [
    //     Joi.string(),
    //     Joi.number()
    // ],
    facebook: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    instagram: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    twitter: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    linkedin: Joi.string().uri({
        scheme: [
            'https'
        ]
    }),
    biography: Joi.string(),
    optin: Joi.boolean().truthy(),
    isBan: Joi.boolean().falsy(),
    isActive: Joi.boolean().truthy(),
    newPassword: Joi.boolean().falsy(),
    passwordConfirm: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')),
    oldPassword: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'))
});

const addressSchemaInsert = Joi.object({
    type: Joi.string().required(),
    street_name: Joi.string().required(),
    additionnal_details: Joi.string().required(),
    postal_code: Joi.string().required(),
    country: Joi.string().required(),
    city: Joi.string().required(),
    additional_comment: Joi.string(),
    id_user: Joi.number().required(),
    phone: Joi.string().pattern(new RegExp('^[0-9+\(\)#\.\s\/ext-]+$')).required()
});

const addressSchemaUpdate = Joi.object({
    type: Joi.string(),
    street_name: Joi.string(),
    additionnal_details: Joi.string(),
    postal_code: Joi.string(),
    country: Joi.string(),
    city: Joi.string(),
    additional_comment: Joi.string(),
    id_user: Joi.number(),
    phone: Joi.string().pattern(new RegExp('^[0-9+\(\)#\.\s\/ext-]+$'))
})


module.exports = {
    productSchemaInsert,
    productSchemaUpdate,
    gallerySchemaInsert,
    gallerySchemaUpdate,
    eventSchemaInsert,
    eventSchemaUpdate,
    tagSchemaInsert,
    tagSchemaUpdate,
    editionSchemaInsert,
    editionSchemaUpdate,
    collectionSchemaInsert,
    collectionSchemaUpdate,
    userSchemaInsert,
    userSchemaUpdate,
    typeSchemaInsert,
    typeSchemaUpdate,
    addressSchemaInsert,
    addressSchemaUpdate
}
