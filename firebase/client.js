// --- Imports des fonctions Firebase SDK ---
// initializeApp: Fonction pour initialiser Firebase avec notre configuration.
// getApps: Fonction pour obtenir la liste des applications Firebase déjà initialisées.
// getApp: Fonction pour obtenir une référence à une application Firebase déjà initialisée.
import { initializeApp, getApps, getApp } from 'firebase/app';
// getAuth: Fonction pour obtenir l'instance du service Firebase Authentication.
import { getAuth } from 'firebase/auth';
// getFirestore: Fonction pour obtenir l'instance du service Cloud Firestore (base de données).
import { getFirestore } from 'firebase/firestore';
// getStorage: Fonction pour obtenir l'instance du service Firebase Storage (stockage de fichiers).
import { getStorage } from 'firebase/storage';

// --- Configuration Firebase ---
// Cet objet contient les clés et identifiants uniques de VOTRE projet Firebase.
// Ces valeurs sont lues depuis les variables d'environnement définies dans le fichier `.env.local`.
// Le préfixe `NEXT_PUBLIC_` est important pour que Next.js les rende accessibles
// au code exécuté côté client (navigateur).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,           // Clé d'API pour autoriser les requêtes
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,     // Domaine utilisé pour l'authentification
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,         // ID unique de votre projet Firebase
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Nom du bucket pour Firebase Storage
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // ID pour Firebase Cloud Messaging (non utilisé ici)
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,             // ID unique de votre application web dans Firebase
  // measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optionnel: Pour Google Analytics
};

// --- Initialisation de Firebase (avec gestion du Hot Module Replacement - HMR) ---
// HMR permet de voir les changements de code sans recharger toute la page pendant le développement.
// Cependant, cela peut causer des réinitialisations multiples de Firebase si on ne fait pas attention.

let app;

// Vérifie s'il n'y a PAS (`!`) d'application Firebase déjà initialisée (`getApps().length` retourne 0).
if (!getApps().length) {
  // Si aucune application n'existe, on l'initialise avec notre configuration.
  app = initializeApp(firebaseConfig);
  console.log("Firebase initialisé pour la première fois.");
} else {
  // Si une application existe déjà (à cause du HMR), on récupère simplement la référence à cette instance existante.
  // Cela évite l'erreur "Firebase app named '[DEFAULT]' already exists".
  app = getApp(); 
  console.log("Instance Firebase existante récupérée.");
}

// --- Exports des services Firebase --- 
// On obtient les instances des services spécifiques (Auth, Firestore, Storage) 
// à partir de l'application initialisée (`app`) et on les exporte pour pouvoir 
// les utiliser facilement ailleurs dans notre code.

// Instance du service d'Authentification
export const auth = getAuth(app);
// Instance du service Firestore (Base de données)
export const db = getFirestore(app);
// Instance du service Storage (Stockage de fichiers)
export const storage = getStorage(app);

// Exporter l'instance `app` elle-même peut parfois être utile, bien que moins courant.
export default app; 