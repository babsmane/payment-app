const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Créer un paiement
router.post('/', async (req, res) => {
  try {
    const { amount, currency, source, description } = req.body;
    const charge = await stripe.charges.create({
      amount,
      currency,
      source,
      description
    });
    res.status(201).send(charge);
  } catch (err) {
    res.status(400).send(err);
  }
});

module.exports = router;
