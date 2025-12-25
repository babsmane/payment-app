const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Utilisateurs', () => {
  let token;
  let adminToken;

  beforeAll(async () => {
    // Créer un utilisateur admin pour les tests
    const admin = new User({
      name: 'Admin Test',
      email: 'admin@test.com',
      password: '123456',
      role: 'admin'
    });
    await admin.save();

    // Créer un utilisateur normal
    const user = new User({
      name: 'User Test',
      email: 'user@test.com',
      password: '123456',
      role: 'client'
    });
    await user.save();

    // Récupérer les tokens
    const adminRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'admin@test.com', password: '123456' });
    adminToken = adminRes.body.token;

    const userRes = await request(app)
      .post('/api/users/login')
      .send({ email: 'user@test.com', password: '123456' });
    token = userRes.body.token;
  });

  describe('POST /api/users/register', () => {
    it('devrait enregistrer un nouvel utilisateur', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          name: 'Nouvel Utilisateur',
          email: 'nouvel@test.com',
          password: '123456'
        });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });
  });

  describe('GET /api/users', () => {
    it('devrait retourner tous les utilisateurs (admin seulement)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('x-auth-token', adminToken);
      expect(res.statusCode).toEqual(200);
      expect(res.body.length).toBeGreaterThan(0);
    });

    it('devrait refuser l\'accès aux non-admins', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('x-auth-token', token);
      expect(res.statusCode).toEqual(403);
    });
  });
});
