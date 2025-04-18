const LOCAL_STORAGE_KEY = 'cuisineo_recettes';

/**
 * Récupère toutes les recettes depuis le localStorage.
 * Important : Cette fonction doit être appelée côté client uniquement.
 * @returns {Array} Un tableau des recettes ou un tableau vide en cas d'erreur ou si aucune donnée.
 */
export function getAllLocalRecipes() {
  if (typeof window === 'undefined') {
    console.warn('Tentative d\'accès au localStorage côté serveur.');
    return [];
  }
  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    return localData ? JSON.parse(localData) : [];
  } catch (error) {
    console.error("Erreur lors de la lecture du localStorage :", error);
    return [];
  }
}

/**
 * Récupère une recette par son ID depuis le localStorage.
 * @param {string} id - L'ID de la recette à récupérer.
 * @returns {Object|null} La recette trouvée ou null.
 */
export function getLocalRecipeById(id) {
  const recipes = getAllLocalRecipes();
  return recipes.find(recipe => recipe.id === id) || null;
}

// --- Fonctions CRUD supplémentaires (pourraient être ajoutées si besoin avant Firestore) ---

// export function addLocalRecipe(recipe) { ... }
// export function updateLocalRecipe(id, updatedRecipe) { ... }
// export function deleteLocalRecipe(id) { ... } 