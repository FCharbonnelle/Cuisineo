import React, { useState, useEffect } from 'react';
import Head from 'next/head'; // Pour gérer le <head> HTML (titre, meta description)
import { getAllRecipes } from '@/services/recipesAPI'; // Fonction API pour récupérer TOUTES les recettes (depuis Firestore maintenant)
import RecipeCard from '@/components/recipes/RecipeCard'; // Composant pour afficher une carte recette
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icône pour la barre de recherche

// Définition des catégories possibles pour les filtres.
// Mettre cette constante ici la rend facilement accessible et modifiable.
const CATEGORIES = ['Toutes', 'entrée', 'plat', 'dessert', 'boisson'];

/**
 * Page d'accueil de l'application.
 * Affiche la liste de toutes les recettes publiques disponibles,
 * récupérées depuis Firestore.
 * Inclut une barre de recherche pour filtrer les recettes affichées côté client.
 */
export default function HomePage() {
  // --- États du composant ---
  // recipes: Tableau pour stocker toutes les recettes récupérées depuis l'API
  const [recipes, setRecipes] = useState([]);
  // searchTerm: Chaîne de caractères stockant la valeur actuelle de la barre de recherche
  const [searchTerm, setSearchTerm] = useState('');
  // isLoading: Booléen pour indiquer si les recettes sont en cours de chargement
  const [isLoading, setIsLoading] = useState(true);
  // error: Stocke un message d'erreur si le chargement échoue
  const [error, setError] = useState(null);
  
  // NOUVEL ÉTAT: Stocke la catégorie actuellement sélectionnée pour le filtre.
  // Initialisé à 'Toutes' pour afficher toutes les recettes par défaut.
  const [selectedCategory, setSelectedCategory] = useState('Toutes');

  // --- Effet de bord pour charger les données au montage --- 
  useEffect(() => {
    // Définition d'une fonction asynchrone pour charger les recettes
    async function loadRecipes() {
      console.log("Chargement de toutes les recettes depuis l'API (Firestore)...");
      try {
        setIsLoading(true); // Indiquer le début du chargement
        setError(null);     // Réinitialiser les erreurs
        // Appel à l'API pour récupérer toutes les recettes
        const data = await getAllRecipes(); 
        setRecipes(data); // Mettre à jour l'état avec les recettes reçues
        console.log(`${data.length} recettes chargées.`);
      } catch (err) {
        // En cas d'erreur lors de l'appel API
        console.error("Erreur lors du chargement des recettes:", err);
        setError("Impossible de charger les recettes. Veuillez vérifier votre connexion ou réessayer.");
        setRecipes([]); // S'assurer que `recipes` reste un tableau vide
      } finally {
        // Dans tous les cas, arrêter l'indicateur de chargement
        setIsLoading(false);
      }
    }
    // Appel de la fonction de chargement
    loadRecipes();
  // Le tableau de dépendances vide `[]` signifie que cet effet ne s'exécutera 
  // qu'une seule fois, après le premier rendu du composant (équivalent de componentDidMount).
  }, []); 

  // --- Logique de Filtrage Combinée --- 
  // Filtre maintenant les recettes en fonction de `searchTerm` ET `selectedCategory`.
  const filteredRecipes = recipes.filter((recipe) => {
    // Condition 1: La catégorie de la recette doit correspondre à la catégorie sélectionnée
    // OU la catégorie sélectionnée doit être 'Toutes' (pour ne pas filtrer par catégorie).
    // On compare en minuscules pour éviter les problèmes de casse.
    const categoryMatch = selectedCategory === 'Toutes' || recipe.categorie.toLowerCase() === selectedCategory.toLowerCase();
    
    // Condition 2: Le nom de la recette doit inclure le terme de recherche.
    const searchMatch = recipe.nom.toLowerCase().includes(searchTerm.toLowerCase());
    
    // La recette est incluse dans `filteredRecipes` si les DEUX conditions sont vraies.
    return categoryMatch && searchMatch;
  });

  // --- Gestionnaire d'événement pour les boutons de catégorie ---
  // Fonction appelée lorsqu'un bouton de catégorie est cliqué.
  const handleCategoryFilter = (category) => {
    console.log(`Filtre appliqué pour la catégorie : ${category}`);
    // Met à jour l'état `selectedCategory` avec la nouvelle catégorie.
    // Cela déclenchera un nouveau rendu et la logique de `filteredRecipes` sera réévaluée.
    setSelectedCategory(category);
  };

  // --- Rendu JSX --- 
  return (
    <>
      {/* Gestion du <head> HTML */}
      <Head>
        <title>Toutes les recettes - Cuisineo</title>
        <meta name="description" content="Parcourez toutes les recettes disponibles sur Cuisineo et trouvez votre prochaine inspiration culinaire." />
      </Head>

      {/* Section Titre et Barre de recherche */}
      <div className="mb-6 md:mb-8"> {/* Marge inférieure plus grande sur écrans larges */} 
        <h1 className="text-3xl md:text-4xl font-semibold mb-4 text-gray-800">Découvrez nos recettes</h1>
        {/* Barre de recherche avec icône */} 
        <div className="relative max-w-lg mb-6"> {/* Ajout marge sous recherche */}
          <input
            type="text"
            placeholder="Rechercher une recette par nom..." // Texte d'aide
            value={searchTerm} // Lie la valeur de l'input à l'état `searchTerm`
            // Met à jour l'état `searchTerm` à chaque changement dans l'input
            onChange={(e) => setSearchTerm(e.target.value)}
            // Styles Tailwind pour l'input (bordure, arrondi, padding, focus)
            className="border border-gray-300 rounded-lg p-2.5 pl-10 w-full focus:ring-1 focus:ring-primary focus:border-primary shadow-sm"
            aria-label="Rechercher une recette" // Pour l'accessibilité
          />
          {/* Icône loupe positionnée à gauche dans l'input */}
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
        
        {/* NOUVEAU: Section des boutons de filtre par catégorie */} 
        <div className="mb-6 md:mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-3">Filtrer par catégorie :</h2>
          {/* Conteneur flex pour aligner les boutons, avec retour à la ligne sur petits écrans */}
          <div className="flex flex-wrap gap-2"> 
            {/* Boucle sur notre constante CATEGORIES pour créer un bouton pour chaque */}
            {CATEGORIES.map((category) => (
              <button
                key={category} // Clé unique pour chaque bouton
                onClick={() => handleCategoryFilter(category)} // Appelle notre handler au clic
                // Style conditionnel pour le bouton actif :
                // - Actif: bg primaire, texte NOIR (pour contraste max), bordure foncée.
                // - Inactif: bg orange clair, texte orange foncé, hover.
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors duration-150 shadow-sm 
                  ${selectedCategory === category 
                    ? 'bg-primary text-black border border-primary-dark font-semibold'
                    : 'bg-orange-100 text-orange-800 border border-orange-200 hover:bg-orange-200 hover:border-orange-400'
                  }`}
              >
                {/* Affiche le nom de la catégorie, avec majuscule pour la première lettre */}
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* --- Affichage conditionnel de la grille de recettes --- */}
      
      {/* Affiche un message pendant le chargement initial */}
      {isLoading && <p className="text-center text-gray-500 py-10">Chargement des recettes...</p>}
      
      {/* Affiche un message en cas d'erreur de chargement */}
      {error && <p className="text-center text-red-500 py-10">{error}</p>}

      {/* Affiche la grille si le chargement est terminé et qu'il n'y a pas d'erreur */}
      {!isLoading && !error && (
        // Conteneur de la grille, avec des colonnes responsives
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Vérifie s'il y a des recettes à afficher après filtrage */}
          {filteredRecipes.length > 0 ? (
            // Si oui, boucle sur `filteredRecipes` pour afficher chaque carte
            filteredRecipes.map((recipe) => (
              // Le composant RecipeCard reçoit la recette et une clé unique
              // Note: on ne passe pas onEdit/onDelete ici car on est sur la liste publique
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            // Si non (aucune recette trouvée après filtrage ou liste vide initialement)
            // Affiche un message approprié
            <p className="text-center text-gray-500 col-span-full py-10">
              {/* Message si aucune recette ne correspond aux filtres actifs */}
              {recipes.length > 0 
                ? `Aucune recette trouvée pour "${searchTerm}"${selectedCategory !== 'Toutes' ? ` dans la catégorie "${selectedCategory}"` : ''}.`
                : "Aucune recette à afficher pour le moment."
              }
            </p>
          )}
        </div>
      )}
    </>
  );
}
