import React, { createContext, useState, useEffect, useContext } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase/client'; // Importer notre instance auth initialisée

// 1. Créer le Contexte
const AuthContext = createContext();

// 2. Créer le Provider (Composant qui englobera l'application)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); // L'utilisateur connecté (ou null)
  const [loading, setLoading] = useState(true); // État de chargement initial

  // Écouter les changements d'état d'authentification Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Met à jour l'état user avec l'utilisateur Firebase (ou null)
      setLoading(false); // Fin du chargement initial
    });

    // Nettoyer l'écouteur lors du démontage du composant
    return () => unsubscribe();
  }, []); // Ne s'exécute qu'une fois au montage

  // Fonctions pour l'authentification (simplifié pour l'instant)
  const signup = (email, password) => {
    // TODO: Ajouter plus de validation/gestion d'erreur robuste
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    // TODO: Ajouter plus de validation/gestion d'erreur robuste
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  // Valeur fournie par le contexte
  const value = {
    user,       // L'objet utilisateur Firebase (ou null)
    loading,    // Booléen indiquant si l'état initial est encore en chargement
    signup,
    login,
    logout,
  };

  // Ne rend les enfants que si le chargement initial est terminé
  // pour éviter les "flashs" d'état non authentifié
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

// 3. Créer un Hook personnalisé pour utiliser facilement le contexte
export const useAuth = () => {
  return useContext(AuthContext);
}; 