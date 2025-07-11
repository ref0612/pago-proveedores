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
      {/* Trigger mínimo en el extremo izquierdo */}
      <div 
        className="fixed top-0 left-0 w-2 h-full z-30 lg:block hidden"
        onMouseEnter={() => setIsHovered(true)}
      />
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={closeSidebar} 
        isHovered={isHovered}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />
      
      {/* Contenido principal */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isHovered ? 'lg:ml-0' : 'lg:ml-0'}`}>
        {/* Header móvil */}
        <Header onToggleSidebar={toggleSidebar} />
        
        {/* Contenido de la página */}
        <main className="flex-1 overflow-auto p-4 lg:p-0">
          {children}
        </main>
      </div>
    </div>
  );
} 