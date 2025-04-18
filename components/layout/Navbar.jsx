import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-primary-dark hover:text-primary">
          🍳 Cuisineo
        </Link>

        <div className="flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm text-gray-600 hidden sm:inline">
                Bonjour, {user.email}
              </span>
              <Link href="/mes-recettes" className="text-sm hover:text-primary font-medium">
                Mes Recettes
              </Link>
              <Link href="/ajouter" className="text-sm hover:text-primary font-medium">
                Ajouter
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center text-sm text-gray-600 hover:text-primary font-medium"
                title="Se déconnecter"
              >
                <ArrowRightOnRectangleIcon className="h-5 w-5 mr-1" />
                <span className="hidden sm:inline">Déconnexion</span>
              </button>
            </>
          ) : (
            <Link href="/connexion" className="flex items-center text-sm hover:text-primary font-medium">
               <UserCircleIcon className="h-5 w-5 mr-1" />
               Connexion
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 