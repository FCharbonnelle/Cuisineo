import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Pour une gestion optimisée des images plus tard

function RecipeCard({ recipe }) {
  // Fournir une image placeholder si imageUrl est null ou vide
  const imageUrl = recipe.imageUrl || '/placeholders/placeholder.png'; // Ajuster le chemin si nécessaire

  return (
    <Link href={`/recette/${recipe.id}`} className="block group">
      <div className="bg-white shadow-md rounded-xl overflow-hidden transform transition duration-300 ease-in-out group-hover:scale-105 group-hover:shadow-lg h-full flex flex-col">
        {/* Image de la recette */}
        <div className="relative w-full h-48"> { /* Hauteur fixe pour l'image */}
          <Image
            src={imageUrl}
            alt={recipe.nom}
            layout="fill" // Remplit le conteneur parent
            objectFit="cover" // Recadre l'image pour couvrir l'espace
            className="transition duration-300 ease-in-out group-hover:opacity-90"
            // Pour les placeholders locaux (plus tard configurer pour Firebase)
            unoptimized={imageUrl.startsWith('/')} // Désactiver l'optimisation pour les images locales
          />
        </div>

        {/* Contenu de la carte */}
        <div className="p-4 flex flex-col flex-grow">
          <span className="inline-block bg-primary-light text-primary-dark text-xs font-semibold px-2 py-1 rounded-full mb-2 capitalize">
            {recipe.categorie}
          </span>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 group-hover:text-primary-dark truncate">
            {recipe.nom}
          </h3>
          {/* Optionnel: Afficher un extrait ou les ingrédients */}
          {/* <p className="text-sm text-gray-600 line-clamp-2"> {recipe.ingredients.join(', ')} </p> */}
          <div className="mt-auto pt-2">
             {/* Peut-être ajouter une date ou un bouton plus tard */}
             <p className="text-xs text-gray-500">ID: {recipe.id.substring(0, 8)}...</p>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default RecipeCard; 