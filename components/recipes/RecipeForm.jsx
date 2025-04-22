import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form'; // Hook pour gérer les formulaires facilement
import { yupResolver } from '@hookform/resolvers/yup'; // Pour connecter react-hook-form avec Yup
import * as yup from 'yup'; // Bibliothèque pour la validation de schémas
import { useRouter } from 'next/router'; // Pour la redirection après soumission
import { useAuth } from '@/contexts/AuthContext'; // Pour obtenir l'UID de l'utilisateur connecté
// Fonctions Firestore pour ajouter/mettre à jour des documents
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/client'; // Instance de la base de données Firestore

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
  // Note: Le champ pour l'URL de l'image (imageUrl) n'est pas inclus ici.
  // Il sera géré séparément lors de l'étape d'upload d'image.
});

/**
 * Composant formulaire pour ajouter ou modifier une recette.
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
        etapes: recipeToEdit.etapes
        // Pas d'imageUrl ici
    } : {
        nom: '' /* ou undefined */,
        categorie: 'plat', // Valeur par défaut pour la catégorie
        ingredientsText: '',
        etapes: ''
    }
  });

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
    
    // Transformation des ingrédients: 
    // 1. Sépare le texte du textarea par les retours à la ligne (\n)
    // 2. Supprime les espaces vides au début/fin de chaque ligne (trim)
    // 3. Filtre pour enlever les lignes vides.
    const ingredientsArray = data.ingredientsText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Préparation de l'objet recette à envoyer à Firestore
    const recipeData = {
        nom: data.nom,
        categorie: data.categorie,
        ingredients: ingredientsArray, // Utilise le tableau transformé
        etapes: data.etapes,
        userId: user.uid, // Associe la recette à l'utilisateur connecté
        // imageUrl: sera ajouté plus tard lors de l'étape d'upload
    };

    // --- Interaction avec Firestore --- 
    try {
        // Si on est en mode édition...
        if (isEditing) {
            console.log(`Mise à jour de la recette ID: ${recipeToEdit.id}`);
            // Référence au document existant dans Firestore
            const recipeRef = doc(db, 'recettes', recipeToEdit.id);
            // Appel à `updateDoc` pour mettre à jour les données
            await updateDoc(recipeRef, {
                ...recipeData, // Les nouvelles données du formulaire
                // Met à jour le champ `updatedAt` avec l'heure actuelle du serveur Firestore
                updatedAt: serverTimestamp() 
            });
            console.log("Recette mise à jour avec succès.");
            // Redirige l'utilisateur vers la page détail de la recette modifiée
            router.push(`/recette/${recipeToEdit.id}`);
        } else {
            // Si on est en mode ajout...
            console.log("Ajout d'une nouvelle recette...");
            // Appel à `addDoc` pour ajouter un nouveau document à la collection 'recettes'
            const docRef = await addDoc(collection(db, "recettes"), {
                ...recipeData, // Les données du formulaire
                // Ajoute les champs `createdAt` et `updatedAt` avec l'heure du serveur Firestore
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log("Recette ajoutée avec succès, ID: ", docRef.id);
            
            // Optionnel: réinitialiser le formulaire après l'ajout réussi
            reset(); 
            
            // Rediriger vers la page d'accueil (ou une autre page de confirmation)
            router.push('/'); 
        }
    } catch (error) {
        // En cas d'erreur lors de l'écriture dans Firestore
        console.error("Erreur lors de l'enregistrement dans Firestore: ", error);
        setFormError("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.");
        setLoading(false); // Important : Arrêter le chargement en cas d'erreur pour réactiver le bouton
    }
    // Note: setLoading(false) n'est pas nécessaire ici en cas de succès car la redirection a lieu.
  };

  // --- Rendu JSX du Formulaire --- 
  return (
    // Utilise handleSubmit pour lier la fonction onSubmit à l'événement de soumission du formulaire
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white p-6 shadow rounded-lg">
      
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
      
      {/* --- Section pour l'Upload d'Image (future étape) --- */}
      {/* TODO: Ajouter ici le champ et la logique pour l'upload d'image (Étape 9) */}
      
      {/* --- Bouton de soumission --- */}
      <div className="flex justify-end"> {/* Aligne le bouton à droite */}
        <button
          type="submit" // Type standard pour soumettre un formulaire
          disabled={loading} // Désactive le bouton pendant le chargement
          // Classes Tailwind pour le style (fond, texte, arrondi, ombre, etc.)
          // Inclut des styles pour l'état désactivé (`disabled:...`)
          className="bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg py-3 px-6 shadow-md hover:shadow-lg duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
           {/* Affiche une icône de chargement si `loading` est vrai */}
           {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            // Affiche le texte approprié selon si on est en mode édition ou ajout
            isEditing ? 'Mettre à jour' : 'Ajouter la recette'
          )}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm; 