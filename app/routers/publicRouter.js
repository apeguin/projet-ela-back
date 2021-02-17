const express = require('express');
//mise en place des controllers
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const mailController = require('../controllers/mailController');
const publicController = require('../controllers/publicController');
const authCheck = require('../middlewares/authCheck');
const router = express.Router();
const security = require('../middlewares/authCheck');

//LES TAGS
/**
 * 
 * @route GET /tags
 * @summary LISTE DES TAGS  
 * @returns '200' - response.json tags
 * @returns '404 - No tags
 */
router.route('/tags')
    .get(publicController.allTags);
/**
 * @route GET /tags/{id_tag}
 * @summary LISTE D'UN TAG
 * @param {integer} id_tag.path.required
 * @returns '200' - response.json id_tag
 * @returns '404 - No tag with {id_tag}
 */
router.route('/tags/:id_tag(\\d+)')
    .get(adminController.tagById);

//LES EDITIONS
/**
 * @route GET /editions
 * @summary LISTE DES EDITIONS
 * @returns '200' - response.json edition
 * @returns '404 - No edition
 */
router.get('/editions', publicController.allEditions);
/**
 * @route GET /editions/{id_edition}
 * @summary LISTE D'UNE EDITION
 * @param {integer} id_edition.path.required
 * @returns '200' - response.json id_edition
 * @returns '404 - No edition with {id_edition}
 */
router.get('/editions/:id_edition(\\d+)', publicController.editionById);

// LES COLLECTIONS
/**
 * @route GET /collections
 * @summary LISTE DES COLLECTIONS
 * @returns '200' - response.json collection
 * @returns '404 - No collection
 */
router.get('/collections', adminController.allCollections);

//LES PRODUITS
/**
 * @route GET /products
 * @summary LISTE DES PRODUITS
 * @returns '200' - response.json products
 * @returns '404 - No products
 */
router.get('/products', publicController.allProducts);
/**
 * @route GET /products/{id_product}
 * @summary LISTE D'UN PRODUIT
 * @param {integer} id_product.path.required
 * @returns '200' - response.json id_product
 * @returns '404 - No product with {id_product}
 */
router.get('/products/:id_product(\\d+)', publicController.productById);

//LES LIVRES
/**
 * @route GET /books
 * @summary LISTE DES LIVRES
 * @returns '200' - response.json books
 * @returns '404 - No books
 */
router.get('/books', publicController.allBooks);
/**
 * @route GET /books/collection/{id_collection}
 * @summary LISTE DES LIVRES PAR COLLECTION
 * @param {integer} id_collection.path.required
 * @returns '200' - response.json books/{id_collection}
 * @returns '404 - No books with {id_collection}
 */
router.get('/books/collection/:id_collection(\\d+)', publicController.bookByCollectionId);

//LES GOODIES
/**
 * @route GET /goodies
 * @summary LISTE DES GOODIES
 * @returns '200' - response.json goodies
 * @returns '404 - No goodies
 */
router.get('/goodies', publicController.allGoodies);
/**
 * @route GET /goodies/type/{id_type}
 * @summary LISTE DES GOODIES PAR TYPE
 * @param {integer} id_type.path.required
 * @returns '200' - response.json goodies/{id_type}
 * @returns '404 - No goodies with {id_type}
 */
router.get('/goodies/type/:id_type(\\d+)', publicController.goodiesByTypeId);

//LE CREW
/**
 * @route GET /crew
 * @summary LISTE DU CREW
 * @returns '200' - response.json crew
 * @returns '404 - No crew
 */
router.get('/crew', publicController.listCrew);

//LES ILLUSTRATIONS
/**
 * @route GET /gallery
 * @summary LISTE DES ILLUSTRATIONS
 * @returns '200' - response.json gallery
 * @returns '404 - No gallery
 */
router.get('/gallery', publicController.allGalleries);
/**
 * @route GET /gallery/{id_user}
 * @summary LISTE DES ILLUSTRATIONS PAR UTILISATEUR
 * @param {integer} id_user.path.required
 * @returns '200' - response.json gallery/{id_user}
 * @returns '404 - No gallery with {id_user}
 */
router.get('/gallery/:id_user(\\d+)', publicController.galleryByUserId);
/**
 * @route GET /gallery/illustration/{id_gallery}
 * @summary LISTE D'UNE ILLUSTRATION
 * @param {integer} id_gallery.path.required
 * @returns '200' - response.json gallery/{id_gallery}
 * @returns '404 - No gallery with {id_gallery}
 */
router.get('/gallery/illustration/:id_gallery(\\d+)', publicController.galleryById);

//LES EVENEMENTS
/**
 * @route GET /events
 * @summary LISTE DES EVENEMENTS
 * @returns '200' - response.json events
 * @returns '404 - No events
 */
router.get('/events', publicController.allEvents);
/**
 * @route GET /events/{id_event}
 * @summary LISTE D'UN EVENEMENT
 * @param {integer} id_event.path.required
 * @returns '200' - response.json event/{id_event}
 * @returns '404 - No event with {id_event}
 */
router.get('/events/:id_event(\\d+)', publicController.oneEvent);

//LES COMMENTAIRES
//insérer un commentaire
router.route('/comments/:id_comment(\\d+)?')
    .put(security.checkUser, publicController.insertComment);
//un commentaire pour un article
router.route('/comments/:id_product(\\d+)')
    .get(publicController.findCommentsOfOneProduct);

//LES UTILISATEURS
//création d'un utilisateur 
router.route('/account/:id_user(\\d+)?')

    //création d'un compte utilisateur
    /**
     * @route GET /admin/account/{id_user}
     * @summary CREATION D'UN COMPTE UTILISATEUR
     */
    .get(security.checkUser, adminController.oneUserPublic)
    //ajout/modif d'un utilisateur
    /**
     * @route PUT /account/{id_user}
     * @summary AJOUT /MODIF d'un utilisateur
     * @param {integer} id_user.path.required
     */
    .put(publicController.saveUser);

//LES TYPES
/**
 * @route GET /types
 * @summary LISTE DES TYPES
 * @returns '200' - response.json types
 * @returns '404 - No types
 */
router.route('/types')
    .get(publicController.allTypes);
/**
 * @route GET /types/{id_type}
 * @summary LISTE D'UN TYPE
 * @param {integer} id_type.path.required
 * @returns '200' - response.json types/{id_type}
 * @returns '404 - No types with {id_type}
 */
router.route('/types/:id_type(\\d+)')
    .get(publicController.typeById);

//LES ADRESSES
/**
 * @route PUT /address
 * @summary INSERER UNE ADRESSE
 * @returns '200' - response.json address
 * @returns '404 - No address
 */
router.route('/address/:id_address(\\d+)?')
    .put(authCheck.checkUser, publicController.saveAddress)
    .delete(authCheck.checkUser, publicController.deleteAddress);

router.route('/address/:id_user(\\d+)')
    .get(authCheck.checkUser, adminController.addressesOfOneUser);

// MAIL CONTACT
router.post('/contact', mailController.mailContact);

module.exports = router;



