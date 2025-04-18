import {
  getAllLocalRecipes,
  getLocalRecipeById,
  // addLocalRecipe, // Décommenter si besoin
  // updateLocalRecipe, // Décommenter si besoin
  // deleteLocalRecipe // Décommenter si besoin
} from './localRecipes';

// --- Phase 1: Utilisation de localStorage --- 

/**
 * Récupère toutes les recettes (actuellement depuis localStorage).
 * @returns {Promise<Array>} Une promesse résolue avec le tableau des recettes.
 */
export async function getAllRecipes() {
  // Simule un délai API pour l'exemple, mais lit directement localStorage
  // await new Promise(resolve => setTimeout(resolve, 50)); // Optionnel
  return getAllLocalRecipes();
}

/**
 * Récupère une recette par son ID (actuellement depuis localStorage).
 * @param {string} id - L'ID de la recette.
 * @returns {Promise<Object|null>} Une promesse résolue avec la recette ou null.
 */
export async function getRecipeById(id) {
  // await new Promise(resolve => setTimeout(resolve, 50)); // Optionnel
  return getLocalRecipeById(id);
}

// --- Fonctions CRUD à implémenter pour la Phase 1 si nécessaire ---
// export async function addRecipe(recipeData) { ... }
// export async function updateRecipe(id, recipeData) { ... }
// export async function deleteRecipe(id) { ... }

// --- Phase 3: Remplacer les appels ci-dessus par des appels à Firestore --- 
// Exemple:
// import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../firebase/client';

// export async function getAllRecipes() {
//   const querySnapshot = await getDocs(collection(db, "recettes"));
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// } 