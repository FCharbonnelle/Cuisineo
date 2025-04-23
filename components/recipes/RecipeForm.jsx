import React, { useState, useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form'; // Hook pour gérer les formulaires facilement et useWatch pour l'aperçu
import { yupResolver } from '@hookform/resolvers/yup'; // Pour connecter react-hook-form avec Yup
import * as yup from 'yup'; // Bibliothèque pour la validation de schémas
import { useRouter } from 'next/router'; // Pour la redirection après soumission
import { useAuth } from '@/contexts/AuthContext'; // Pour obtenir l'UID de l'utilisateur connecté
// Fonctions Firestore pour ajouter/mettre à jour des documents
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/client'; // Instance de la base de données Firestore
// Suppression des imports Firebase Storage
// import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
// import { storage } from '@/firebase/client'; 

// --- NOTE IMPORTANTE CONCERNANT LES IMAGES --- 
// Initialement, l'upload direct d'images vers Firebase Storage avait été implémenté.
// Cependant, en raison des limitations du plan gratuit "Spark" de Firebase,
// la configuration CORS nécessaire pour autoriser les uploads depuis le navigateur
// (http://localhost:3000) vers le bucket Storage n'est pas possible sans passer
// au plan payant ou utiliser des Cloud Functions comme intermédiaire.
// 
// **Contournement choisi pour ce projet :**
// Pour permettre d'avoir des images associées aux recettes sans bloquer le développement
// et pour avoir un rendu visuel satisfaisant pour la présentation (jury, rapport),
// le formulaire a été adapté pour accepter une URL directe vers une image hébergée
// ailleurs (ex: sites d'images libres de droits comme Unsplash, Pexels).
// 
// **Implications :**
// - L'utilisateur doit trouver et copier/coller l'URL de l'image.
// - La fonctionnalité d'upload direct pourra être réintégrée si le projet évolue
//   vers un plan payant ou si une solution via Cloud Functions est développée.
// - La configuration des domaines d'images externes est nécessaire dans `next.config.mjs`.
// 
// Cette difficulté rencontrée et le contournement mis en place peuvent être
// mentionnés lors de la présentation du projet.
// --- FIN NOTE --- 

// --- Schéma de validation avec Yup ---
// Définit les règles pour chaque champ du formulaire.
const recipeSchema = yup.object().shape({
  // Champ 'nom': doit être une chaîne de caractères et est requis.
  nom: yup.string().required("Le nom de la recette est obligatoire."),
  // Champ 'categorie': doit être une chaîne parmi les valeurs spécifiées, et est requis.
  categorie: yup.string().oneOf(['entrée', 'plat', 'dessert', 'boisson'], "Catégorie non valide.").required("La catégorie est obligatoire."),
  // Champ 'ingredientsText': on valide le contenu du textarea comme une chaîne requise.
  // La transformation en tableau se fera avant l'envoi à Firestore.
  ingredientsText: yup.string().required("La liste des ingrédients est obligatoire (un par ligne)."), 
  // Champ 'etapes': doit être une chaîne et est requis.
  etapes: yup.string().required("Les étapes de préparation sont obligatoires."),
  // Ajout du champ imageUrl: doit être une URL valide, mais n'est pas obligatoire.
  imageUrl: yup.string().url("Veuillez entrer une URL valide (ex: https://...).").nullable().transform(value => value || null), // Transforme chaîne vide en null
});

// --- Configuration pour l'upload d'image ---
// const MAX_IMAGE_SIZE_MB = 5;
// const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

/**
 * Composant formulaire pour ajouter ou modifier une recette, utilisant une URL pour l'image.
 * Utilise react-hook-form pour la gestion de l'état du formulaire et la soumission,
 * et Yup pour la validation des données.
 * 
 * @param {Object} props - Les propriétés du composant.
 * @param {Object} [props.recipeToEdit=null] - Si fourni, le formulaire passe en mode édition et pré-remplit les champs avec les données de cette recette.
 */
function RecipeForm({ recipeToEdit = null }) {
  // --- Hooks et États ---
  const { user } = useAuth(); // Récupère l'utilisateur connecté depuis le contexte
  const router = useRouter(); // Hook pour la navigation/redirection
  // État pour stocker les erreurs générales du formulaire (ex: erreur Firestore)
  const [formError, setFormError] = useState(null);
  // État pour indiquer si le formulaire est en cours de soumission (pour désactiver le bouton)
  const [loading, setLoading] = useState(false);
  // Suppression des états liés à l'upload
  // const [uploadProgress, setUploadProgress] = useState(0);
  // const [imageFile, setImageFile] = useState(null);
  // const [imagePreview, setImagePreview] = useState(null); 
  // const [imageError, setImageError] = useState(null); 

  // Détermine si le formulaire est en mode édition en vérifiant si recipeToEdit a été passé
  const isEditing = !!recipeToEdit;

  // --- Initialisation de react-hook-form ---
  const {
    register,       // Fonction pour enregistrer un champ dans le formulaire
    handleSubmit,   // Fonction pour envelopper notre logique de soumission
    control,        // Nécessaire pour certains types de champs contrôlés (non utilisé ici pour l'instant)
    reset,          // Fonction pour réinitialiser les champs du formulaire
    formState: { errors }, // Objet contenant les erreurs de validation par champ
  } = useForm({
    // Utilise le résolveur Yup pour appliquer notre schéma de validation
    resolver: yupResolver(recipeSchema),
    // Définit les valeurs par défaut des champs.
    // Si on est en mode édition, utilise les valeurs de `recipeToEdit`.
    // Sinon, utilise des valeurs vides ou par défaut.
    defaultValues: isEditing ? {
        nom: recipeToEdit.nom,
        categorie: recipeToEdit.categorie,
        // Les ingrédients (tableau) sont joints avec \n pour remplir le textarea.
        ingredientsText: recipeToEdit.ingredients.join('\n'), 
        etapes: recipeToEdit.etapes,
        imageUrl: recipeToEdit.imageUrl || '', // Pré-remplir avec l'URL existante
    } : {
        nom: '', /* ou undefined */
        categorie: 'plat', // Valeur par défaut pour la catégorie
        ingredientsText: '',
        etapes: '',
        imageUrl: '', // Champ URL vide par défaut
    }
  });

  // --- Hook pour surveiller la valeur du champ imageUrl en temps réel --- 
  const imageUrlValue = useWatch({ control, name: 'imageUrl' });

  // --- Logique de Soumission --- 
  /**
   * Fonction appelée lorsque le formulaire est soumis et que la validation Yup a réussi.
   * Gère l'ajout ou la mise à jour de la recette dans Firestore.
   * @param {Object} data - Les données validées du formulaire.
   */
  const onSubmit = async (data) => {
     // Vérification cruciale : l'utilisateur doit être connecté.
     if (!user) {
        setFormError("Action non autorisée. Veuillez vous connecter.");
        return; // Arrête l'exécution de la fonction
     }
     
    setLoading(true); // Début du chargement (désactive le bouton)
    setFormError(null); // Réinitialise les erreurs précédentes
    
    try {
      // Préparation des données pour Firestore (inclut imageUrl du formulaire)
      const ingredientsArray = data.ingredientsText.split('\n').map(line => line.trim()).filter(line => line);
      const recipeData = {
        nom: data.nom,
        categorie: data.categorie,
        ingredients: ingredientsArray,
        etapes: data.etapes,
        userId: user.uid,
        // Utilise directement l'URL validée depuis les données du formulaire.
        // Si l'URL est vide ou invalide et transformée en null par Yup, ce sera null.
        imageUrl: data.imageUrl, 
      };

      // --- 3. Écriture/Mise à jour dans Firestore ---
      if (isEditing) {
        console.log(`Mise à jour Firestore pour ID: ${recipeToEdit.id}`);
        const recipeRef = doc(db, 'recettes', recipeToEdit.id);
        await updateDoc(recipeRef, {
          ...recipeData,
          updatedAt: serverTimestamp()
        });
        console.log("Mise à jour Firestore réussie.");
        router.push(`/recette/${recipeToEdit.id}`);
      } else {
        console.log("Ajout Firestore...");
        const docRef = await addDoc(collection(db, "recettes"), {
          ...recipeData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log("Ajout Firestore réussi, ID:", docRef.id);
        reset(); // Réinitialise le formulaire (y compris le champ URL)
        router.push('/'); 
      }

    } catch (error) {
      // Gère les erreurs (soit de l'upload, soit de Firestore)
      console.error("Erreur lors de la soumission du formulaire:", error);
      // Affiche l'erreur spécifique à l'image si elle existe, sinon une erreur générale
      setFormError(error.message || "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
      setLoading(false); // Important: arrêter le chargement
    }
    // setLoading(false) géré dans le catch et implicitement par la redirection en cas de succès
  };

  // --- Rendu JSX du Formulaire --- 
  return (
    // Utilise handleSubmit pour lier la fonction onSubmit à l'événement de soumission du formulaire
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white p-6 shadow rounded-lg border border-gray-400">
      
      {/* Affichage de l'erreur générale du formulaire (si elle existe) */}
      {formError && (
        <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded">{formError}</p>
      )}

      {/* --- Champ Nom --- */}
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
          Nom de la recette
        </label>
        {/* Utilise register pour lier l'input à react-hook-form et à la validation */}
        <input
          id="nom"
          type="text"
          {...register('nom')} 
          // Applique des classes CSS conditionnelles si le champ est en erreur
          className={`border ${errors.nom ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary`}
          aria-invalid={errors.nom ? "true" : "false"} // Pour l'accessibilité
        />
        {/* Affiche le message d'erreur spécifique à ce champ (s'il existe) */}
        {errors.nom && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.nom.message}</p>
        )}
      </div>

      {/* --- Champ Catégorie (Select) --- */}
      <div>
        <label htmlFor="categorie" className="block text-sm font-medium text-gray-700 mb-1">
          Catégorie
        </label>
        <select
          id="categorie"
          {...register('categorie')}
          className={`border ${errors.categorie ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary bg-white`}
          aria-invalid={errors.categorie ? "true" : "false"}
        >
          <option value="entrée">Entrée</option>
          <option value="plat">Plat</option>
          <option value="dessert">Dessert</option>
          <option value="boisson">Boisson</option>
        </select>
        {errors.categorie && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.categorie.message}</p>
        )}
      </div>

      {/* --- Champ Ingrédients (Textarea) --- */}
      <div>
        <label htmlFor="ingredientsText" className="block text-sm font-medium text-gray-700 mb-1">
          Ingrédients (un par ligne)
        </label>
        <textarea
          id="ingredientsText"
          rows="5" // Nombre de lignes visibles par défaut
          {...register('ingredientsText')}
          className={`border ${errors.ingredientsText ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary`}
          aria-invalid={errors.ingredientsText ? "true" : "false"}
          placeholder="Exemple:\n1kg de pommes de terre\n200g de lardons\n1 oignon" // Texte d'aide dans le champ
        />
        {errors.ingredientsText && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.ingredientsText.message}</p>
        )}
      </div>

      {/* --- Champ Étapes (Textarea) --- */}
      <div>
        <label htmlFor="etapes" className="block text-sm font-medium text-gray-700 mb-1">
          Étapes de préparation
        </label>
        <textarea
          id="etapes"
          rows="8"
          {...register('etapes')}
          className={`border ${errors.etapes ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary`}
          placeholder="Décrivez les étapes de préparation ici..."
        />
        {errors.etapes && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.etapes.message}</p>
        )}
      </div>
      
      {/* --- Champ URL Image --- */}
      <div>
        <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
          URL de l'image (Optionnel)
        </label>
        <input 
          type="url" // Type sémantique pour URL
          id="imageUrl"
          {...register('imageUrl')} // Enregistre le champ
          className={`border ${errors.imageUrl ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary`}
          placeholder="https://exemple.com/image.jpg" // Placeholder pour guider l'utilisateur
          aria-invalid={errors.imageUrl ? "true" : "false"}
        />
        {/* Affichage de l'erreur de validation pour l'URL */}
        {errors.imageUrl && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.imageUrl.message}</p>
        )}
        
        {/* Affichage de l'aperçu basé sur la valeur actuelle de l'URL */}
        {/* On utilise imageUrlValue (de useWatch) pour l'aperçu en temps réel */}
        {imageUrlValue && !errors.imageUrl && ( // Affiche seulement si une URL valide est présente
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-1">Aperçu :</p>
            {/* eslint-disable-next-line @next/next/no-img-element */} 
            <img 
              src={imageUrlValue} 
              alt="Aperçu de l'image depuis l'URL fournie" 
              className="max-w-xs max-h-48 object-cover rounded-lg shadow"
              // Ajout d'un gestionnaire d'erreur simple pour l'image elle-même
              onError={(e) => { e.target.style.display = 'none'; /* Cache l'image si elle ne charge pas */ }}
            />
          </div>
        )}
      </div>
      
      {/* --- Bouton de soumission --- */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          // Style du bouton: Fond primaire, hover plus foncé.
          // Suppression de la couleur de texte conditionnelle, application de text-black toujours.
          className={`bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg py-3 px-6 shadow-md hover:shadow-lg duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center border border-primary-dark`
            // ${isEditing ? 'text-black' : 'text-white'} // Ancienne ligne conditionnelle supprimée
          }
        >
           {loading ? (
            <>
              {/* Icône de chargement: couleur toujours noire */}
              <svg className={`animate-spin -ml-1 mr-3 h-5 w-5 text-black`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {/* Texte du bouton pendant le chargement */}
              {isEditing ? 'Mise à jour...' : 'Ajout...'}
            </>
          ) : (
            // Texte du bouton état normal
            isEditing ? 'Mettre à jour' : 'Ajouter la recette'
          )}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm; 