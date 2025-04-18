import "../styles/globals.css";
import { useEffect } from 'react';
import { seedIfNeeded } from '../scripts/seedLocalRecipes';
import Layout from '../components/layout/Layout';
import { AuthProvider } from '../contexts/AuthContext';

export default function App({ Component, pageProps }) {
  // Exécuter le seed localStorage une fois au montage côté client
  useEffect(() => {
    seedIfNeeded();
  }, []); // Le tableau vide assure l'exécution une seule fois

  // Envelopper le composant de la page actuelle avec le Layout et AuthProvider
  return (
    <AuthProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </AuthProvider>
  );
}
