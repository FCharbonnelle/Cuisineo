import initialRecipes from '../data/recettes.json';
import { v4 as uuidv4 } from 'uuid'; // Pour générer des ID uniques locaux

const LOCAL_STORAGE_KEY = 'cuisineo_recettes';

export function seedIfNeeded() {
  // Ne rien faire côté serveur
  if (typeof window === 'undefined') return;

  try {
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!localData) {
      // Ajouter des IDs uniques et une structure minimale si nécessaire
      const recipesToStore = initialRecipes.map(recipe => ({
          ...recipe,
          id: uuidv4(), // ID unique pour usage local
          // Simuler d'autres champs si besoin pour l'affichage initial
          // Note: Pas de userId, createdAt car géré par Firestore plus tard
          imageUrl: recipe.imageUrl || null, // Assurer que imageUrl existe, même si null
          createdAt: new Date().toISOString(), // Simuler une date de création locale
          updatedAt: new Date().toISOString()  // Simuler une date de màj locale
      }));
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipesToStore));
      console.log('Seed initial des recettes dans localStorage effectué.');
    }
  } catch (error) {
    console.error("Erreur lors du seeding localStorage :", error);
  }
} 