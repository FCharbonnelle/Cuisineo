import {
  // getAllLocalRecipes, // Plus utilisé pour la lecture principale
  // getLocalRecipeById, // Plus utilisé pour la lecture principale
  // addLocalRecipe, // Décommenter si besoin
  // updateLocalRecipe, // Décommenter si besoin
  // deleteLocalRecipe // Décommenter si besoin
} from './localRecipes';

// Importer les fonctions et l'instance db de Firestore
import { collection, getDocs, getDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/client'; // Utilisation de l'import absolu

// --- Phase 3: Utilisation de Firestore --- 

/**
 * Récupère toutes les recettes depuis Firestore.
 * @returns {Promise<Array>} Une promesse résolue avec le tableau des recettes.
 */
export async function getAllRecipes() {
  try {
    // Optionnel: Ordonner les recettes par date de création décroissante
    const recipesRef = collection(db, 'recettes');
    const q = query(recipesRef, orderBy('createdAt', 'desc')); 
    // const querySnapshot = await getDocs(collection(db, "recettes")); // Version simple sans tri
    const querySnapshot = await getDocs(q);
    
    const recipes = [];
    querySnapshot.forEach((doc) => {
      // Important: convertir les Timestamps Firestore en Date ou string si nécessaire ici
      // Pour l'instant, on les laisse tels quels, on les gérera à l'affichage si besoin
      recipes.push({ id: doc.id, ...doc.data() });
    });
    return recipes;
  } catch (error) {
    console.error("Erreur lors de la récupération de toutes les recettes depuis Firestore:", error);
    throw error; // Renvoyer l'erreur pour la gérer dans le composant
  }
}

/**
 * Récupère une recette par son ID depuis Firestore.
 * @param {string} id - L'ID de la recette.
 * @returns {Promise<Object|null>} Une promesse résolue avec la recette ou null si non trouvée.
 */
export async function getRecipeById(id) {
  try {
    const recipeRef = doc(db, 'recettes', id);
    const docSnap = await getDoc(recipeRef);

    if (docSnap.exists()) {
      // Convertir les Timestamps si nécessaire
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // doc.data() will be undefined in this case
      console.log("Aucun document trouvé avec cet ID dans Firestore!");
      return null;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération d'une recette par ID depuis Firestore:", error);
    throw error; // Renvoyer l'erreur
  }
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