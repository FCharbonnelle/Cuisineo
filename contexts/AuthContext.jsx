import React, { createContext, useState, useEffect, useContext } from 'react';
// Fonctions Firebase Auth pour écouter l'état, créer, connecter et déconnecter un utilisateur
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
// Instance `auth` initialisée depuis notre configuration Firebase
import { auth } from '@/firebase/client';

// --- Création du Contexte --- 
// React Context permet de partager des données (ici, l'état d'authentification et les fonctions associées)
// à travers l'arbre de composants sans avoir à passer manuellement les props à chaque niveau.
const AuthContext = createContext();

// --- Composant Provider --- 
/**
 * Ce composant `AuthProvider` enveloppera notre application.
 * Il gère l'état de l'utilisateur connecté et fournit cet état ainsi que les fonctions
 * d'authentification (signup, login, logout) à tous les composants enfants via le `AuthContext`.
 */
export function AuthProvider({ children }) {
  // --- États Internes du Provider ---
  // `user`: Stocke l'objet utilisateur retourné par Firebase Auth (ou `null` si déconnecté).
  const [user, setUser] = useState(null); 
  // `loading`: Booléen pour indiquer si l'état initial d'authentification est encore en train d'être déterminé par Firebase.
  // Important pour éviter d'afficher brièvement un état "déconnecté" au premier chargement.
  const [loading, setLoading] = useState(true); 

  // --- Effet pour écouter les changements d'état d'authentification --- 
  useEffect(() => {
    // `onAuthStateChanged` est une fonction Firebase qui prend une callback.
    // Cette callback est appelée immédiatement avec l'état actuel, puis à chaque fois
    // que l'état de connexion de l'utilisateur change (connexion, déconnexion).
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth State Changed:", currentUser ? currentUser.uid : 'Déconnecté');
      // Met à jour l'état `user` avec l'objet utilisateur Firebase (ou `null`).
      setUser(currentUser);
      // Une fois que la callback a été appelée (même si l'utilisateur est null), 
      // on sait que l'état initial a été déterminé.
      setLoading(false);
    });

    // La fonction retournée par `useEffect` est une fonction de nettoyage.
    // Elle est appelée lorsque le composant `AuthProvider` est démonté.
    // Ici, elle permet de se désabonner de l'écouteur `onAuthStateChanged` pour éviter les fuites mémoire.
    return () => {
      console.log("Unsubscribing from onAuthStateChanged");
      unsubscribe();
    };
  // Le tableau de dépendances vide `[]` assure que cet effet ne s'exécute qu'une seule fois 
  // lors du montage initial du composant `AuthProvider`.
  }, []);

  // --- Fonctions d'authentification --- 
  // Ces fonctions enveloppent les appels Firebase Auth correspondants.
  // Elles sont fournies via le contexte pour être utilisées par d'autres composants (ex: AuthForm).

  /**
   * Crée un nouvel utilisateur avec email et mot de passe.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<UserCredential>} Une promesse résolue avec les informations de l'utilisateur créé.
   */
  const signup = (email, password) => {
    // Appelle directement la fonction Firebase.
    // La gestion des erreurs (try/catch) se fera dans le composant qui appelle cette fonction (AuthForm).
    return createUserWithEmailAndPassword(auth, email, password);
  };

  /**
   * Connecte un utilisateur existant avec email et mot de passe.
   * @param {string} email 
   * @param {string} password 
   * @returns {Promise<UserCredential>} Une promesse résolue avec les informations de l'utilisateur connecté.
   */
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  /**
   * Déconnecte l'utilisateur actuellement connecté.
   * @returns {Promise<void>} Une promesse résolue quand la déconnexion est terminée.
   */
  const logout = () => {
    return signOut(auth);
  };

  // --- Valeur fournie par le Contexte --- 
  // Objet contenant les données et fonctions que nous voulons rendre accessibles
  // aux composants qui utiliseront ce contexte.
  const value = {
    user,       // L'objet utilisateur Firebase (ou null)
    loading,    // L'état de chargement initial
    signup,     // La fonction pour s'inscrire
    login,      // La fonction pour se connecter
    logout,     // La fonction pour se déconnecter
  };

  // --- Rendu du Provider --- 
  return (
    // Le composant `AuthContext.Provider` rend la `value` accessible à tous ses `children`.
    <AuthContext.Provider value={value}>
      {/* Condition importante: Ne rend les composants enfants (le reste de l'application) 
          que lorsque l'état d'authentification initial a été chargé (`!loading`).
          Cela évite des problèmes où un composant essaierait d'accéder à `user` 
          avant qu'il ne soit défini, ou des affichages incorrects (ex: voir "Connexion" 
          brièvement même si on est déjà connecté). */}
      {!loading && children}
    </AuthContext.Provider>
  );
}

// --- Hook personnalisé pour utiliser le Contexte --- 
/**
 * Hook personnalisé `useAuth`.
 * Simplifie l'utilisation du contexte dans les composants.
 * Au lieu de faire `useContext(AuthContext)` partout, on fera simplement `useAuth()`.
 * @returns {Object} La valeur fournie par AuthContext (user, loading, signup, login, logout).
 */
export const useAuth = () => {
  // `useContext` est le hook React standard pour consommer une valeur de contexte.
  return useContext(AuthContext);
}; 