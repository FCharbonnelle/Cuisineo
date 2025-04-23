import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link'; // Pour un éventuel bouton retour
import { getRecipeById } from '@/services/recipesAPI';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

/**
 * Page dynamique pour afficher les détails d'une recette spécifique.
 * L'ID de la recette est extrait de l'URL (ex: /recette/mon-id-recette).
 * Récupère les données de la recette depuis Firestore et les affiche.
 */
function RecipeDetailPage() {
  const router = useRouter();
  const { id } = router.query; // Récupère l'ID depuis l'URL

  const [recipe, setRecipe] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Vérifie si le router est prêt et si l'ID existe
    if (router.isReady && id) {
      async function fetchRecipe() {
        console.log(`Chargement de la recette ID: ${id}`);
        setIsLoading(true);
        setError(null);
        try {
          const data = await getRecipeById(id);
          if (data) {
            setRecipe(data);
            console.log("Recette chargée:", data.nom);
          } else {
            setRecipe(null); // Recette non trouvée
            console.log("Aucune recette trouvée pour cet ID.");
          }
        } catch (err) {
          console.error("Erreur lors du chargement de la recette:", err);
          setError("Impossible de charger les détails de la recette.");
        } finally {
          setIsLoading(false);
        }
      }
      fetchRecipe();
    }
  }, [id, router.isReady]); // Dépendances: id et router.isReady

  // Affichage pendant le chargement
  if (isLoading) {
    return <p className="text-center mt-10">Chargement de la recette...</p>;
  }

  // Affichage en cas d'erreur (y compris recette non trouvée)
  if (error) {
    return (
      <div className="text-center mt-10">
        <p className="text-red-500 mb-4">{error}</p>
        <Link href="/" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
          <ArrowLeftIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  // Si la recette n'est pas encore chargée (devrait être couvert par isLoading, mais sécurité)
  if (!recipe) {
    return null;
  }

  // Affichage de la recette trouvée
  const imageUrl = recipe.imageUrl || '/placeholders/placeholder.png';

  return (
    <>
      <Head>
        <title>{`${recipe.nom} - Détails de la recette - Cuisineo`}</title>
        <meta name="description" content={`Découvrez la recette détaillée de ${recipe.nom} sur Cuisineo, incluant ingrédients et étapes de préparation.`} />
      </Head>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Bouton Retour */} 
        <Link href="/" 
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6 group">
            <ArrowLeftIcon className="h-5 w-5 mr-2 transition-transform duration-150 ease-in-out group-hover:-translate-x-1" />
            Retour à l'accueil
        </Link>

        {/* Contenu de la recette */} 
        <article className="bg-white p-6 md:p-8 shadow-lg rounded-lg border border-gray-400">
          {/* Image (si disponible) */} 
          {recipe.imageUrl && (
            <div className="relative w-full h-64 md:h-96 mb-6 rounded-lg overflow-hidden">
              <Image
                src={imageUrl} // Utilise la variable imageUrl définie plus haut
                alt={`Image de ${recipe.nom}`}
                layout="fill"
                objectFit="cover"
                className=""
                unoptimized={imageUrl.startsWith('/')} // Désactive optimisation pour placeholders locaux
              />
            </div>
          )}

          {/* Catégorie */} 
          <span className="inline-block bg-orange-100 text-orange-700 text-sm font-semibold px-3 py-1 rounded-full mb-4 capitalize">
            {recipe.categorie}
          </span>

          {/* Titre */} 
          <h1 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">{recipe.nom}</h1>

          {/* Section Ingrédients */} 
          <section className="mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Ingrédients</h2>
            <ul className="list-disc list-inside space-y-2 pl-2 text-gray-700">
              {/* Map sur le tableau des ingrédients */}
              {recipe.ingredients && recipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
              {/* Message si le tableau est vide ou absent */}
              {(!recipe.ingredients || recipe.ingredients.length === 0) && (
                <li className="text-gray-500 italic">Aucun ingrédient listé.</li>
              )}
            </ul>
          </section>

          {/* Section Étapes */} 
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Préparation</h2>
            {/* Affiche les étapes. 
               Utilise `whitespace-pre-line` pour respecter les sauts de ligne 
               entrés dans le textarea lors de la création. */}
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
               {recipe.etapes || <p className="italic text-gray-500">Aucune étape de préparation fournie.</p>}
            </div>
          </section>
        </article>
      </div>
    </>
  );
}

export default RecipeDetailPage; 