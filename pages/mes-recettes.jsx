import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext'; // Hook personnalisé pour accéder à l'état d'authentification
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/client'; // Instance de notre base de données Firestore
import RecipeCard from '@/components/recipes/RecipeCard'; // Composant pour afficher une carte de recette
import { deleteRecipe } from '@/services/recipesAPI';

/**
 * Page "Mes Recettes".
 * Affiche les recettes créées par l'utilisateur actuellement connecté.
 * Permet également de supprimer ses propres recettes.
 * La page est protégée : seuls les utilisateurs connectés peuvent y accéder.
 */
function MesRecettesPage() {
    // --- États du composant ---
    // user: objet utilisateur depuis le contexte d'authentification (null si déconnecté)
    // authLoading: booléen indiquant si l'état d'authentification est en cours de chargement
    const { user, loading: authLoading } = useAuth();
    // router: objet de Next.js pour gérer la navigation (redirection)
    const router = useRouter();
    // myRecipes: tableau pour stocker les recettes récupérées depuis Firestore
    const [myRecipes, setMyRecipes] = useState([]);
    // isLoading: booléen pour indiquer si les recettes sont en cours de chargement depuis Firestore
    const [isLoading, setIsLoading] = useState(true);
    // error: stocke un message d'erreur si la récupération échoue
    const [error, setError] = useState(null);
    // deleteStatus: objet pour suivre l'état de la suppression (quelle recette, chargement, erreur)
    const [deleteStatus, setDeleteStatus] = useState({ id: null, loading: false, error: null });

    // --- Effets de bord (Hooks useEffect) ---

    // 1. Effet pour la protection de la route
    useEffect(() => {
        // Si l'authentification n'est plus en chargement ET que l'utilisateur n'est PAS connecté...
        if (!authLoading && !user) {
            // ...rediriger vers la page de connexion.
            // On ajoute `?redirect=/mes-recettes` à l'URL pour que l'utilisateur
            // soit redirigé ici après s'être connecté.
            router.push('/connexion?redirect=/mes-recettes');
        }
        // Dépendances: cet effet s'exécute si user, authLoading ou router changent.
    }, [user, authLoading, router]);

    // 2. Effet pour récupérer les recettes de l'utilisateur depuis Firestore
    useEffect(() => {
        // Ne lancer la récupération que si l'utilisateur est connecté
        if (user) {
            // Définition d'une fonction asynchrone à l'intérieur de l'effet
            async function fetchMyRecipes() {
                console.log(`Récupération des recettes pour l'utilisateur: ${user.uid}`);
                setIsLoading(true); // Indiquer le début du chargement
                setError(null);     // Réinitialiser les erreurs précédentes
                try {
                    // Référence à la collection 'recettes' dans Firestore
                    const recipesRef = collection(db, 'recettes');
                    // Création d'une requête Firestore:
                    // - Sélectionne les documents dans 'recettes'...
                    // - ...OÙ le champ 'userId' est ÉGAL (==) à l'UID de l'utilisateur connecté.
                    const q = query(recipesRef, where('userId', '==', user.uid));
                    
                    // Exécution de la requête
                    const querySnapshot = await getDocs(q);
                    
                    // Traitement des résultats
                    const recipes = []; // Tableau temporaire
                    querySnapshot.forEach((doc) => {
                        // Pour chaque document trouvé, ajouter un objet au tableau
                        // contenant l'ID du document et ses données.
                        recipes.push({ id: doc.id, ...doc.data() });
                    });
                    
                    // Mettre à jour l'état `myRecipes` avec les données récupérées
                    setMyRecipes(recipes);
                    console.log(`${recipes.length} recette(s) trouvée(s) pour cet utilisateur.`);
                } catch (err) {
                    // En cas d'erreur lors de la requête Firestore
                    console.error("Erreur lors de la récupération des recettes de l'utilisateur:", err);
                    setError("Impossible de charger vos recettes. Veuillez réessayer.");
                } finally {
                    // Quoi qu'il arrive (succès ou erreur), arrêter l'indicateur de chargement
                    setIsLoading(false);
                }
            }
            // Appel de la fonction asynchrone définie ci-dessus
            fetchMyRecipes();
        }
        // Dépendances: cet effet s'exécute seulement si l'objet `user` change (connexion/déconnexion).
    }, [user]);

    // --- Gestionnaires d'événements ---

    /**
     * Gère la suppression d'une recette.
     * Demande confirmation, appelle l'API de suppression, et met à jour l'état local.
     * @param {string} recipeId - L'ID de la recette à supprimer.
     */
    const handleDelete = async (recipeId) => {
        // Afficher une boîte de dialogue de confirmation native du navigateur
        if (window.confirm("Êtes-vous sûr de vouloir supprimer cette recette ? Cette action est irréversible.")) {
            console.log(`Demande de suppression pour ID: ${recipeId}`);
            // Mettre à jour l'état de suppression pour afficher un indicateur de chargement sur la carte concernée
            setDeleteStatus({ id: recipeId, loading: true, error: null });
            try {
                // Appel asynchrone à la fonction de l'API pour supprimer dans Firestore
                await deleteRecipe(recipeId);
                
                // Si la suppression réussit, mettre à jour l'état local `myRecipes`
                // en filtrant le tableau pour retirer la recette supprimée.
                // Cela évite de devoir re-télécharger toute la liste depuis Firestore.
                setMyRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));
                
                // Réinitialiser l'état de suppression
                setDeleteStatus({ id: null, loading: false, error: null });
                console.log(`Recette ${recipeId} supprimée avec succès (état local mis à jour).`);
            } catch (err) {
                // En cas d'erreur lors de la suppression (ex: problème réseau, règles de sécurité)
                console.error("Erreur lors de la suppression:", err);
                // Mettre à jour l'état de suppression pour afficher un message d'erreur
                setDeleteStatus({ id: recipeId, loading: false, error: "Erreur lors de la suppression." });
            }
        } else {
            console.log("Suppression annulée par l'utilisateur.");
        }
    };
    
    /**
     * Gère le clic sur le bouton "Modifier".
     * (Fonctionnalité à implémenter dans une étape ultérieure)
     * @param {string} recipeId - L'ID de la recette à modifier.
     */
    const handleEdit = (recipeId) => {
        // TODO: Implémenter la redirection vers la page/formulaire de modification.
        console.log("(Placeholder) Modifier recette avec ID:", recipeId);
        alert(`Fonctionnalité "Modifier" pour la recette ${recipeId} à implémenter.`);
        // Exemple de redirection future:
        // router.push(`/modifier/${recipeId}`); 
    };

    // --- Rendu conditionnel --- 

    // Pendant que l'état d'authentification ou les recettes sont en cours de chargement
    if (authLoading || isLoading) {
        return <p className="text-center mt-10">Chargement de vos informations...</p>;
    }
    
    // Si l'utilisateur n'est pas connecté (sécurité supplémentaire après la redirection)
    if (!user) {
         return <p className="text-center mt-10">Veuillez vous connecter pour accéder à cette page.</p>; 
    }
    
    // Si une erreur s'est produite lors de la récupération des recettes
    if (error) {
         return <p className="text-center mt-10 text-red-500">{error}</p>;
    }

    // --- Rendu principal --- 
    return (
        <>
            {/* Met à jour le titre de l'onglet du navigateur */}
            <Head>
                <title>Mes Recettes - Cuisineo</title>
                <meta name="description" content="Consultez et gérez vos recettes personnelles sur Cuisineo." />
            </Head>
            
            {/* Contenu de la page */}
            <div>
                {/* Titre principal */}
                <h1 className="text-3xl font-semibold mb-6 text-gray-800">Mes Recettes</h1>
                
                {/* Affichage d'un message d'erreur en cas d'échec de suppression */} 
                {deleteStatus.error && (
                    <p className="mb-4 text-center text-red-600 bg-red-100 p-2 rounded">{deleteStatus.error}</p>
                )}
                
                {myRecipes.length === 0 ? (
                    // Message si l'utilisateur n'a pas de recettes
                    <p className="text-center text-gray-500">
                        Vous n'avez pas encore ajouté de recette.
                        {/* Lien vers la page d'ajout */}
                        <Link href="/ajouter" className="text-primary hover:underline ml-1">Ajoutez-en une !</Link>
                    </p>
                ) : (
                    // Grille pour afficher les cartes de recettes
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {/* Boucle sur le tableau `myRecipes` pour créer une carte pour chaque recette */}
                        {myRecipes.map((recipe) => (
                            // Conteneur pour la carte et l'overlay de chargement de suppression
                            <div key={recipe.id} className="relative">
                                {/* Affiche un overlay semi-transparent avec une icône de chargement 
                                    pendant la suppression de CETTE recette spécifique. */}
                                {deleteStatus.loading && deleteStatus.id === recipe.id && (
                                    <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-xl">
                                        <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                )}
                                {/* Composant RecipeCard, en lui passant la recette et les fonctions de gestion */}
                                <RecipeCard 
                                    recipe={recipe} 
                                    onDelete={handleDelete} // La fonction à appeler lors du clic sur "Supprimer"
                                    onEdit={handleEdit}     // La fonction à appeler lors du clic sur "Modifier"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default MesRecettesPage; 