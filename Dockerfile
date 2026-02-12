# Étape 1 : Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./
RUN npm ci --only=production

# Copier le code source
COPY . .

# Étape 2 : Runtime
FROM node:18-alpine

WORKDIR /app

# Copier les dépendances depuis le builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app ./

# Exposer le port
EXPOSE 3000

# Commande de démarrage
CMD ["npm", "start"]
