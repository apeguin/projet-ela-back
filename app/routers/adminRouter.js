const express = require('express');
const router = express.Router();
//mise en place du controller
const adminController = require('../controllers/adminController');

//ADMIN

// LES COMMENTAIRES
router.route('/comments/:id_user(\\d+)?/:id_product(\\d+)?')
    //liste des commentaires
    .get(adminController.findAllComments)
    //suppression d'un commentaire par produit
    .delete(adminController.deleteComment);

//LES COLLECTIONS
/**
 * @route PUT /admin/collections/{id_collection}
 */
router.route('/collections/:id_collection(\\d+)?')
    //ajout/modif d'une collection 
    .put(adminController.saveCollection)
    //suppression d'une collection 
    .delete(adminController.deleteCollection);

//LES UILISATEURS
router.route('/users')
    //la liste des utilisateurs 
    .get(adminController.allUsers);
//la liste d'un utilisateur
router.route('/users/:id_user(\\d+)')
    .get(adminController.oneUserAdmin)

//LES PRODUITS
router.route('/products/:id_product(\\d+)?')
    //ajout/modif d'un produit 
    .put(adminController.saveProduct)
    //suppression d'un produit 
    .delete(adminController.deleteProduct);
//produit par role
router.route('/products/:role(auteur|illustrateur)/:id_product(\\d+)/:id_user(\\d+)')
    //ajout d'un role à un produit
    .post(adminController.addRoleToProduct)
    //suppression d'un role à un produit
    .delete(adminController.deleteRoleToProduct);

//LES ILLUSTRATIONS
router.route('/gallery/:id_gallery(\\d+)?')
    //ajout/modif d'une illustration 
    .put(adminController.saveIllustration)
    //suppression d'une illustration 
    .delete(adminController.deleteIllustration);

// LES EVENEMENTS
router.route('/events/:id_event(\\d+)?')
    //ajout/modif d'un évènement 
    .put(adminController.saveEvent)
    //suppression d'un évènement 
    .delete(adminController.deleteEvent);

// LES TAG
router.route('/tags/:id_tag(\\d+)?')
    //ajout ou modif d'un tag 
    .put(adminController.saveTag)
    //suppression d'un tag 
    .delete(adminController.deleteTag);
//tag par produit
router.route('/tags/:id_tag/:id_product(\\d+)')
    //ajout d'un tag au produit 
    .post(adminController.addTagToProduct)
    //suppression d'un tag par produit 
    .delete(adminController.deleteTagFromProduct);

//LES EDITIONS
router.route('/editions/:id_edition(\\d+)?')
    //ajout/modif d'une édition 
    .put(adminController.saveEdition)
    //suppression d'une édition 
    .delete(adminController.deleteEdition);

// LES TYPES
router.route('/types/:id_type(\\d+)?')
    //ajout ou modif d'un type
    .put(adminController.saveType)
    //suppression d'un type
    .delete(adminController.deleteType);


//LES ADRESSES
//le détail des adresses d'un user
router.route('/address/:id_user(\\d+)')
    .get(adminController.addressesOfOneUser);


module.exports = router;