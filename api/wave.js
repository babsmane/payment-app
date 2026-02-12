const axios = require('axios');
require('dotenv').config();

const WAVE_CLIENT_ID = process.env.WAVE_CLIENT_ID;
const WAVE_CLIENT_SECRET = process.env.WAVE_CLIENT_SECRET;
const WAVE_REDIRECT_URI = process.env.WAVE_REDIRECT_URI;

// Étape 1 : Rediriger l'utilisateur pour l'autorisation
const authUrl = `https://api.wave.com/v1/oauth2/authorize?client_id=${WAVE_CLIENT_ID}&redirect_uri=${WAVE_REDIRECT_URI}&response_type=code`;
console.log('Autorisation URL:', authUrl);

// Étape 2 : Échanger le code contre un token
async function getAccessToken(code) {
  try {
    const response = await axios.post('https://api.wave.com/v1/oauth2/token', {
      client_id: WAVE_CLIENT_ID,
      client_secret: WAVE_CLIENT_SECRET,
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: WAVE_REDIRECT_URI
    });
    console.log('Token:', response.data.access_token);
    return response.data.access_token;
  } catch (error) {
    console.error('Erreur token:', error.response?.data || error.message);
  }
}

// Étape 3 : Appel API avec token
async function getWaveBusinesses(token) {
  try {
    const response = await axios.get('https://api.wave.com/v1/businesses', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('Businesses:', response.data);
  } catch (error) {
    console.error('Erreur API:', error.response?.data || error.message);
  }
}
