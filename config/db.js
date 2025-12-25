const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    if (process.env.NODE_ENV !== 'test') {
      console.log('MongoDB connecté');
    }
  } catch (err) {
    if (process.env.NODE_ENV !== 'test') {
      console.error('Erreur de connexion à MongoDB', err);
    }
    process.exit(1);
  }
};
