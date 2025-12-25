const request = require('supertest');
const app = require('../app');
const Product = require('../models/Product');
const User = require('../models/User');

describe('Produits', () => {
  let adminToken;
  let productId;

  beforeAll(async () => {
    const admin = new User({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin'
    });
    await admin.save();

    const res = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@test.com', password: '123456' });
    adminToken = res.body.token;
  });

  describe('POST /api/products', () => {
    it('devrait créer un produit (admin seulement)', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('x-auth-token', adminToken)
        .send({
          name: 'Produit Test',
          price: 100,
          description: 'Description du produit test.'
        });
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('_id');
      productId = res.body._id;
    });

    it('devrait refuser la création si les données sont invalides', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('x-auth-token', adminToken)
        .send({
          name: '',
          price: -10,
          description: 'Trop court'
        });
      expect(res.statusCode).toEqual(400);
    });
  });

  describe('GET /api/products', () => {
    it('devrait retourner les produits avec pagination', async () => {
      const res = await request(app)
        .get('/api/products?page=1&limit=5')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('products');
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('page');
      expect(res.body).toHaveProperty('pages');
    });
  });

  describe('DELETE /api/products/:id', () => {
    it('devrait supprimer un produit', async () => {
      const res = await request(app)
        .delete(`/api/products/${productId}`)
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('message');
    });
  });
});
