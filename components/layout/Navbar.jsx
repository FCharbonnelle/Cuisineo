import React from 'react';
import Link from 'next/link'; // Composant pour la navigation côté client dans Next.js
import { useAuth } from '@/contexts/AuthContext'; // Hook pour accéder à l'état d'authentification et à logout
import { useRouter } from 'next/router'; // Hook pour la redirection après déconnexion et obtenir le chemin actuel
// Icônes pour les liens/boutons
import { ArrowLeftOnRectangleIcon, ArrowRightOnRectangleIcon, UserPlusIcon, PencilSquareIcon, BookmarkIcon, HomeIcon } from '@heroicons/react/24/outline';

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
  const currentPath = router.pathname; // Récupère le chemin actuel

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

  // Helper - Style bouton avec fond orange clair
  const getLinkClassName = (path) => {
    // Base: padding, arrondi, bg orange clair, bordure orange clair, texte orange foncé
    const baseClasses = "flex items-center px-3 py-1 rounded-md bg-orange-100 border border-orange-200 text-orange-800 transition-colors duration-150 shadow-sm";
    // Actif: bg orange primaire, bordure primaire, texte NOIR (nouvelle demande)
    const activeClasses = currentPath === path 
      ? "bg-primary border-primary text-black font-medium"
      : "hover:bg-orange-200 hover:border-orange-400 hover:text-orange-900";
    return `${baseClasses} ${activeClasses}`;
  };

  // Classes Logout - Fond orange clair, hover rouge
  const logoutButtonClasses = "flex items-center px-3 py-1 rounded-md bg-orange-100 border border-orange-200 text-orange-800 hover:bg-red-100 hover:border-red-300 hover:text-red-700 transition-colors duration-150 shadow-sm";

  return (
    // Header plus large (h-20) et style Navbar
    <nav className="bg-white border-b border-gray-200 h-20 flex items-center sticky top-0 z-10 shadow-sm">
      <div className="container mx-auto px-4 flex items-center">
        
        <Link href="/" className="text-2xl font-semibold text-gray-900 hover:text-primary transition-colors mr-auto">
          🍳 Cuisineo
        </Link>
        
        {user ? (
          <>
            <div className="flex-grow text-center px-4">
              <span className="text-lg text-gray-600 hidden md:inline">
                Bonjour, {user.email}
              </span>
            </div>

            <div className="flex items-center space-x-3 ml-auto">
              <Link href="/" className={getLinkClassName('/')} title="Accueil">
                 <HomeIcon className="h-5 w-5 mr-1" />
                 <span className="hidden sm:inline">Accueil</span>
              </Link>
              <Link href="/mes-recettes" className={getLinkClassName('/mes-recettes')} title="Mes Recettes">
                <BookmarkIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Mes Recettes</span>
              </Link>
              <Link href="/ajouter" className={getLinkClassName('/ajouter')} title="Ajouter une recette">
                <PencilSquareIcon className="h-5 w-5 mr-1" />
                 <span className="hidden sm:inline">Ajouter</span>
             </Link>
              <button 
                onClick={handleLogout} 
                className={logoutButtonClasses}
                title="Déconnexion"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </div>
          </>
        ) : (
          <div className="ml-auto">
            <Link href="/connexion" className={getLinkClassName('/connexion')}>
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
              Connexion
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar; 