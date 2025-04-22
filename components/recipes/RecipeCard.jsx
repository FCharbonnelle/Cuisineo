import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Pour une gestion optimisée des images plus tard
// Importer les icônes pour les boutons
import { PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';

/**
 * Affiche une carte représentant une recette.
 * Permet la navigation vers la page détail et affiche conditionnellement
 * des boutons pour modifier ou supprimer si les callbacks correspondants sont fournis.
 * 
 * @param {Object} props - Les propriétés du composant.
 * @param {Object} props.recipe - L'objet recette contenant les données à afficher (id, nom, categorie, imageUrl...).
 * @param {Function} [props.onEdit] - Callback optionnel appelé avec l'ID de la recette lors du clic sur le bouton "Modifier". Si fourni, le bouton s'affiche.
 * @param {Function} [props.onDelete] - Callback optionnel appelé avec l'ID de la recette lors du clic sur le bouton "Supprimer". Si fourni, le bouton s'affiche.
 */
function RecipeCard({ recipe, onEdit, onDelete }) {
  // Utilise l'URL de l'image de la recette ou une image placeholder par défaut.
  const imageUrl = recipe.imageUrl || '/placeholders/placeholder.png';

  // --- Gestionnaires d'événements pour les boutons --- 

  /**
   * Gère le clic sur le bouton "Modifier".
   * Empêche la navigation du lien parent et appelle le callback `onEdit`.
   * @param {React.MouseEvent} e - L'événement de clic.
   */
  const handleEditClick = (e) => {
    e.preventDefault(); // Empêche le comportement par défaut (ex: navigation du lien)
    e.stopPropagation(); // Arrête la propagation de l'événement aux éléments parents (ex: le Link)
    if (onEdit) { // Vérifie si la fonction onEdit a été passée en prop
      onEdit(recipe.id); // Appelle la fonction avec l'ID de la recette
    }
  };

  /**
   * Gère le clic sur le bouton "Supprimer".
   * Empêche la navigation du lien parent et appelle le callback `onDelete`.
   * @param {React.MouseEvent} e - L'événement de clic.
   */
  const handleDeleteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) { // Vérifie si la fonction onDelete a été passée en prop
      onDelete(recipe.id); // Appelle la fonction avec l'ID de la recette
    }
  };

  // --- Rendu JSX --- 
  return (
    // Conteneur principal - Ajout d'une bordure pour meilleure délimitation
    <div className="bg-white shadow-md rounded-xl overflow-hidden flex flex-col h-full group border border-gray-200">
      {/* Image cliquable menant au détail */} 
      <Link href={`/recette/${recipe.id}`} className="block relative w-full h-48">
        {/* Composant Image de Next.js pour l'optimisation */}
        <Image
          src={imageUrl}
          alt={recipe.nom} // Texte alternatif pour l'accessibilité
          layout="fill" // Remplit l'espace du conteneur parent
          objectFit="cover" // Recadre l'image pour couvrir l'espace sans déformer
          className="transition duration-300 ease-in-out group-hover:opacity-90" // Effet visuel au survol
          unoptimized={imageUrl.startsWith('/')} // Désactive l'optimisation Next.js pour les images locales (commençant par /)
        />
      </Link>

      {/* Contenu textuel de la carte */} 
      <div className="p-4 flex flex-col flex-grow"> {/* flex-grow pour que toutes les cartes aient la même hauteur */}
        {/* Badge Catégorie - Style ajusté pour meilleur contraste */}
        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded-full mb-2 capitalize">
          {recipe.categorie}
        </span>
        {/* Titre cliquable menant au détail - Texte plus foncé */}
        <Link href={`/recette/${recipe.id}`} className="block">
            <h3 className="text-lg font-semibold mb-2 text-gray-900 hover:text-primary-dark truncate"> {/* Remplacé text-gray-800 */}
                 {recipe.nom}
            </h3>
        </Link>

        {/* Section inférieure (alignée en bas grâce à mt-auto) */}
        <div className="mt-auto pt-2 flex justify-between items-center">
            {/* Placeholder pour l'alignement (si on cache l'ID) */}
            <div></div> 

            {/* Conteneur pour les boutons d'action */}
            <div className="flex space-x-1">
                {/* Bouton Modifier avec fond orange clair */}
                {onEdit && (
                    <button
                        onClick={handleEditClick}
                        title="Modifier la recette"
                        className="p-1.5 bg-orange-100 border border-orange-200 text-orange-800 rounded-md hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500 transition-colors duration-150 shadow-sm"
                    >
                        <PencilSquareIcon className="h-5 w-5" />
                    </button>
                )}
                {/* Bouton Supprimer avec fond orange clair */}
                {onDelete && (
                    <button
                        onClick={handleDeleteClick}
                        title="Supprimer la recette"
                        className="p-1.5 bg-orange-100 border border-orange-200 text-orange-800 rounded-md hover:bg-red-100 hover:border-red-300 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-red-500 transition-colors duration-150 shadow-sm"
                    >
                        <TrashIcon className="h-5 w-5" />
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
}

export default RecipeCard; 