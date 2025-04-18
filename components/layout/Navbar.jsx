import React from 'react';
import Link from 'next/link';

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 h-16 flex items-center sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-primary-dark hover:text-primary">
          🍳 Cuisineo
        </Link>
        {/* Liens de navigation (à ajouter plus tard) */}
        <div>
          {/* <Link href="/ajouter" className="ml-4 hover:text-primary">Ajouter</Link>
          <Link href="/mes-recettes" className="ml-4 hover:text-primary">Mes Recettes</Link>
          <Link href="/connexion" className="ml-4 hover:text-primary">Connexion</Link> */}
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 