import React from 'react';
import Head from 'next/head'; // Pour gérer le titre et la meta description
import AuthForm from '@/components/auth/AuthForm'; // Importe le composant formulaire

/**
 * Page de Connexion / Inscription.
 * Cette page affiche simplement le composant AuthForm qui contient toute la logique
 * pour se connecter ou s'inscrire.
 */
function ConnexionPage() {
  // Le rendu de la page
  return (
    <>
      {/* Configuration du <head> HTML pour cette page */}
      <Head>
        <title>Connexion / Inscription - Cuisineo</title>
        <meta name="description" content="Connectez-vous ou créez un compte pour gérer vos recettes sur Cuisineo." />
        {/* Empêche les moteurs de recherche d'indexer cette page (optionnel) */}
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      
      {/* Affiche le composant formulaire d'authentification */}
      <AuthForm />
    </>
  );
}

export default ConnexionPage; 