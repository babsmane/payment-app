const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Utilisateurs
 *   description: Gestion des utilisateurs
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: ID auto-généré
 *         name:
 *           type: string
 *           description: Nom de l'utilisateur
 *         email:
 *           type: string
 *           format: email
 *           description: Email de l'utilisateur
 *         role:
 *           type: string
 *           enum: [admin, client]
 *           default: client
 *           description: Rôle de l'utilisateur
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Date de création
 *       example:
 *         _id: "60d5ec9f8b3e4b001f7e4a1b"
 *         name: "Babacar Mane"
 *         email: "babacar@example.com"
 *         role: "client"
 *         createdAt: "2023-06-20T10:00:00.000Z"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */


/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Enregistrer un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Babacar Mane"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "babacar@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 minLength: 6
 *                 example: "motdepasse123"
 *     responses:
 *       200:
 *         description: Utilisateur enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT pour l'authentification
 *       400:
 *         description: Erreur de validation ou email déjà utilisé
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           msg:
 *                             type: string
 *                           param:
 *                             type: string
 *                           location:
 *                             type: string
 *                 - type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Un utilisateur existe déjà avec cet email."
 *       500:
 *         description: Erreur serveur
 */

router.post('/register',
  [
    check('name', 'Le nom est requis').not().isEmpty(),
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Veuillez entrer un mot de passe de 6 caractères ou plus').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: 'Un utilisateur existe déjà avec cet email.' });
      }
      user = new User({ name, email, password });
      await user.save();
      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur serveur');
    }
  }
);

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Utilisateurs]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "babacar@example.com"
 *               password:
 *                 type: string
 *                 format: password
 *                 example: "motdepasse123"
 *     responses:
 *       200:
 *         description: Connexion réussie
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Token JWT pour l'authentification
 *       400:
 *         description: Identifiants invalides
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Identifiants invalides."
 *       500:
 *         description: Erreur serveur
 */

router.post('/login',
  [
    check('email', 'Veuillez inclure un email valide').isEmail(),
    check('password', 'Le mot de passe est requis').exists()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Identifiants invalides.' });
      }
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Identifiants invalides.' });
      }
      const payload = { user: { id: user.id } };
      jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (err) {
      console.error(err.message);
      res.status(500).send('Erreur serveur');
    }
  }
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé (token manquant ou invalide)
 *       500:
 *         description: Erreur serveur
 */

router.get('/', auth, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */

router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Modifier un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Nouveau Nom"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "nouvel@email.com"
 *     responses:
 *       200:
 *         description: Utilisateur modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */

router.put('/:id', auth, async (req, res) => {
  const { name, email } = req.body;
  try {
    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    user.name = name || user.name;
    user.email = email || user.email;
    await user.save();
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Utilisateur supprimé."
 *       401:
 *         description: Non autorisé
 *       404:
 *         description: Utilisateur non trouvé
 *       500:
 *         description: Erreur serveur
 */

router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé.' });
    }
    await user.remove();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erreur serveur');
  }
});

module.exports = router;
