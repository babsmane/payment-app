const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * @swagger
 * tags:
 *   name: Paiements
 *   description: API pour gérer les paiements Stripe
 */

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Effectuer un paiement
 *     description: Crée un paiement via Stripe
 *     tags: [Paiements]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Détails du paiement
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 1000
 *               currency:
 *                 type: string
 *                 example: "xof"
 *               source:
 *                 type: string
 *                 example: "tok_visa"
 *               description:
 *                 type: string
 *                 example: "Paiement pour produit local"
 *             required:
 *               - amount
 *               - currency
 *               - source
 *     responses:
 *       201:
 *         description: Paiement réussi
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   example: "ch_1Jz5jX2eZvKYlo2C1XZ1p7J3"
 *       400:
 *         description: Erreur de paiement
 *       401:
 *         description: Non autorisé
 */

router.post('/', async (req, res) => {
  try {
    const { amount, currency, source, description } = req.body;
    const charge = await stripe.charges.create({
      amount,
      currency,
      source,
      description
    });
    res.status(201).json(charge);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
