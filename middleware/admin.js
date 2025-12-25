const admin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé. Réservé aux administrateurs.' });
  }
  next();
};

module.exports = admin;
