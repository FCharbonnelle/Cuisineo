import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; // Utilisation de l'import absolu
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client'; // Utilisation de l'import absolu
import RecipeCard from '@/components/recipes/RecipeCard'; // Utilisation de l'import absolu

function MesRecettesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [myRecipes, setMyRecipes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Protection de la route
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/connexion?redirect=/mes-recettes'); // Redirige vers connexion en gardant la page cible
        }
    }, [user, authLoading, router]);

    // Récupération des recettes de l'utilisateur
    useEffect(() => {
        if (user) { // Ne fetcher que si l'utilisateur est connecté
            async function fetchMyRecipes() {
                setIsLoading(true);
                setError(null);
                try {
                    const recipesRef = collection(db, 'recettes');
                    // Créer une requête pour filtrer par userId
                    const q = query(recipesRef, where('userId', '==', user.uid));
                    const querySnapshot = await getDocs(q);
                    
                    const recipes = [];
                    querySnapshot.forEach((doc) => {
                        recipes.push({ id: doc.id, ...doc.data() });
                    });
                    
                    setMyRecipes(recipes);
                } catch (err) {
                    console.error("Erreur lors de la récupération des recettes de l'utilisateur:", err);
                    setError("Impossible de charger vos recettes.");
                } finally {
                    setIsLoading(false);
                }
            }
            fetchMyRecipes();
        }
    }, [user]); // Se déclenche quand l'état de l'utilisateur change

    // Affichage pendant le chargement de l'authentification ou des données
    if (authLoading || isLoading) {
        return <p className="text-center mt-10">Chargement...</p>;
    }
    
    // Ne devrait pas arriver si la redirection fonctionne, mais sécurité
    if (!user) {
         return <p className="text-center mt-10">Veuillez vous connecter pour voir vos recettes.</p>; 
    }
    
    // Affichage en cas d'erreur
    if (error) {
         return <p className="text-center mt-10 text-red-500">{error}</p>;
    }

    return (
        <>
            <Head>
                <title>Mes Recettes - Cuisineo</title>
                <meta name="description" content="Consultez et gérez vos recettes personnelles sur Cuisineo." />
            </Head>
            <div>
                <h1 className="text-3xl font-semibold mb-6 text-gray-800">Mes Recettes</h1>
                
                {myRecipes.length === 0 ? (
                    <p className="text-center text-gray-500">Vous n'avez pas encore ajouté de recette. <a href="/ajouter" className="text-primary hover:underline">Ajoutez-en une !</a></p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {myRecipes.map((recipe) => (
                            <RecipeCard key={recipe.id} recipe={recipe} />
                            // TODO: Ajouter des boutons Modifier/Supprimer ici ou dans RecipeCard conditionnellement
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default MesRecettesPage; 