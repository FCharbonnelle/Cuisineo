import React, { useState, useEffect } from 'react';
import Head from 'next/head'; // Pour gérer le titre de la page
import { getAllRecipes } from '../services/recipesAPI';
import RecipeCard from '../components/recipes/RecipeCard';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'; // Icône pour la recherche

export default function HomePage() {
  const [recipes, setRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les recettes au montage côté client
  useEffect(() => {
    async function loadRecipes() {
      try {
        setIsLoading(true);
        const data = await getAllRecipes(); // Utilise l'API qui lit localStorage
        setRecipes(data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des recettes:", err);
        setError("Impossible de charger les recettes.");
        setRecipes([]); // S'assurer que recipes est un tableau vide en cas d'erreur
      } finally {
        setIsLoading(false);
      }
    }
    loadRecipes();
  }, []); // Le tableau vide assure l'exécution une seule fois au montage

  // Filtrer les recettes en fonction du terme de recherche (insensible à la casse)
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Head>
        <title>Toutes les recettes - Cuisineo</title>
        <meta name="description" content="Parcourez toutes les recettes disponibles sur Cuisineo" />
      </Head>

      <div className="mb-6">
        <h1 className="text-3xl font-semibold mb-4 text-gray-800">Découvrez nos recettes</h1>
        {/* Barre de recherche */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher une recette par nom..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg p-2 pl-10 w-full focus:ring-1 focus:ring-primary focus:border-primary"
          />
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isLoading && <p className="text-center text-gray-500">Chargement des recettes...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!isLoading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredRecipes.length > 0 ? (
            filteredRecipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">
              Aucune recette trouvée {searchTerm && `pour "${searchTerm}"`}.
            </p>
          )}
        </div>
      )}
    </>
  );
}
