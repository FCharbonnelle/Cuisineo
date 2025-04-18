import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';

// Schéma de validation Yup
const schema = yup.object().shape({
  email: yup.string().email("L'email n'est pas valide").required("L'email est requis"),
  password: yup.string().min(6, "Le mot de passe doit contenir au moins 6 caractères").required("Le mot de passe est requis"),
});

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true); // Pour basculer entre connexion et inscription
  const [authError, setAuthError] = useState(null); // Pour afficher les erreurs Firebase
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    setAuthError(null);
    try {
      if (isLogin) {
        await login(data.email, data.password);
        // Rediriger vers l'accueil ou une page protégée après connexion réussie
        router.push('/');
      } else {
        await signup(data.email, data.password);
        // Rediriger vers l'accueil ou une page protégée après inscription réussie
        router.push('/'); // Ou peut-être vers une page de profil à créer
      }
    } catch (error) {
      console.error("Erreur d'authentification:", error);
      // Traduire les codes d'erreur Firebase courants en messages conviviaux
      let message = "Une erreur est survenue.";
      switch (error.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          message = "Email ou mot de passe incorrect.";
          break;
        case 'auth/email-already-in-use':
          message = "Cette adresse email est déjà utilisée.";
          break;
        case 'auth/invalid-email':
          message = "L'adresse email n'est pas valide.";
          break;
        case 'auth/weak-password':
          message = "Le mot de passe est trop faible.";
          break;
        default:
          message = "Erreur lors de la tentative de connexion/inscription.";
      }
      setAuthError(message);
      setLoading(false);
    }
    // setLoading(false); // Déjà fait dans le catch
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white p-8 shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Affichage de l'erreur d'authentification Firebase */}  
        {authError && (
            <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded">{authError}</p>
        )}
          
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Adresse Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className={`border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary`}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="mt-1 text-xs text-red-600" role="alert">{errors.email.message}</p>
          )}
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Mot de passe
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className={`border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full focus:ring-1 focus:ring-primary focus:border-primary`}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password && (
            <p className="mt-1 text-xs text-red-600" role="alert">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary hover:bg-primary-dark text-white rounded-lg py-2 px-4 duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {loading ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (isLogin ? 'Se connecter' : 'S\'inscrire')}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        {isLogin ? 'Pas encore de compte ?' : 'Déjà un compte ?'}{' '}
        <button
          onClick={() => {
             setIsLogin(!isLogin);
             setAuthError(null); // Réinitialiser l'erreur en changeant de mode
          }}
          className="font-medium text-primary hover:text-primary-dark focus:outline-none focus:underline"
        >
          {isLogin ? 'Inscrivez-vous' : 'Connectez-vous'}
        </button>
      </p>
    </div>
  );
}

export default AuthForm; 