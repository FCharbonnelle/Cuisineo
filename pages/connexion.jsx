import React from 'react';
import Head from 'next/head';
import AuthForm from '../components/auth/AuthForm';

function ConnexionPage() {
  return (
    <>
      <Head>
        <title>Connexion / Inscription - Cuisineo</title>
        <meta name="description" content="Connectez-vous ou créez un compte pour gérer vos recettes sur Cuisineo." />
      </Head>
      <AuthForm />
    </>
  );
}

export default ConnexionPage; 