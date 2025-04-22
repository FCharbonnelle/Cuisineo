import React from 'react';
import Link from 'next/link'; // Composant pour la navigation côté client dans Next.js
import { useAuth } from '@/contexts/AuthContext'; // Hook pour accéder à l'état d'authentification et à logout
import { useRouter } from 'next/router'; // Hook pour la redirection après déconnexion
// Icônes pour les liens/boutons
import { ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, UserPlusIcon, PencilSquareIcon, BookmarkIcon } from '@heroicons/react/24/outline';

/**
 * Composant de la barre de navigation principale.
 * Affiche le titre/logo et des liens de navigation différents selon
 * que l'utilisateur est connecté ou non.
 */
function Navbar() {
  // Récupère l'objet utilisateur et la fonction logout depuis le contexte d'authentification
  const { user, logout } = useAuth();
  // Récupère l'objet router pour la redirection
  const router = useRouter();

  /**
   * Gère la déconnexion de l'utilisateur.
   * Appelle la fonction `logout` du contexte et redirige vers l'accueil.
   */
  const handleLogout = async () => {
    try {
      await logout(); // Appelle la fonction de déconnexion Firebase
      console.log("Utilisateur déconnecté avec succès.");
      router.push('/'); // Redirige vers la page d'accueil
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
      // Afficher une notification d'erreur à l'utilisateur serait une bonne amélioration
    }
  };

  return (
    // Balise <nav> sémantique pour la navigation
    // Classes Tailwind pour le style : fond blanc, bordure basse, hauteur fixe,
    // flexbox pour aligner les éléments, sticky pour rester en haut, z-index pour être au-dessus
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center sticky top-0 z-10 shadow-sm">
      {/* Conteneur pour limiter la largeur et centrer le contenu, avec padding horizontal */}
      <div className="container mx-auto px-4 flex justify-between items-center">
        
        {/* Logo/Titre cliquable ramenant à l'accueil */}
        <Link href="/" className="text-2xl font-semibold text-primary-dark hover:text-primary transition-colors">
          🍳 Cuisineo
        </Link>
        
        {/* Section des liens de navigation (à droite) */}
        <div>
          {/* Affichage conditionnel basé sur l'état de connexion (`user`) */}
          {user ? (
            // --- Si l'utilisateur EST connecté ---
            <div className="flex items-center space-x-4">
              {/* Email de l'utilisateur (pourrait être remplacé par un nom d'utilisateur plus tard) */}
              <span className="text-sm text-gray-600 hidden md:inline">Bonjour, {user.email}</span>
              
              {/* Lien vers "Mes Recettes" */}
              <Link href="/mes-recettes" className="flex items-center text-gray-700 hover:text-primary transition-colors" title="Mes Recettes">
                <BookmarkIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Mes Recettes</span>
              </Link>
              
              {/* Lien vers "Ajouter" */}
              <Link href="/ajouter" className="flex items-center text-gray-700 hover:text-primary transition-colors" title="Ajouter une recette">
                <PencilSquareIcon className="h-5 w-5 mr-1" />
                 <span className="hidden sm:inline">Ajouter</span>
             </Link>
              
              {/* Bouton de Déconnexion */}
              <button 
                onClick={handleLogout} 
                className="flex items-center text-gray-700 hover:text-red-600 transition-colors" 
                title="Déconnexion"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          ) : (
            // --- Si l'utilisateur N'EST PAS connecté ---
            <Link href="/connexion" className="flex items-center text-gray-700 hover:text-primary transition-colors">
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
              Connexion
              {/* <UserPlusIcon className="h-5 w-5 mr-1" /> 
                  Inscription // Alternative si on voulait un lien direct inscription */}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 