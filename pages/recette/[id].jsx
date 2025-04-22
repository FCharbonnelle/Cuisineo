import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link'; // Pour un éventuel bouton retour
import { getRecipeById } from '../../services/recipesAPI';
import { ArrowLeftIcon } from '@heroicons/react/24/solid'; // Icône retour

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
    // `router.query` peut être vide au premier rendu, donc on vérifie si `id` existe.
    // On vérifie aussi que `id` n'est pas un tableau (peut arriver dans certains cas avec Next.js)
    if (id && typeof id === 'string') {
      console.log(`Tentative de chargement de la recette avec ID: ${id}`);
      // Fonction asynchrone pour charger les données
      async function loadRecipe() {
        setIsLoading(true); // Début du chargement
        setError(null);     // Réinitialiser l'erreur
        try {
          // Appel à la fonction API pour récupérer la recette par son ID
          const data = await getRecipeById(id);
          // Si la fonction retourne des données (la recette existe)...
          if (data) {
            setRecipe(data); // ...mettre à jour l'état `recipe`
          } else {
            // Si la fonction retourne null (recette non trouvée dans Firestore)...
            setRecipe(null); // ...s'assurer que l'état `recipe` est null
            setError('Recette non trouvée.'); // ...et définir un message d'erreur spécifique
          }
        } catch (err) {
          // En cas d'erreur lors de l'appel API (ex: problème réseau, erreur Firestore)
          console.error("Erreur lors du chargement de la recette:", err);
          setError("Impossible de charger les détails de la recette. Veuillez réessayer.");
          setRecipe(null);
        } finally {
          // Dans tous les cas (succès ou erreur), arrêter le chargement
          setIsLoading(false);
        }
      }
      // Exécuter la fonction de chargement
      loadRecipe();
    }
  }, [id]); // Ré-exécute l'effet si l'ID change

  // Affichage pendant le chargement
  if (isLoading) {
    return <p className="text-center text-gray-500 mt-10">Chargement de la recette...</p>;
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
        <title>{recipe.nom} - Cuisineo</title>
        <meta name="description" content={`Découvrez la recette de ${recipe.nom} : ${recipe.ingredients.slice(0, 3).join(', ')}...`} />
      </Head>

      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Bouton Retour */}
        <div className="p-4 border-b">
            <Link href="/" className="inline-flex items-center text-sm text-primary hover:text-primary-dark font-medium">
                <ArrowLeftIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                Retour à la liste
            </Link>
        </div>

        {/* Image */}
        <div className="relative w-full h-64 md:h-96"> {/* Hauteur plus grande pour détail */}
            <Image
                src={imageUrl}
                alt={`Image de ${recipe.nom}`}
                layout="fill"
                objectFit="cover"
                unoptimized={imageUrl.startsWith('/')} // Pour les images locales
                priority // Indique à Next.js de charger cette image en priorité (car c'est l'élément visuel principal)
            />
        </div>

        <div className="p-6">
            {/* Catégorie et Nom */}
            <span className="inline-block bg-primary-light text-primary-dark text-xs font-semibold px-2 py-1 rounded-full mb-2 capitalize">
                {recipe.categorie}
            </span>
            <h1 className="text-3xl font-bold mb-4 text-gray-900">{recipe.nom}</h1>

            {/* Sections Ingrédients et Étapes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                {/* Ingrédients */}
                <div className="md:col-span-1">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">Ingrédients</h2>
                    <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient}</li>
                        ))}
                    </ul>
                </div>

                {/* Étapes */}
                <div className="md:col-span-2">
                    <h2 className="text-xl font-semibold mb-3 text-gray-800 border-b pb-2">Préparation</h2>
                    {/* Affichage simple pour l'instant. Pourrait utiliser react-markdown plus tard */}
                    <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-line">
                        {recipe.etapes}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </>
  );
}

export default RecipeDetailPage; 