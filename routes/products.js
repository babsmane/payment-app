const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');
const { check, validationResult } = require('express-validator');

/**
 * @swagger
 * tags:
 *   name: Produits
 *   description: Gestion des produits
 *
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré
 *         name:
 *           type: string
 *           description: Nom du produit
 *         price:
 *           type: number
 *           description: Prix du produit
 *           minimum: 0
 *         description:
 *           type: string
 *           description: Description du produit
 *           minLength: 10
 *           maxLength: 500
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *       example:
 *         _id: "60d5ec9f8b3e4b001f7e4a1c"
 *         name: "Produit Test"
 *         price: 99.99
 *         description: "Un produit de test avec une description détaillée pour l'exemple."
 *         createdAt: "2023-06-20T10:00:00.000Z"
 *
 *   responses:
 *     PaginationResponse:
 *       description: Réponse paginée
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               products:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Product'
 *               total:
 *                 type: integer
 *                 description: Nombre total de produits
 *               page:
 *                 type: integer
 *                 description: Numéro de la page actuelle
 *               pages:
 *                 type: integer
 *                 description: Nombre total de pages
 *     ErrorResponse:
 *       description: Erreur serveur
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message d'erreur
 *     ValidationError:
 *       description: Erreur de validation
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               errors:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     msg:
 *                       type: string
 *                     param:
 *                       type: string
 *                     location:
 *                       type: string
 */


/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Lister tous les produits (avec pagination)
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Numéro de la page
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Nombre de produits par page
 *     responses:
 *       200:
 *         $ref: '#/components/responses/PaginationResponse'
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       500:
 *         $ref: '#/components/responses/ErrorResponse'
 */

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1; // Page par défaut : 1
    const limit = parseInt(req.query.limit) || 10; // Limite par défaut : 10
    const skip = (page - 1) * limit;

    const products = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Product.countDocuments();

    res.json({
      products,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});


/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Récupérer un produit par ID
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produit non trouvé."
 *       500:
 *         $ref: '#/components/responses/ErrorResponse'
 */

router.get('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

// Validation pour la création/modification d'un produit
const validateProduct = [
  check('name', 'Le nom du produit est requis').not().isEmpty(),
  check('price', 'Le prix doit être un nombre positif').isNumeric().custom(value => value > 0),
  check('description', 'La description doit faire entre 10 et 500 caractères').isLength({ min: 10, max: 500 }),
];

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Créer un produit (admin uniquement)
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nouveau Produit"
 *               price:
 *                 type: number
 *                 example: 29.99
 *                 minimum: 0
 *               description:
 *                 type: string
 *                 example: "Description détaillée du produit (10-500 caractères)."
 *                 minLength: 10
 *                 maxLength: 500
 *     responses:
 *       201:
 *         description: Produit créé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         description: Non autorisé
 *       403:
 *         description: Accès refusé (réservé aux admins)
 *       500:
 *         $ref: '#/components/responses/ErrorResponse'
 */

router.post('/', [auth, admin, validateProduct], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Modifier un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               price:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Produit modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produit non trouvé."
 *       500:
 *         $ref: '#/components/responses/ErrorResponse'
 */

router.put('/:id', auth, async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(product);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Supprimer un produit
 *     tags: [Produits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du produit
 *     responses:
 *       200:
 *         description: Produit supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produit supprimé."
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Produit non trouvé
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Produit non trouvé."
 *       500:
 *         $ref: '#/components/responses/ErrorResponse'
 */

router.delete('/:id', auth, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Produit non trouvé.' });
    }
    await product.remove();
    res.json({ message: 'Produit supprimé.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;