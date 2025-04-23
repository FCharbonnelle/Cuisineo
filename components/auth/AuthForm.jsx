import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

// --- Schéma de validation Yup ---
// Définit les règles pour les champs 'email' et 'password'.
const schema = yup.object().shape({
  // Champ 'email': doit être une chaîne, un email valide, et est requis.
  email: yup.string().email("L'adresse email fournie n'est pas valide.").required("L'adresse email est obligatoire."),
  // Champ 'password': doit être une chaîne, avoir au moins 6 caractères, et est requis.
  password: yup.string().min(6, "Le mot de passe doit comporter au moins 6 caractères.").required("Le mot de passe est obligatoire."),
});

/**
 * Composant formulaire réutilisable pour la connexion et l'inscription.
 * Gère l'état du formulaire, la validation, l'appel aux fonctions d'authentification Firebase,
 * l'affichage des erreurs et la redirection.
 */
function AuthForm() {
  // --- États du composant ---
  // isLogin: booléen pour savoir si on est en mode 'Connexion' (true) ou 'Inscription' (false).
  const [isLogin, setIsLogin] = useState(true); 
  // authError: stocke les messages d'erreur provenant de Firebase Auth pour les afficher à l'utilisateur.
  const [authError, setAuthError] = useState(null); 
  // loading: booléen pour indiquer si une opération d'authentification est en cours.
  const [loading, setLoading] = useState(false);
  
  // --- Hooks --- 
  // Récupère les fonctions signup et login depuis le contexte d'authentification.
  const { signup, login } = useAuth(); 
  // Hook Next.js pour gérer la navigation.
  const router = useRouter(); 

  // --- Initialisation de react-hook-form ---
  const {
    register,        // Fonction pour lier un input au formulaire.
    handleSubmit,    // Fonction qui enveloppe notre `onSubmit`, s'assure que la validation passe avant.
    formState: { errors }, // Objet contenant les erreurs de validation de Yup pour chaque champ.
  } = useForm({
    resolver: yupResolver(schema), // Applique notre schéma de validation Yup.
    // mode: 'onChange' // Optionnel: Validerait les champs à chaque changement (peut être verbeux).
  });

  // --- Logique de Soumission --- 
  /**
   * Fonction exécutée lors de la soumission du formulaire (après validation Yup).
   * Appelle la fonction `login` ou `signup` du contexte d'authentification.
   * Gère les erreurs Firebase et la redirection.
   * @param {Object} data - Les données validées du formulaire { email, password }.
   */
  const onSubmit = async (data) => {
    setLoading(true);   // Commence le chargement (désactive le bouton)
    setAuthError(null); // Réinitialise les erreurs précédentes
    
    try {
      // Si on est en mode connexion...
      if (isLogin) {
        console.log("Tentative de connexion...");
        // Appelle la fonction `login` du contexte avec email et mot de passe.
        await login(data.email, data.password);
        console.log("Connexion réussie !");
        // Redirige vers la page d'accueil après succès.
        router.push('/'); 
      } else {
        // Si on est en mode inscription...
        console.log("Tentative d'inscription...");
        // Appelle la fonction `signup` du contexte.
        await signup(data.email, data.password);
        console.log("Inscription réussie !");
        // Redirige aussi vers l'accueil après inscription.
        router.push('/'); 
      }
      // Note: La redirection se fait avant d'arrêter le chargement, donc pas besoin de setLoading(false) ici.
      
    } catch (error) {
      // Si une erreur est retournée par les fonctions `login` ou `signup` (erreur Firebase)
      console.error("Erreur d'authentification Firebase:", error.code, error.message);
      
      // Traduit les codes d'erreur Firebase courants en messages plus clairs pour l'utilisateur.
      let friendlyMessage = "Une erreur est survenue lors de la tentative d'authentification.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          friendlyMessage = "Adresse email ou mot de passe incorrect.";
          break;
        case 'auth/email-already-in-use':
          friendlyMessage = "Cette adresse email est déjà associée à un compte.";
          break;
        case 'auth/invalid-email':
          friendlyMessage = "Le format de l'adresse email n'est pas valide.";
          break;
        case 'auth/weak-password':
          friendlyMessage = "Le mot de passe choisi est trop faible (minimum 6 caractères).";
          break;
        // Ajouter d'autres cas si nécessaire
      }
      // Met à jour l'état `authError` pour afficher le message dans le formulaire.
      setAuthError(friendlyMessage);
      // Important: Arrêter le chargement pour réactiver le bouton.
      setLoading(false); 
    }
  };

  // --- Rendu JSX du Formulaire --- 
  return (
    // Conteneur principal du formulaire avec styles Tailwind
    <div className="max-w-md mx-auto mt-10 bg-white p-8 shadow-lg rounded-lg border border-gray-400">
      {/* Titre dynamique (Connexion ou Inscription) */}
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h2>
      
      {/* Le formulaire lui-même, lié à handleSubmit */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        
        {/* Affichage conditionnel de l'erreur d'authentification Firebase */}
        {authError && (
            <p className="mb-4 text-center text-sm text-red-600 bg-red-100 p-3 rounded-md">{authError}</p>
        )}
          
        {/* --- Champ Email --- */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse Email
          </label>
          <input
            id="email"
            type="email" // Type sémantique HTML pour l'email
            autoComplete="email" // Aide au remplissage automatique du navigateur
            {...register('email')} // Enregistre ce champ auprès de react-hook-form
            // Style conditionnel en cas d'erreur de validation
            className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary shadow-sm`}
            aria-invalid={errors.email ? "true" : "false"} // Accessibilité
          />
          {/* Affiche le message d'erreur de validation pour l'email (si présent) */}
          {errors.email && (
            <p className="mt-1 text-xs text-red-600" role="alert">{errors.email.message}</p>
          )}
        </div>

        {/* --- Champ Mot de passe --- */}
        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password" // Type sémantique pour masquer le mot de passe
            autoComplete={isLogin ? "current-password" : "new-password"} // Aide au remplissage automatique
            {...register('password')} // Enregistre le champ
            className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary shadow-sm`}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {/* Affiche le message d'erreur de validation pour le mot de passe */}
          {errors.password && (
            <p className="mt-1 text-xs text-red-600" role="alert">{errors.password.message}</p>
          )}
          {/* Optionnel: Ajouter un lien "Mot de passe oublié ?" ici */}
        </div>

        {/* --- Bouton de soumission --- */}
        <button
          type="submit"
          disabled={loading} // Désactivé pendant le chargement
          // Style: fond primary, texte NOIR pour visibilité max
          className="w-full bg-primary hover:bg-primary-dark text-black rounded-lg py-2.5 px-4 duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center font-semibold shadow-sm border border-primary-dark" // Changé text-white, ajouté bordure
        >
          {/* Affiche une icône de chargement ou le texte approprié */}
          {loading ? (
            // Icône de chargement en noir
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (isLogin ? 'Se connecter' : 'S\'inscrire')}
        </button>
      </form>

      {/* --- Lien pour basculer entre Connexion et Inscription --- */}
      <p className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        {/* Bouton de bascule stylisé avec fond orange clair */}
        <button
          type="button"
          onClick={() => {
             setIsLogin(!isLogin);
             setAuthError(null);
          }}
          // Style bouton: bg orange clair, bordure, texte, hover...
          className="inline-block px-3 py-1 rounded-md bg-orange-100 border border-orange-200 text-orange-800 hover:bg-orange-200 hover:border-orange-400 hover:text-orange-900 focus:outline-none focus:ring-1 focus:ring-orange-300 transition-colors duration-150 shadow-sm ml-1"
        >
          {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
        </button>
      </p>
    </div>
  );
}

export default AuthForm; 