import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
// Importer les fonctions Firestore nécessaires
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/client';

// Schéma de validation Yup pour le formulaire
const recipeSchema = yup.object().shape({
  nom: yup.string().required("Le nom de la recette est requis"),
  categorie: yup.string().oneOf(['entrée', 'plat', 'dessert', 'boisson'], "Catégorie invalide").required("La catégorie est requise"),
  // Validation pour un tableau de chaînes (chaque ingrédient doit être une chaîne)
  // On valide la chaîne textarea puis on la splittera
  ingredientsText: yup.string().required("Au moins un ingrédient est requis"), 
  etapes: yup.string().required("Les étapes sont requises"),
  // imageUrl n'est pas requis ici, sera géré séparément (Étape 9)
});

function RecipeForm({ recipeToEdit = null }) { // Accepte une recette pour l'édition
  const { user } = useAuth();
  const router = useRouter();
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const isEditing = !!recipeToEdit; // Vrai si on passe une recette à éditer

  const {
    register,
    handleSubmit,
    control,
    reset, // Pour réinitialiser le formulaire après soumission ou pour l'édition
    formState: { errors },
  } = useForm({
    resolver: yupResolver(recipeSchema),
    // Pré-remplir le formulaire si on est en mode édition
    defaultValues: isEditing ? {
        nom: recipeToEdit.nom,
        categorie: recipeToEdit.categorie,
        ingredientsText: recipeToEdit.ingredients.join('\n'), // Joindre avec retour à la ligne pour textarea
        etapes: recipeToEdit.etapes
    } : {
        nom: '',
        categorie: 'plat', // Valeur par défaut
        ingredientsText: '',
        etapes: ''
    }
  });

  const onSubmit = async (data) => {
     if (!user) {
        setFormError("Vous devez être connecté pour ajouter ou modifier une recette.");
        return;
     }
     
    setLoading(true);
    setFormError(null);
    
    const ingredientsArray = data.ingredientsText.split('\n').map(line => line.trim()).filter(line => line); 
    
    const recipeData = {
        nom: data.nom,
        categorie: data.categorie,
        ingredients: ingredientsArray,
        etapes: data.etapes,
        userId: user.uid,
        // imageUrl sera géré plus tard
    };

    // --- LOGIQUE FIRESTORE --- 
    try {
        if (isEditing) {
            // Mettre à jour le document existant
            const recipeRef = doc(db, 'recettes', recipeToEdit.id);
            await updateDoc(recipeRef, {
                ...recipeData,
                updatedAt: serverTimestamp() // Mettre à jour la date de modification
            });
            console.log("Recette mise à jour avec ID: ", recipeToEdit.id);
            // Rediriger vers la page détail de la recette modifiée
            router.push(`/recette/${recipeToEdit.id}`);
        } else {
            // Ajouter un nouveau document
            const docRef = await addDoc(collection(db, "recettes"), {
                ...recipeData,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log("Recette ajoutée avec ID: ", docRef.id);
            // Optionnel: Rediriger vers la nouvelle recette ou juste réinitialiser/retour accueil
            // router.push(`/recette/${docRef.id}`); 
            reset(); // Réinitialiser le formulaire après ajout réussi
            // Rediriger vers une page de confirmation ou l'accueil ? Pour l'instant accueil.
            router.push('/'); 
        }
    } catch (error) {
        console.error("Erreur lors de l'enregistrement dans Firestore: ", error);
        setFormError("Erreur lors de l'enregistrement de la recette.");
        setLoading(false); // Important: arrêter le loading en cas d'erreur
    }
    // Pas besoin de setLoading(false) ici car la redirection se fait avant
    // --- FIN LOGIQUE FIRESTORE ---
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6 bg-white p-6 shadow rounded-lg">
      {formError && (
        <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded">{formError}</p>
      )}

      {/* Champ Nom */} 
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700 mb-1">
          Nom de la recette
        </label>
        <input
          id="nom"
          type="text"
          {...register('nom')}
          className={`border ${errors.nom ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary`}
          aria-invalid={errors.nom ? "true" : "false"}
        />
        {errors.nom && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.nom.message}</p>
        )}
      </div>

      {/* Champ Catégorie */} 
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

      {/* Champ Ingrédients (Textarea) */} 
      <div>
        <label htmlFor="ingredientsText" className="block text-sm font-medium text-gray-700 mb-1">
          Ingrédients (un par ligne)
        </label>
        <textarea
          id="ingredientsText"
          rows="5"
          {...register('ingredientsText')}
          className={`border ${errors.ingredientsText ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary`}
          aria-invalid={errors.ingredientsText ? "true" : "false"}
          placeholder="Exemple:\n1kg de pommes de terre\n200g de lardons\n1 oignon"
        />
        {errors.ingredientsText && (
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.ingredientsText.message}</p>
        )}
      </div>

      {/* Champ Étapes (Textarea) */} 
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
      
      {/* TODO: Champ Upload Image (sera ajouté à l'étape 9) */} 
      
      {/* Bouton de soumission */} 
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-primary hover:bg-primary-dark text-black font-semibold rounded-lg py-3 px-6 shadow-md hover:shadow-lg duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
           {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (isEditing ? 'Mettre à jour' : 'Ajouter la recette')}
        </button>
      </div>
    </form>
  );
}

export default RecipeForm; 