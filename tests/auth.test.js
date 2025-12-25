const request = require('supertest');
const app = require('../app');
const User = require('../models/User');

describe('Authentification', () => {
  beforeAll(async () => {
    const user = new User({
      name: 'User Test',
      email: 'user@test.com',
      password: '123456'
    });
    await user.save();
  });

  describe('POST /api/users/login', () => {
    it('devrait connecter un utilisateur existant', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'user@test.com', password: '123456' });
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
    });

    it('devrait refuser la connexion avec un mot de passe incorrect', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({ email: 'user@test.com', password: 'mauvais' });
      expect(res.statusCode).toEqual(400);
    });
  });
});
