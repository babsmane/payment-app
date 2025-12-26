const app = require('./app');
const connectDB = require('./config/db');
require('dotenv').config();

// Connexion à la base de données
if (process.env.NODE_ENV !== 'test') {
  connectDB();
}

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});
