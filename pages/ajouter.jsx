import React, { useEffect, useState } from 'react';
import Head from 'next/head';
import RecipeForm from '@/components/recipes/RecipeForm';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/router';
import { collection, getDocs, writeBatch, doc, serverTimestamp, limit, query } from 'firebase/firestore';
import { db } from '@/firebase/client';
import { getAllLocalRecipes } from '@/services/localRecipes';

const LOCAL_STORAGE_IMPORT_FLAG = 'cuisineo_firestore_imported';

/**
 * Page pour ajouter une nouvelle recette.
 * - Protégée : nécessite d\'être connecté.
 * - Gère l\'import initial des recettes depuis localStorage vers Firestore la première fois.
 * - Affiche le composant RecipeForm.
 */
function AjouterRecettePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [importStatus, setImportStatus] = useState('idle');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/connexion');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    async function checkAndImportSeed() {
      if (authLoading || !user) return;
      
      const importDone = localStorage.getItem(LOCAL_STORAGE_IMPORT_FLAG);
      if (importDone) {
        console.log("Import Firestore déjà effectué (flag trouvé).");
        setImportStatus('done');
        return;
      }

      setImportStatus('checking');
      console.log("Vérification de Firestore pour l'import initial...");
      try {
        const recipesRef = collection(db, 'recettes');
        const q = query(recipesRef, limit(1));
        const snapshot = await getDocs(q);

        if (snapshot.empty) {
          console.log("Firestore est vide. Tentative d'import depuis localStorage...");
          setImportStatus('importing');
          
          const localRecipes = getAllLocalRecipes();

          if (localRecipes && localRecipes.length > 0) {
            console.log(`Import de ${localRecipes.length} recettes depuis localStorage vers Firestore...`);
            const batch = writeBatch(db);

            localRecipes.forEach(recipe => {
              const newRecipeRef = doc(collection(db, 'recettes'));
              batch.set(newRecipeRef, {
                nom: recipe.nom || 'Sans nom',
                categorie: recipe.categorie || 'plat',
                ingredients: recipe.ingredients || [],
                etapes: recipe.etapes || '',
                imageUrl: recipe.imageUrl || null,
                userId: user.uid,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
              });
            });

            await batch.commit();
            console.log('Import initial de localStorage vers Firestore terminé avec succès !');
            
            localStorage.setItem(LOCAL_STORAGE_IMPORT_FLAG, 'true');
            localStorage.removeItem('cuisineo_recettes');
            
            setImportStatus('done');
          } else {
            console.log('localStorage est vide, aucun import nécessaire.');
            localStorage.setItem(LOCAL_STORAGE_IMPORT_FLAG, 'true');
            setImportStatus('done');
          }
        } else {
          console.log('Firestore contient déjà des recettes, aucun import nécessaire.');
          localStorage.setItem(LOCAL_STORAGE_IMPORT_FLAG, 'true');
          setImportStatus('done');
        }
      } catch (error) {
        console.error("Erreur grave lors de la vérification/import Firestore :", error);
        setImportStatus('error');
      }
    }

    checkAndImportSeed();
  }, [user, authLoading]);

  if (authLoading || importStatus === 'checking' || importStatus === 'importing') {
    return <p className="text-center mt-10">Préparation du formulaire...</p>;
  }
  
  if (!user) {
     return <p className="text-center mt-10">Veuillez vous connecter pour ajouter une recette.</p>; 
  }
  
  if (importStatus === 'error') {
     return <p className="text-center mt-10 text-red-500">Erreur lors de la préparation du formulaire. Vérifiez votre connexion ou réessayez.</p>;
  }

  return (
    <>
      <Head>
        <title>Ajouter une recette - Cuisineo</title>
        <meta name="description" content="Ajoutez une nouvelle recette à votre collection Cuisineo." />
      </Head>
      <div>
        <h1 className="text-3xl font-semibold mb-6 text-gray-800">Ajouter une nouvelle recette</h1>
        <RecipeForm />
      </div>
    </>
  );
}

export default AjouterRecettePage; 