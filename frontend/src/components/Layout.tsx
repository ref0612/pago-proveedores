import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  // Manejar el scroll del body cuando el sidebar está abierto en móvil
  useEffect(() => {
    if (sidebarOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }

    return () => {
      document.body.classList.remove('sidebar-open');
    };
  }, [sidebarOpen]);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* Contenido principal */}
      <div 
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          (isHovered || sidebarOpen) ? 'lg:ml-72' : 'lg:ml-0'
        }`}
      >
        {/* Header móvil */}
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* Contenido de la página */}
        <main className="flex-1 overflow-auto p-4 lg:p-0 bg-[#F7F8FE]">
          {children}
        </main>
      </div>
      
      {/* 1px trigger para mostrar el sidebar */}
      <div 
        className="fixed top-0 left-0 w-1 h-full z-40 lg:block hidden hover:cursor-e-resize"
        onMouseEnter={() => {
          setIsHovered(true);
          setSidebarOpen(true);
        }}
      />
      
      {/* Overlay para móvil */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}
    </div>
  );
} 