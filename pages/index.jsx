import React, { useState, useEffect } from 'react';
import Head from 'next/head'; // Pour gérer le <head> HTML (titre, meta description)
import { getAllRecipes } from '@/services/recipesAPI'; // Fonction API pour récupérer TOUTES les recettes (depuis Firestore maintenant)
import RecipeCard from '@/components/recipes/RecipeCard'; // Composant pour afficher une carte recette
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icône pour la barre de recherche

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

  // --- Filtrage des recettes --- 
  // Cette logique filtre le tableau `recipes` localement (côté client) 
  // en fonction de la valeur actuelle de `searchTerm`.
  const filteredRecipes = recipes.filter((recipe) =>
    // Vérifie si le nom de la recette (en minuscules) inclut le terme de recherche (en minuscules)
    recipe.nom.toLowerCase().includes(searchTerm.toLowerCase())
    // On pourrait ajouter ici d'autres critères de filtre (ex: ingrédients, catégorie)
  );

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
        <div className="relative max-w-lg"> {/* Limite la largeur de la barre */} 
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
              {/* Message différent si un terme de recherche est actif */}
              {recipes.length > 0 && searchTerm 
                ? `Aucune recette trouvée pour "${searchTerm}".`
                : "Aucune recette à afficher pour le moment."
              }
            </p>
          )}
        </div>
      )}
    </>
  );
}
