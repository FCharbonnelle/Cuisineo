import React from 'react';
// Importe le composant Navbar
import Navbar from './Navbar';

/**
 * Composant Layout (Mise en page).
 * Fournit une structure cohérente à toutes les pages de l'application.
 * Il inclut la barre de navigation (Navbar) en haut et affiche le contenu
 * spécifique de chaque page (passé via la prop `children`).
 * Il peut également inclure un pied de page (Footer) si nécessaire.
 * 
 * @param {Object} props - Les propriétés du composant.
 * @param {React.ReactNode} props.children - Le contenu de la page actuelle à afficher à l'intérieur du Layout.
 */
function Layout({ children }) {
  return (
    // Conteneur principal qui prend au moins toute la hauteur de l'écran (`min-h-screen`)
    // Utilise Flexbox en colonne (`flex flex-col`) pour organiser Navbar, main, et potentiellement Footer.
    <div className="min-h-screen flex flex-col bg-gray-50"> {/* Couleur de fond appliquée ici aussi */}
      
      {/* Affiche la barre de navigation en haut */}
      <Navbar />
      
      {/* Balise sémantique <main> pour le contenu principal de la page */}
      {/* `flex-grow` permet à cette section de prendre tout l'espace vertical restant, 
          poussant le Footer (s'il y en avait un) en bas de l'écran. */}
      {/* `container mx-auto` centre le contenu horizontalement (avec une largeur max définie par Tailwind).
          `p-4 md:p-6` ajoute du padding autour du contenu (plus grand sur écrans moyens et plus). */}
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {/* Affiche le contenu spécifique de la page actuelle (passé en tant qu'enfant) */}
        {children}
      </main>
      
      {/* --- Emplacement pour un futur Footer --- */}
      {/* 
      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600 border-t border-gray-200">
        © {new Date().getFullYear()} Cuisineo - Tous droits réservés.
      </footer> 
      */}
    </div>
  );
}

export default Layout; 