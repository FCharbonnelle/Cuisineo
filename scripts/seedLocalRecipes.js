// Importe les données de recettes initiales depuis le fichier JSON
import initialRecipes from '@/data/recettes.json'; // Utilisation de l'import absolu
// Importe la fonction v4 de la bibliothèque uuid pour générer des identifiants uniques
import { v4 as uuidv4 } from 'uuid'; 

// Définit la clé qui sera utilisée pour stocker les recettes dans le localStorage du navigateur
const LOCAL_STORAGE_KEY = 'cuisineo_recettes';

/**
 * Fonction pour initialiser le localStorage avec des recettes de démonstration.
 * Vérifie si des données existent déjà sous la clé `LOCAL_STORAGE_KEY`.
 * Si non, elle prend les recettes du fichier JSON, leur ajoute un ID unique (via uuid)
 * et quelques champs simulés (imageUrl, createdAt, updatedAt), puis les stocke
 * dans le localStorage.
 * 
 * IMPORTANT: Cette fonction est conçue pour être appelée UNIQUEMENT côté client (navigateur),
 * car elle interagit avec `localStorage` qui n'existe pas côté serveur (Node.js).
 */
export function seedIfNeeded() {
  // --- Sécurité Côté Serveur ---
  // Vérifie si le code s'exécute dans un environnement navigateur (`window` existe).
  // Si `window` est `undefined`, cela signifie qu'on est côté serveur (ex: lors du build Next.js).
  // Dans ce cas, on ne fait rien et on sort de la fonction pour éviter une erreur.
  if (typeof window === 'undefined') {
    // console.warn("seedIfNeeded: Tentative d'exécution côté serveur ignorée.");
    return;
  }

  // --- Logique d'Initialisation (Côté Client Uniquement) ---
  try {
    // Tente de récupérer les données existantes dans localStorage sous notre clé.
    const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
    
    // Si `localData` est null ou undefined (aucune donnée existante trouvée)...
    if (!localData) {
      console.log(`Seed initial: Clé '${LOCAL_STORAGE_KEY}' non trouvée. Initialisation en cours...`);
      
      // Préparation des données à stocker :
      // On utilise `map` pour transformer chaque recette du fichier JSON importé.
      const recipesToStore = initialRecipes.map((recipe, index) => ({
          ...recipe, // Copie toutes les propriétés existantes de la recette (nom, categorie, etc.)
          id: uuidv4(), // Génère un ID unique universel (UUID v4) pour cette recette
          
          // --- Simulation de champs supplémentaires ---
          // Ces champs ne sont pas dans le JSON initial mais sont utiles pour la cohérence
          // de l'affichage avant l'implémentation de Firestore.
          // On s'assure que `imageUrl` existe, même si `null`.
          imageUrl: recipe.imageUrl || null, 
          // Simule une date de création en utilisant la date actuelle au format ISO string.
          createdAt: new Date(Date.now() - index * 60000).toISOString(), // Décalage léger pour le tri
          // Simule une date de mise à jour (identique à la création pour le seed).
          updatedAt: new Date(Date.now() - index * 60000).toISOString()
      }));
      
      // Stocke le tableau `recipesToStore` dans localStorage.
      // `JSON.stringify` est nécessaire car localStorage ne peut stocker que des chaînes de caractères.
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recipesToStore));
      console.log(`Seed initial: ${recipesToStore.length} recettes stockées dans localStorage.`);
      
    } else {
      // Si des données existent déjà, on n'écrase rien.
      // console.log(`Seed initial: Données déjà présentes sous '${LOCAL_STORAGE_KEY}'. Aucune action.`);
    }
    
  } catch (error) {
    // Gère les erreurs potentielles lors de l'accès à localStorage 
    // (ex: navigateur en mode privé strict, stockage plein, etc.).
    console.error("Erreur lors de l'initialisation du localStorage (seedIfNeeded):", error);
  }
} 