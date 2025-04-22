// Importe les styles globaux de l'application (ex: imports Tailwind, polices)
import "@/styles/globals.css";
// Hook `useEffect` de React pour gérer les effets de bord (actions après le rendu)
import { useEffect } from 'react';
// Fonction utilitaire pour initialiser le localStorage avec des recettes de démo
import { seedIfNeeded } from '@/scripts/seedLocalRecipes';
// Composant Layout qui fournit la structure de page (Navbar, etc.)
import Layout from '@/components/layout/Layout';
// Provider du contexte d'authentification pour rendre l'état `user` accessible partout
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Composant racine de l'application Next.js (`_app.jsx`).
 * Ce composant est le parent de toutes les pages de l'application.
 * Il est utilisé pour initialiser des éléments globaux comme :
 * - Les styles globaux
 * - Les fournisseurs de contexte (Context Providers) comme AuthProvider
 * - La mise en page globale (Layout)
 * - Lancer des scripts d'initialisation (comme le seed localStorage)
 * 
 * @param {Object} props - Les propriétés passées par Next.js.
 * @param {React.ComponentType} props.Component - Le composant de la page actuellement affichée.
 * @param {Object} props.pageProps - Les propriétés initiales pré-chargées pour la page (via getServerSideProps ou getStaticProps, non utilisé ici pour l'instant).
 */
export default function App({ Component, pageProps }) {
  
  // --- Effet pour le Seed Initial (localStorage) --- 
  // Cet effet s'exécute une seule fois après le premier rendu de l'application côté client.
  useEffect(() => {
    // Appelle la fonction qui vérifie si le localStorage a besoin d'être initialisé
    // avec les recettes de démonstration.
    // Important: Cette fonction ne fait rien si elle est appelée côté serveur.
    seedIfNeeded();
    console.log("Vérification/Seed localStorage effectué depuis _app.jsx");
  // Le tableau de dépendances vide `[]` garantit que l'effet ne s'exécute qu'une fois.
  }, []);

  // --- Rendu de l'Application --- 
  return (
    // 1. Fournisseur de Contexte d'Authentification
    // Enveloppe toute l'application pour que chaque composant puisse accéder
    // à l'état d'authentification (user, loading) et aux fonctions (login, logout...)
    // via le hook `useAuth()`.
    <AuthProvider>
      {/* 2. Composant de Mise en Page (Layout) */}
      {/* Enveloppe le composant de la page actuelle (`Component`).
          Ceci assure que la Navbar (et potentiellement un Footer) est présente sur toutes les pages. */}
      <Layout>
        {/* 3. Composant de la Page Actuelle */}
        {/* Affiche le composant React correspondant à la route actuelle 
            (ex: HomePage pour '/', RecipeDetailPage pour '/recette/[id]', etc.).
            Les `pageProps` sont passées au composant de la page. */}
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
