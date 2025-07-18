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
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Fixed Header */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <Header onToggleSidebar={toggleSidebar} />
      </div>
      
      <div className="flex flex-1 pt-16 h-full">
        {/* Sidebar */}
        <div 
          className={`fixed top-16 left-0 bottom-0 z-40 transition-all duration-300 ease-in-out ${
            sidebarOpen ? 'w-72' : 'w-0 md:w-20'
          }`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <Sidebar 
            isOpen={sidebarOpen} 
            onClose={closeSidebar} 
            isHovered={isHovered}
          />
        </div>
        
        {/* Main Content */}
        <div 
          className={`flex-1 overflow-auto transition-all duration-300 ease-in-out h-full ${
            (isHovered || sidebarOpen) ? 'md:ml-72' : 'md:ml-20'
          }`}
        >
          <main className="p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={closeSidebar}
        />
      )}
      
      {/* 1px trigger para mostrar el sidebar en desktop */}
      <div 
        className="fixed top-0 left-0 w-1 h-full z-40 lg:block hidden hover:cursor-e-resize"
        onMouseEnter={() => {
          setIsHovered(true);
          setSidebarOpen(true);
        }}
      />
    </div>
  );
}