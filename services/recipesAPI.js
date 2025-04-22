import {
  // getAllLocalRecipes, // Plus utilisé pour la lecture principale
  // getLocalRecipeById, // Plus utilisé pour la lecture principale
  // addLocalRecipe, // Décommenter si besoin
  // updateLocalRecipe, // Décommenter si besoin
  // deleteLocalRecipe // Décommenter si besoin
} from './localRecipes';

// --- Imports Firestore ---
// collection: Référence à une collection Firestore (ex: 'recettes')
// getDocs: Récupère tous les documents d'une requête ou collection
// getDoc: Récupère un document spécifique par sa référence
// doc: Référence à un document spécifique (via son ID)
// query: Construit une requête Firestore (filtrage, tri)
// orderBy: Trie les résultats d'une requête
// deleteDoc: Supprime un document Firestore
import { collection, getDocs, getDoc, doc, query, orderBy, deleteDoc } from 'firebase/firestore';
// db: Instance Firestore initialisée dans notre fichier client
import { db } from '@/firebase/client';

// --- Phase 3: Utilisation de Firestore pour la Lecture --- 

/**
 * Récupère toutes les recettes depuis la collection 'recettes' dans Firestore.
 * Les recettes sont triées par date de création décroissante.
 * @returns {Promise<Array<Object>>} Une promesse résolue avec un tableau d'objets recette.
 * @throws {Error} Renvoie une erreur si la récupération échoue.
 */
export async function getAllRecipes() {
  console.log("Appel de getAllRecipes (Firestore)");
  try {
    // Référence à la collection 'recettes'
    const recipesRef = collection(db, 'recettes');
    // Création de la requête pour trier par 'createdAt' en ordre décroissant
    const q = query(recipesRef, orderBy('createdAt', 'desc')); 
    // Exécution de la requête pour obtenir un snapshot des documents
    const querySnapshot = await getDocs(q);
    
    // Initialisation d'un tableau pour stocker les données formatées
    const recipes = [];
    // Boucle sur chaque document dans le snapshot
    querySnapshot.forEach((doc) => {
      // Ajoute un objet au tableau `recipes` contenant:
      // - l'ID du document Firestore
      // - toutes les données (champs) du document (...doc.data())
      recipes.push({ id: doc.id, ...doc.data() });
    });
    console.log(`Récupéré ${recipes.length} recettes de Firestore.`);
    return recipes; // Retourne le tableau des recettes
  } catch (error) {
    // Log de l'erreur en cas de problème
    console.error("Erreur lors de la récupération de toutes les recettes depuis Firestore:", error);
    // Renvoie l'erreur pour qu'elle soit gérée par le composant appelant
    throw error;
  }
}

/**
 * Récupère une recette spécifique par son ID depuis Firestore.
 * @param {string} id - L'ID du document recette à récupérer.
 * @returns {Promise<Object|null>} Une promesse résolue avec l'objet recette ou null si non trouvée.
 * @throws {Error} Renvoie une erreur si la récupération échoue.
 */
export async function getRecipeById(id) {
  console.log(`Appel de getRecipeById pour l'ID: ${id}`);
  try {
    // Référence directe au document recette via son ID
    const recipeRef = doc(db, 'recettes', id);
    // Tentative de récupération du document
    const docSnap = await getDoc(recipeRef);

    // Vérifie si le document existe
    if (docSnap.exists()) {
      // Si oui, retourne un objet avec l'ID et les données
      console.log("Document trouvé:", docSnap.data());
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // Si non, log un message et retourne null
      console.log("Aucun document trouvé avec cet ID dans Firestore!");
      return null;
    }
  } catch (error) {
    // Log et renvoi de l'erreur
    console.error("Erreur lors de la récupération d'une recette par ID depuis Firestore:", error);
    throw error;
  }
}

// --- Fonctions CRUD à implémenter pour la Phase 1 si nécessaire ---
// export async function addRecipe(recipeData) { ... }
// export async function updateRecipe(id, recipeData) { ... }

// --- Fonctions d'écriture/suppression --- 

// Note: Les fonctions addDoc et updateDoc sont gérées directement dans RecipeForm.jsx pour l'instant
// afin de pouvoir gérer la redirection et l'état du formulaire plus facilement.

/**
 * Supprime une recette par son ID depuis Firestore.
 * La permission est gérée par les règles de sécurité Firestore.
 * @param {string} id - L'ID de la recette à supprimer.
 * @returns {Promise<void>} Une promesse résolue quand la suppression est terminée.
 * @throws {Error} Renvoie une erreur si la suppression échoue.
 */
export async function deleteRecipe(id) {
  console.log(`Tentative de suppression de la recette ID: ${id}`);
  try {
    // Référence au document à supprimer
    const recipeRef = doc(db, 'recettes', id);
    // Appel de la fonction de suppression Firestore
    await deleteDoc(recipeRef);
    console.log("Recette supprimée avec succès, ID:", id);
  } catch (error) {
    // Log et renvoi de l'erreur
    console.error("Erreur lors de la suppression de la recette depuis Firestore:", error);
    throw error;
  }
}

// --- Phase 3: Remplacer les appels ci-dessus par des appels à Firestore --- 
// Exemple:
// import { collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
// import { db } from '../firebase/client';

// export async function getAllRecipes() {
//   const querySnapshot = await getDocs(collection(db, "recettes"));
//   return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
// } 