# Payment App - API de Paiement avec Node.js, MongoDB et Stripe

[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-blue)](https://www.mongodb.com/atlas)
[![Stripe](https://img.shields.io/badge/Stripe-API-purple)](https://stripe.com/)
[![Jest](https://img.shields.io/badge/Jest-Tests-red)](https://jestjs.io/)

Une API Node.js pour gérer les utilisateurs, les produits et les paiements en ligne, avec authentification JWT, rôles utilisateurs, validation des données et tests automatisés.

---

## 📋 Table des Matières
- [Fonctionnalités](#-fonctionnalités)
- [Prérequis](#-prérequis)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Utilisation](#-utilisation)
  - [Routes API](#routes-api)
  - [Exemples de requêtes](#exemples-de-requêtes)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Contribution](#-contribution)
- [Licence](#-licence)

---

## 🌟 Fonctionnalités
✅ **Gestion des utilisateurs** (CRUD)
✅ **Rôles utilisateurs** (admin, client)
✅ **Gestion des produits** (CRUD + validation)
✅ **Pagination** pour les listes
✅ **Authentification JWT**
✅ **Intégration Stripe** pour les paiements
✅ **Tests automatisés** avec Jest et Supertest

---

## 📦 Prérequis
- [Node.js](https://nodejs.org/) (v18 ou supérieur)
- [MongoDB Atlas](https://www.mongodb.com/atlas) (ou une instance locale)
- [Stripe](https://stripe.com/) (compte développeur)
- [Git](https://git-scm.com/)

---

## 🛠 Installation

1. **Clone le dépôt** :
   ```bash
   git clone https://github.com/babsmane/payment-app.git
   cd payment-app
