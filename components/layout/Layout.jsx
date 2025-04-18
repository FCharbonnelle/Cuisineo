import React from 'react';
import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        {children}
      </main>
      {/* Footer pourrait être ajouté ici plus tard */}
      {/* <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600">
        © 2025 Cuisineo
      </footer> */}
    </div>
  );
}

export default Layout; 