import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext'; // Pour vérifier l'utilisateur connecté
import { getRecipeById } from '@/services/recipesAPI';
import RecipeForm from '@/components/recipes/RecipeForm'; // Le formulaire réutilisable
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * Page dynamique pour modifier une recette existante.
 * Récupère l'ID depuis l'URL, charge les données de la recette,
 * vérifie l'autorisation et affiche le formulaire pré-rempli.
 */
function ModifyRecipePage() {
  const router = useRouter();
  const { id } = router.query; 
  const { user, loading: authLoading } = useAuth(); // Récupère l'utilisateur connecté

  const [recipeData, setRecipeData] = useState(null); // Stocke les données de la recette à éditer
  const [isLoading, setIsLoading] = useState(true); // Chargement des données recette
  const [error, setError] = useState(null); // Erreur de chargement ou d'autorisation

  // Effet pour charger les données et vérifier l'autorisation
  useEffect(() => {
    if (router.isReady && id && !authLoading) {
      // Si l'authentification est chargée mais qu'il n'y a pas d'utilisateur
      if (!user) {
        setError("Veuillez vous connecter pour modifier une recette.");
        setIsLoading(false);
        // Optionnel: rediriger vers connexion
        // router.push('/connexion');
        return; 
      }

      async function fetchRecipeForEdit() {
        console.log(`Chargement de la recette ID: ${id} pour modification`);
        setIsLoading(true);
        setError(null);
        try {
          const data = await getRecipeById(id);
          if (data) {
            // Vérification d'autorisation simple
            if (data.userId !== user.uid) {
              setError("Action non autorisée. Vous ne pouvez modifier que vos propres recettes.");
              setRecipeData(null);
            } else {
              setRecipeData(data); // Stocke les données pour les passer au formulaire
              console.log("Recette chargée pour modification:", data.nom);
            }
          } else {
            setError("Recette à modifier non trouvée.");
            setRecipeData(null);
          }
        } catch (err) {
          console.error("Erreur lors du chargement de la recette pour modification:", err);
          setError("Impossible de charger les données de la recette pour modification.");
        } finally {
          setIsLoading(false);
        }
      }
      fetchRecipeForEdit();
    }
  }, [id, router.isReady, user, authLoading]);

  // --- Rendu --- 

  // Affiche pendant le chargement (données recette ou état auth)
  if (isLoading || authLoading) {
    return <p className="text-center mt-10">Chargement...</p>;
  }

  // Affiche l'erreur (chargement, autorisation, non trouvé)
  if (error) {
     return (
      <div className="text-center mt-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/mes-recettes" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Retour à Mes Recettes
        </Link>
      </div>
    );
  }

  // Si la recette est chargée et l'utilisateur autorisé, affiche le formulaire
  if (recipeData) {
    return (
      <>
        <Head>
          <title>{`Modifier : ${recipeData.nom} - Cuisineo`}</title>
          <meta name="description" content={`Page de modification pour la recette ${recipeData.nom}.`} />
        </Head>
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-semibold mb-6 text-gray-800">Modifier la recette</h1>
          {/* Passe les données de la recette au formulaire via la prop `recipeToEdit` */}
          <RecipeForm recipeToEdit={recipeData} />
        </div>
      </>
    );
  }

  // Fallback si aucune condition n'est remplie (ne devrait pas arriver)
  return null; 
}

export default ModifyRecipePage; 