# Présentation Raffinée du Projet "Cuisineo" - Développement Étape par Étape

**(Basée sur l'analyse du code)**

**Introduction**

Bonjour, je vous présente aujourd'hui mon projet "Cuisineo", une application web développée dans le cadre de ma formation de Développeur Web. L'objectif de Cuisineo est de permettre aux utilisateurs de découvrir, sauvegarder, ajouter et gérer leurs propres recettes de cuisine. Ce projet m'a permis de mettre en pratique un large éventail de compétences, de l'initialisation du projet à la gestion des données, en passant par la création d'une interface utilisateur réactive et la sécurisation des accès.

Je vais maintenant vous détailler les différentes étapes du développement, en m'appuyant sur les choix techniques et les implémentations spécifiques réalisées.

**Étape 1 : Initialisation du Projet et Choix Technologiques Fondamentaux**

*   **Ce qui a été fait :** Mise en place de la structure initiale du projet et sélection des technologies clés.
*   **Technologies utilisées :**
    *   **Next.js:** Framework React choisi pour ses capacités de rendu hybride, son routage basé sur les fichiers (`pages/`), et sa facilité à intégrer des API backend. J'ai utilisé sa structure pour organiser le code en pages, composants (`components/`) et services.
    *   **React:** Utilisé comme bibliothèque UI principale pour créer une interface utilisateur déclarative et basée sur des composants réutilisables (comme `Navbar`, `RecipeCard`, `RecipeForm`).
    *   **Node.js/npm:** Pour gérer les dépendances du projet via `package.json` et exécuter les scripts de développement et de build.
    *   **Git/GitHub:** Pour le contrôle de version rigoureux, le suivi de chaque étape de développement et la sauvegarde du code.
    *   **Firebase (Client SDK) :** Intégration précoce du SDK client Firebase (`firebase/client.js`) pour l'authentification, la base de données Firestore et le stockage (bien que l'utilisation de Storage ait été adaptée par la suite). La configuration utilise des **variables d'environnement** (`.env.local` et `NEXT_PUBLIC_`) pour sécuriser les clés d'API, une pratique essentielle. L'initialisation gère le Hot Module Replacement de Next.js.

        *Exemple d'initialisation Firebase et utilisation des variables d'environnement (`firebase/client.js`):*
        ```javascript
        // --- Configuration Firebase ---
        // Objet contenant les clés API lues depuis les variables d'environnement.
        // Le préfixe NEXT_PUBLIC_ les rend accessibles côté client.
        const firebaseConfig = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,           // Clé d'API publique
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,     // Domaine pour l'authentification
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,         // ID du projet Firebase
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, // Bucket pour le stockage de fichiers
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID, // Pour les notifications (non utilisé ici)
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,             // ID de l'application web dans Firebase
        };

        // --- Initialisation de Firebase (avec gestion du Hot Module Replacement - HMR) ---
        let app; // Variable pour stocker l'instance de l'application Firebase.

        // Vérifie s'il n'y a pas DÉJÀ une instance Firebase initialisée (`getApps().length` == 0).
        if (!getApps().length) {
          // Si aucune instance n'existe, on initialise Firebase avec notre configuration.
          app = initializeApp(firebaseConfig);
        } else {
          // Si une instance existe déjà (à cause du HMR), on récupère cette instance existante.
          // Ceci évite l'erreur "Firebase app named '[DEFAULT]' already exists".
          app = getApp();
        }

        // --- Exports des services Firebase ---
        // On exporte les instances des services dont on a besoin (Auth, Firestore, Storage)
        // pour pouvoir les importer facilement ailleurs dans l'application.

        // Exporte l'instance du service d'Authentification.
        export const auth = getAuth(app);
        // Exporte l'instance du service Firestore (Base de données).
        export const db = getFirestore(app);
        // Exporte l'instance du service Storage (Stockage fichiers).
        export const storage = getStorage(app);
        // Exporte l'instance de l'application Firebase elle-même (moins courant mais possible).
        export default app;
        ```

*   **Objectif :** Établir une fondation technique moderne et robuste, favorisant la maintenabilité et l'évolutivité. Le code a été structuré logiquement et versionné dès le début.

**Étape 2 : Mise en Place de la Structure Visuelle et de la Navigation**

*   **Ce qui a été fait :** Création de la mise en page globale, de la barre de navigation et intégration du système de style.
*   **Technologies/Fichiers clés :**
    *   **Tailwind CSS:** Adopté comme framework CSS "utility-first" pour un prototypage rapide et une personnalisation fine des styles directement dans le JSX (`className`). Configuré via `tailwind.config.js` et `postcss.config.mjs`.
    *   **`pages/_app.jsx`:** Point d'entrée principal où les styles globaux (`globals.css`) sont importés. C'est ici que le `AuthProvider` (pour le contexte d'authentification) et le `Layout` sont appliqués globalement, assurant que chaque page hérite du contexte et de la structure de base. J'y ai aussi intégré un script (`seedIfNeeded`) pour potentiellement initialiser le `localStorage` avec des données de démo au premier chargement côté client.

        *Exemple d'application globale des Providers et du Layout (`pages/_app.jsx`):*
        ```jsx
        // Fonction principale de l'application Next.js
        export default function App({ Component, pageProps }) {
          // Hook `useEffect` pour exécuter du code après le premier rendu côté client.
          useEffect(() => {
            // Appelle une fonction pour potentiellement remplir le localStorage avec des données initiales.
            seedIfNeeded();
          // Le tableau vide `[]` signifie que cet effet ne s'exécute qu'une fois.
          }, []);

          // Rendu de l'application
          return (
            // 1. Enveloppe toute l'application avec le fournisseur de contexte d'authentification.
            //    Rend `user`, `loading`, `login`, `logout`, etc., disponibles partout via `useAuth()`.
            <AuthProvider>
              // 2. Enveloppe chaque page avec le composant Layout (Navbar, structure principale).
              <Layout>
                // 3. Affiche le composant de la page actuelle (ex: HomePage, RecipeDetailPage).
                //    `{...pageProps}` passe les propriétés pré-chargées à la page (si utilisées).
                <Component {...pageProps} />
              </Layout>
            </AuthProvider>
          );
        }
        ```
    *   **`components/layout/Layout.jsx`:** Composant simple mais essentiel utilisant Flexbox et Tailwind pour définir la structure verticale (Navbar en haut, contenu principal au milieu). Il utilise la balise sémantique `<main>` et `flex-grow` pour une bonne adaptabilité.
    *   **`components/layout/Navbar.jsx`:** Composant React gérant la navigation principale. Il utilise le hook `useAuth` pour afficher dynamiquement les liens en fonction de l'état de connexion : "Accueil", "Mes Recettes", "Ajouter" et "Déconnexion" (avec l'email de l'utilisateur) si connecté ; "Connexion" sinon. La navigation est gérée par le composant `Link` de Next.js pour une expérience fluide. Le style des liens (y compris l'état actif basé sur `router.pathname`) et du bouton de déconnexion est géré avec Tailwind et les icônes proviennent de `@heroicons/react`. La barre est `sticky` pour rester visible.

        *Exemple d'affichage conditionnel dans la Navbar (`components/layout/Navbar.jsx`):*
        ```jsx
        // Composant fonctionnel Navbar.
        function Navbar() {
          // Récupère l'objet `user` (ou null) et la fonction `logout` du contexte d'authentification.
          const { user, logout } = useAuth();
          // ... autres hooks (useRouter, etc.) ...

          // Fonction pour gérer le clic sur le bouton de déconnexion.
          const handleLogout = async () => {
            try {
              await logout(); // Appelle la fonction de déconnexion du contexte.
              router.push('/'); // Redirige vers l'accueil.
            } catch (error) { /* Gère l'erreur */ }
          };

          // Rendu JSX de la barre de navigation.
          return (
            <nav className="..."> // Conteneur principal de la barre.
              {/* ... Logo et lien vers l'accueil ... */}

              {/* Affichage conditionnel basé sur l'existence de l'objet `user`. */}
              {user ? (
                // Fragment React pour grouper les éléments si l'utilisateur est connecté.
                <>
                  {/* Liens pour l'utilisateur connecté (Accueil, Mes Recettes, Ajouter). */}
                  {/* Utilise le composant Link de Next.js pour la navigation côté client. */}
                  <Link href="/mes-recettes" className={getLinkClassName('/mes-recettes')}>...</Link>
                  <Link href="/ajouter" className={getLinkClassName('/ajouter')}>...</Link>
                  {/* Bouton pour appeler la fonction de déconnexion. */}
                  <button onClick={handleLogout} className={logoutButtonClasses}>...</button>
                </>
              ) : (
                // Bloc affiché si l'utilisateur n'est PAS connecté.
                <div className="ml-auto"> // Pour aligner à droite.
                  {/* Lien unique vers la page de connexion. */}
                  <Link href="/connexion" className={getLinkClassName('/connexion')}>...</Link>
                </div>
              )}
            </nav>
          );
        }
        ```
*   **Objectif :** Construire une interface utilisateur cohérente, navigable et esthétiquement agréable, en utilisant des composants réutilisables et des outils modernes de styling. Le code a été commenté et testé visuellement.

**Étape 3 : Développement du Système d'Authentification Robuste**

*   **Ce qui a été fait :** Implémentation complète de l'authentification utilisateur (inscription, connexion, déconnexion) et gestion de l'état global.
*   **Technologies/Fichiers clés :**
    *   **Firebase Authentication:** Utilisé comme backend d'authentification via le SDK client.
    *   **`contexts/AuthContext.jsx`:** Création d'un Contexte React (`AuthProvider`, `useAuth`) pour gérer l'état global de l'utilisateur (`user`, `loading`). Il utilise `onAuthStateChanged` de Firebase pour écouter les changements en temps réel et met à disposition les fonctions `signup`, `login`, `logout` qui encapsulent les appels Firebase (`createUserWithEmailAndPassword`, `signInWithEmailAndPassword`, `signOut`). L'utilisation de `useMemo` optimise les performances. La gestion de l'état `loading` assure que l'application ne s'affiche qu'une fois l'état d'authentification initial connu.

        *Exemple d'écoute de l'état d'authentification (`contexts/AuthContext.jsx`):*
        ```javascript
        // Composant Provider qui enveloppe l'application.
        export function AuthProvider({ children }) {
          // État pour stocker l'objet utilisateur Firebase (ou null).
          const [user, setUser] = useState(null);
          // État pour savoir si l'état initial d'authentification est chargé.
          const [loading, setLoading] = useState(true);

          // Hook `useEffect` pour s'abonner à l'état d'authentification au montage.
          useEffect(() => {
            // `onAuthStateChanged` est un écouteur Firebase.
            // Il appelle la fonction callback immédiatement, puis à chaque changement d'état.
            const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
              // Met à jour l'état `user` avec l'utilisateur actuel (ou null).
              setUser(currentUser);
              // Indique que le chargement initial est terminé.
              setLoading(false);
            });
            // Fonction de nettoyage : se désabonne de l'écouteur lors du démontage du composant.
            return () => {
              unsubscribe();
            };
          // Tableau de dépendances vide `[]` : l'effet ne s'exécute qu'une fois (au montage).
          }, []);

          // ... Définition des fonctions signup, login, logout ...

          // Mémorise la valeur du contexte pour éviter des re-rendus inutiles.
          // La valeur n'est recréée que si `user` ou `loading` changent.
          const value = useMemo(() => ({ user, loading, signup, login, logout }), [user, loading]);

          // Rendu du Provider.
          return (
            // Met la `value` (user, loading, fonctions) à disposition des composants enfants.
            <AuthContext.Provider value={value}>
              {/* Affiche les enfants seulement quand l'état initial est chargé. */}
              {/* Ceci évite des affichages incorrects pendant le chargement. */}
              {!loading && children}
            </AuthContext.Provider>
          );
        }
        ```
    *   **`components/auth/AuthForm.jsx`:** (Analyse basée sur son nom et sa taille, non lu explicitement mais son rôle est clair) Ce composant contient les champs email/mot de passe et utilise probablement les fonctions `login`/`signup` fournies par `useAuth` pour interagir avec Firebase. Il gère l'état local du formulaire et les erreurs spécifiques à l'authentification.
    *   **`pages/connexion.jsx`:** Page simple qui affiche le composant `AuthForm.jsx`.
    *   **Protection des routes (côté client) :** Implémentée dans les pages nécessitant une connexion (ex: `ajouter.jsx`, `mes-recettes.jsx`, `modifier/[id].jsx`) via un `useEffect` qui vérifie `user` depuis `useAuth` et utilise `router.push` pour rediriger vers `/connexion` si l'utilisateur n'est pas authentifié.

        *Exemple de protection de route côté client (`pages/mes-recettes.jsx`):*
        ```jsx
        // Composant fonctionnel pour la page "Mes Recettes".
        function MesRecettesPage() {
          // Récupère l'utilisateur et l'état de chargement depuis le contexte.
          const { user, loading: authLoading } = useAuth();
          // Récupère l'objet router pour la redirection.
          const router = useRouter();

          // Hook `useEffect` pour vérifier l'authentification après le rendu.
          useEffect(() => {
            // Condition : si l'authentification n'est plus en cours de chargement ET si l'utilisateur N'EST PAS connecté.
            if (!authLoading && !user) {
              // Redirige vers la page de connexion.
              // Ajoute le paramètre `redirect` pour revenir ici après connexion.
              router.push('/connexion?redirect=/mes-recettes');
            }
          // Dépendances : ré-exécute l'effet si `user`, `authLoading` ou `router` changent.
          }, [user, authLoading, router]);

          // Affiche un message de chargement tant que l'auth charge ou si l'utilisateur est null (avant redirection).
          if (authLoading || !user) {
            return <p>Chargement...</p>;
          }

          // Si on arrive ici, l'utilisateur est connecté : affiche le reste du composant.
          // ... rendu de la liste des recettes de l'utilisateur ...
          return (<div>Mes recettes...</div>);
        }
        ```
*   **Objectif :** Mettre en place un système d'authentification sécurisé et fluide, permettant aux utilisateurs de gérer leur compte et d'accéder aux fonctionnalités protégées. La gestion d'état centralisée via le Contexte facilite l'accès aux informations utilisateur dans toute l'application.

**Étape 4 : Affichage des Recettes (Publiques et Détails)**

*   **Ce qui a été fait :** Développement des pages pour consulter toutes les recettes et voir le détail d'une recette spécifique.
*   **Technologies/Fichiers clés :**
    *   **Firebase Firestore:** Utilisé comme base de données NoSQL pour stocker les informations détaillées des recettes (nom, catégorie, ingrédients, étapes, imageUrl, userId...).
    *   **`services/recipesAPI.js`:** (Fichier non lu mais inféré des imports) Ce fichier centralise probablement les fonctions d'interaction avec Firestore pour les recettes (ex: `getAllRecipes`, `getRecipeById`, `deleteRecipe`).
    *   **`components/recipes/RecipeCard.jsx`:** Composant clé pour afficher une recette sous forme de carte. Il utilise `next/image` pour l'optimisation, affiche l'image, la catégorie, le nom, et fournit des liens vers la page détail. Il accepte aussi les props `onEdit`/`onDelete` pour afficher conditionnellement les boutons d'action.

        *Exemple de structure de `RecipeCard.jsx` avec props conditionnelles:*
        ```jsx
        // Composant RecipeCard recevant la recette et les callbacks optionnels en props.
        function RecipeCard({ recipe, onEdit, onDelete }) {
          // Gestionnaires pour les clics sur les boutons (empêchent la navigation du lien parent).
          const handleEditClick = (e, id) => { e.preventDefault(); e.stopPropagation(); if (onEdit) onEdit(id); };
          const handleDeleteClick = (e, id) => { e.preventDefault(); e.stopPropagation(); if (onDelete) onDelete(id); };

          return (
            // Conteneur principal de la carte.
            <div className="...">
              {/* Lien principal (image) vers la page détail de la recette. */}
              <Link href={`/recette/${recipe.id}`} className="...">
                {/* Composant Image de Next.js pour l'optimisation d'image. */}
                <Image src={recipe.imageUrl || '/placeholders/placeholder.png'} alt={recipe.nom} ... />
              </Link>
              {/* Section de contenu textuel. */}
              <div className="...">
                {/* Affiche la catégorie. */}
                <span>{recipe.categorie}</span>
                {/* Lien (titre) vers la page détail. */}
                <Link href={`/recette/${recipe.id}`} className="...">
                  <h3>{recipe.nom}</h3>
                </Link>
                {/* Conteneur pour les boutons d'action (modifier/supprimer). */}
                <div className="...">
                  {/* Affiche le bouton Modifier SEULEMENT si la prop `onEdit` est fournie. */}
                  {onEdit && <button onClick={(e) => handleEditClick(e, recipe.id)}>Modifier</button>}
                  {/* Affiche le bouton Supprimer SEULEMENT si la prop `onDelete` est fournie. */}
                  {onDelete && <button onClick={(e) => handleDeleteClick(e, recipe.id)}>Supprimer</button>}
                </div>
              </div>
            </div>
          );
        }
        ```
    *   **`pages/index.jsx` (Page d'accueil) :** Récupère *toutes* les recettes via `getAllRecipes` en utilisant `useEffect` (rendu côté client - CSR). Elle implémente un **filtrage côté client** par nom (barre de recherche) et par catégorie (boutons de filtre), puis affiche les `filteredRecipes` via `RecipeCard` (sans les boutons d'action). Gère les états de chargement et d'erreur. Utilise `Head` pour le SEO.

        *Exemple de logique de filtrage côté client (`pages/index.jsx`):*
        ```javascript
        // États pour stocker les données et les critères de filtre.
        const [recipes, setRecipes] = useState([]); // Toutes les recettes chargées.
        const [searchTerm, setSearchTerm] = useState(''); // Terme de recherche actuel.
        const [selectedCategory, setSelectedCategory] = useState('Toutes'); // Catégorie sélectionnée.

        // ... useEffect pour charger `recipes` depuis l'API ...

        // Calcule les recettes filtrées à chaque rendu.
        const filteredRecipes = recipes.filter((recipe) => {
          // Condition 1: La recette correspond à la catégorie sélectionnée OU 'Toutes' est sélectionné.
          // `toLowerCase()` pour une comparaison insensible à la casse.
          const categoryMatch = selectedCategory === 'Toutes' || recipe.categorie.toLowerCase() === selectedCategory.toLowerCase();
          // Condition 2: Le nom de la recette (en minuscule) inclut le terme de recherche (en minuscule).
          const searchMatch = recipe.nom.toLowerCase().includes(searchTerm.toLowerCase());
          // La recette est incluse si LES DEUX conditions sont vraies.
          return categoryMatch && searchMatch;
        });
        ```
    *   **`pages/recette/[id].jsx` (Page Détail) :** Page dynamique qui récupère l'ID de l'URL. Utilise `useEffect` et `getRecipeById(id)` pour charger les données de la recette spécifique (CSR également). Affiche l'image, la catégorie, le titre, la liste des ingrédients et les étapes (en respectant les sauts de ligne avec `whitespace-pre-line`). Gère chargement et erreurs. Utilise `Head` pour le SEO.
*   **Objectif :** Permettre une consultation facile et agréable des recettes, avec des fonctionnalités de recherche et de filtrage pour la liste principale, et un affichage détaillé et structuré pour chaque recette. Le choix du CSR pour ces pages permet un chargement initial rapide de la structure.

**Étape 5 : Gestion Complète des Recettes Utilisateur (CRUD)**

*   **Ce qui a été fait :** Implémentation des fonctionnalités permettant aux utilisateurs connectés de créer, lire, mettre à jour et supprimer (CRUD) leurs propres recettes.
*   **Technologies/Fichiers clés :**
    *   **`components/recipes/RecipeForm.jsx`:** Formulaire React très complet utilisant `react-hook-form` pour la gestion et `Yup` pour la validation (nom, catégorie, ingrédients, étapes, URL image). Gère le mode ajout/édition via `recipeToEdit`. **Point important :** Utilise un champ URL pour l'image comme contournement aux limitations de Firebase Storage en plan gratuit (ce point technique a été documenté dans le code). La soumission utilise `addDoc` ou `updateDoc` de Firestore, associe le `userId` et gère l'état de chargement/erreur avant de rediriger. Il affiche un aperçu de l'image basée sur l'URL.

        *Extrait du commentaire sur le contournement de l'image (`components/recipes/RecipeForm.jsx`):*
        ```javascript
        // --- NOTE IMPORTANTE CONCERNANT LES IMAGES ---
        // Initialement, l'upload direct d'images vers Firebase Storage avait été implémenté.
        // Cependant, en raison des limitations du plan gratuit "Spark" de Firebase,
        // la configuration CORS nécessaire ... n'est pas possible ...
        //
        // **Contournement choisi pour ce projet :**
        // ... accepter une URL directe vers une image hébergée ailleurs ...
        //
        // **Implications :**
        // - L'utilisateur doit trouver et copier/coller l'URL de l'image.
        // ...
        // --- FIN NOTE ---
        ```

        *Exemple de logique de soumission (Ajout/Modification) (`components/recipes/RecipeForm.jsx`):*
        ```javascript
        // Fonction appelée par react-hook-form après validation Yup.
        const onSubmit = async (data) => {
          // Vérifie si l'utilisateur est connecté (obtenu via useAuth).
          if (!user) { /* Gère l'erreur : utilisateur non connecté */ return; }
          // Indique le début de la soumission (désactive le bouton).
          setLoading(true);
          // Réinitialise les erreurs précédentes du formulaire.
          setFormError(null);

          // Bloc principal pour les opérations asynchrones (Firestore).
          try {
            // Transforme le texte des ingrédients (textarea) en tableau.
            // split('\n') : sépare par ligne.
            // map(trim) : enlève les espaces au début/fin de chaque ligne.
            // filter(line => line) : enlève les lignes vides.
            const ingredientsArray = data.ingredientsText.split('\n').map(line => line.trim()).filter(line => line);
            // Prépare l'objet à envoyer à Firestore.
            const recipeData = {
              nom: data.nom,                  // Nom depuis le formulaire validé.
              categorie: data.categorie,        // Catégorie depuis le formulaire.
              ingredients: ingredientsArray,  // Tableau d'ingrédients traité.
              etapes: data.etapes,            // Étapes depuis le formulaire.
              imageUrl: data.imageUrl || null, // URL de l'image (ou null si vide/invalide).
              userId: user.uid,             // ID de l'utilisateur connecté.
            };

            // Vérifie si on est en mode édition (`isEditing` est basé sur la présence de `recipeToEdit`).
            if (isEditing) {
              // MODE ÉDITION :
              // Crée une référence au document Firestore existant.
              const recipeRef = doc(db, 'recettes', recipeToEdit.id);
              // Met à jour le document avec les nouvelles données.
              // `updatedAt` utilise l'heure du serveur Firestore.
              await updateDoc(recipeRef, { ...recipeData, updatedAt: serverTimestamp() });
              // Redirige vers la page de détail de la recette modifiée.
              router.push(`/recette/${recipeToEdit.id}`);
            } else {
              // MODE AJOUT :
              // Ajoute un nouveau document dans la collection 'recettes'.
              const docRef = await addDoc(collection(db, "recettes"), {
                 ...recipeData,                 // Données de la recette.
                 createdAt: serverTimestamp(), // Heure de création (serveur).
                 updatedAt: serverTimestamp()  // Heure de mise à jour (serveur).
              });
              // Réinitialise les champs du formulaire après succès.
              reset();
              // Redirige vers la page d'accueil.
              router.push('/');
            }
          // Bloc exécuté si une erreur survient dans le `try`.
          } catch (error) {
            // Affiche l'erreur dans la console.
            console.error("Erreur lors de la soumission du formulaire:", error);
            // Met à jour l'état d'erreur pour l'afficher à l'utilisateur.
            setFormError(error.message || "Une erreur est survenue lors de l'enregistrement.");
            // Très important : arrête l'indicateur de chargement même en cas d'erreur.
            setLoading(false);
          }
          // Note : setLoading(false) n'est pas nécessaire après le try/catch ici
          // car en cas de succès, la redirection change de page et démonte le composant.
        };
        ```
    *   **`pages/ajouter.jsx`:** Page protégée qui affiche `<RecipeForm />`. **Fonctionnalité notable :** Implémente une logique d'import unique : si Firestore est vide pour l'utilisateur, elle importe les recettes potentiellement présentes dans le `localStorage` (issues du seed initial) vers Firestore en utilisant un `writeBatch`, assurant une migration des données locales vers la base centralisée.
    *   **`pages/mes-recettes.jsx`:** Page protégée qui récupère uniquement les recettes de l'utilisateur connecté via une requête Firestore `where('userId', '==', user.uid)`. Affiche les recettes via `RecipeCard` en passant les fonctions `handleEdit` et `handleDelete`. `handleDelete` demande confirmation, appelle `deleteRecipe` (service API), et met à jour l'état local de manière optimiste (filtre le tableau) tout en affichant un indicateur de chargement sur la carte supprimée.

        *Exemple de requête Firestore pour les recettes de l'utilisateur (`pages/mes-recettes.jsx`):*
        ```javascript
        // Effet pour charger les recettes quand l'utilisateur change.
        useEffect(() => {
          // Ne fait rien si l'utilisateur n'est pas encore chargé/connecté.
          if (user) {
            // Fonction interne asynchrone pour la clarté.
            async function fetchMyRecipes() {
              // ... gestion isLoading et error ...
              try {
                // 1. Référence à la collection 'recettes'.
                const recipesRef = collection(db, 'recettes');
                // 2. Construction de la requête Firestore.
                //    'where' filtre les documents où le champ 'userId' est égal à l'UID de l'utilisateur connecté.
                const q = query(recipesRef, where('userId', '==', user.uid));
                // 3. Exécution de la requête pour obtenir un snapshot des résultats.
                const querySnapshot = await getDocs(q);
                // 4. Traitement des résultats.
                const recipes = []; // Initialise un tableau vide.
                // Boucle sur chaque document dans le snapshot.
                querySnapshot.forEach((doc) => {
                  // Ajoute un objet au tableau `recipes` avec l'ID du document et ses données (...doc.data()).
                  recipes.push({ id: doc.id, ...doc.data() });
                });
                // 5. Mise à jour de l'état React avec les recettes trouvées.
                setMyRecipes(recipes);
              } catch (err) { /* Gère l'erreur */ }
              finally { setIsLoading(false); } // Arrête le chargement dans tous les cas.
            }
            // Appelle la fonction pour lancer la récupération.
            fetchMyRecipes();
          }
        // Dépendance : cet effet est ré-exécuté si `user` change.
        }, [user]);
        ```

        *Exemple de gestion de la suppression avec mise à jour optimiste (`pages/mes-recettes.jsx`):*
        ```javascript
        // Fonction appelée par le bouton "Supprimer" de RecipeCard.
        const handleDelete = async (recipeId) => {
          // Demande confirmation à l'utilisateur via une boîte de dialogue native.
          if (window.confirm("Êtes-vous sûr de vouloir supprimer cette recette ?")) {
            // Indique quelle recette est en cours de suppression (pour l'UI).
            setDeleteStatus({ id: recipeId, loading: true, error: null });
            try {
              // 1. Appel à la fonction (externe ou API) pour supprimer dans Firestore.
              await deleteRecipe(recipeId);

              // 2. Mise à jour optimiste de l'UI :
              //    Met à jour l'état local `myRecipes` SANS recharger depuis Firestore.
              //    `filter` crée un nouveau tableau excluant la recette avec l'ID supprimé.
              setMyRecipes(prevRecipes => prevRecipes.filter(recipe => recipe.id !== recipeId));

              // Réinitialise l'état de suppression (cache l'indicateur de chargement).
              setDeleteStatus({ id: null, loading: false, error: null });
            } catch (err) {
              // Gère l'erreur si la suppression Firestore échoue.
              console.error("Erreur lors de la suppression:", err);
              setDeleteStatus({ id: recipeId, loading: false, error: "Erreur lors de la suppression." });
            }
          }
        };
        ```
    *   **`pages/modifier/[id].jsx`:** Page dynamique protégée. Récupère la recette via `getRecipeById`. **Crucial :** Vérifie que `data.userId === user.uid` avant d'afficher le formulaire. Si autorisé, affiche `<RecipeForm recipeToEdit={recipeData} />`, passant les données pour pré-remplir le formulaire en mode édition.
*   **Objectif :** Donner aux utilisateurs connectés un contrôle total sur leurs propres recettes, avec des formulaires robustes, une gestion des permissions claires et une expérience utilisateur soignée (feedback visuel lors des actions).

**Étape 6 : Finalisation, Tests et Bonnes Pratiques**

*   **Ce qui a été fait :** Application des bonnes pratiques, tests et améliorations finales.
*   **Technologies/Fichiers clés :**
    *   **ESLint (`eslint.config.mjs`):** Utilisé pour maintenir une qualité et une cohérence de code élevées.
    *   **Commentaires :** Présence de commentaires JSDoc et de commentaires explicatifs dans le code (notamment pour le contournement de l'image), facilitant la compréhension et la maintenance.
    *   **Tests :** Tests manuels effectués pour valider le fonctionnement sur différents scénarios (connexion, ajout, modification, suppression, filtrage, responsive design via Tailwind). (Mentionnez ici tout test automatisé si réalisé).
    *   **Gestion des erreurs :** Implémentation de `try...catch` dans les appels asynchrones (Firebase, API) et affichage de messages d'erreur clairs à l'utilisateur via l'état (`error`, `formError`, `deleteStatus.error`).

        *Exemple de bloc try...catch dans la soumission (`components/recipes/RecipeForm.jsx`):*
        ```javascript
        // Fonction de soumission du formulaire.
        const onSubmit = async (data) => {
          // ... vérifications préliminaires (utilisateur connecté, etc.) ...
          setLoading(true);   // Active l'état de chargement.
          setFormError(null); // Réinitialise les erreurs précédentes.

          // Début du bloc 'try' : contient le code susceptible de lever une erreur.
          try {
            // ... préparation des données pour Firestore ...
            // ... appel à `addDoc` ou `updateDoc` (qui peut échouer) ...
            // ... redirection en cas de succès ...
          }
          // Bloc 'catch' : exécuté si une erreur est levée dans le bloc 'try'.
          catch (error) {
            // Affiche l'erreur détaillée dans la console du développeur.
            console.error("Erreur lors de la soumission du formulaire:", error);
            // Met à jour l'état `formError` avec un message pour l'utilisateur.
            setFormError(error.message || "Une erreur est survenue...");
            // Important : désactive l'état de chargement même si une erreur s'est produite.
            setLoading(false);
          }
        };
        ```
    *   **Sécurité :** Utilisation de variables d'environnement pour les clés Firebase, protection des routes côté client, vérification des autorisations côté serveur implicite (via règles Firestore, à confirmer) et côté client (`modifier/[id].jsx`).
    *   **Accessibilité (aria) :** Utilisation d'attributs `aria-invalid` sur les champs de formulaire en erreur.

        *Exemple d'utilisation d'aria-invalid et affichage d'erreur (`components/recipes/RecipeForm.jsx`):*
        ```jsx
        {/* Champ de saisie pour le nom de la recette. */}
        <input
          id="nom"
          type="text"
          // Lie ce champ à react-hook-form sous le nom 'nom'.
          {...register('nom')}
          // Applique conditionnellement des classes CSS si le champ 'nom' a une erreur.
          // Change la couleur de la bordure en rouge si `errors.nom` existe.
          className={`border ${errors.nom ? 'border-red-500' : 'border-gray-300'} ...`}
          // Attribut ARIA pour l'accessibilité : indique aux lecteurs d'écran si le champ est invalide.
          aria-invalid={errors.nom ? "true" : "false"}
        />
        {/* Affiche le message d'erreur SEULEMENT si `errors.nom` existe. */}
        {errors.nom && (
          // Paragraphe stylisé pour afficher le message d'erreur spécifique à ce champ.
          // `errors.nom.message` provient du schéma de validation Yup.
          <p className="mt-1 text-xs text-red-600" role="alert">{errors.nom.message}</p>
        )}
        ```
    *   **UX :** Indicateurs de chargement, aperçu d'image, feedback lors de la suppression, messages clairs.
*   **Objectif :** Livrer une application fonctionnelle, fiable, sécurisée, maintenable et agréable à utiliser, démontrant une compréhension solide des bonnes pratiques de développement web.

**Conclusion**

Le développement de Cuisineo m'a permis de consolider mes compétences sur l'écosystème React/Next.js, l'intégration backend avec Firebase (Auth et Firestore, avec une adaptation pour Storage), la gestion d'état avancée (React Context, `react-hook-form`), et les outils frontend modernes comme Tailwind CSS. J'ai porté une attention particulière à la qualité du code, à la sécurité (authentification, autorisations), à la gestion des erreurs et à l'expérience utilisateur. Le défi rencontré avec Firebase Storage et le contournement mis en place illustrent également ma capacité à résoudre des problèmes techniques concrets. Je suis confiant que ce projet démontre les compétences requises pour le titre de Développeur Web.
