import React, { useState, useEffect, useContext, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AlertContext } from '../App';
import UserEditModal from '../components/UserEditModal';
import { SpinnerWithText } from '../components/ui/Spinner';

interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'ADMIN' | 'VALIDADOR' | 'MIEMBRO' | 'INVITADO';
  activo: boolean;
  canViewTrips: boolean;
  canViewRecorridos: boolean;
  canViewProduccion: boolean;
  canViewValidacion: boolean;
  canViewLiquidacion: boolean;
  canViewReportes: boolean;
  canViewUsuarios: boolean;
}

const roles = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'VALIDADOR', label: 'Validador' },
  { value: 'MIEMBRO', label: 'Miembro' },
  { value: 'INVITADO', label: 'Invitado' },
];

export default function Usuarios() {
  const { user } = useAuth();
  const { setAlerts } = useContext(AlertContext);
  const [usuarios, setUsuarios] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [editError, setEditError] = useState('');
  const lastEditedId = useRef<number | null>(null);

  useEffect(() => {
    console.log('useEffect Usuarios');
    fetchUsers();
    // eslint-disable-next-line
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:8080/api/users');
      if (response.ok) {
        const data = await response.json();
        // Solo actualiza si los datos realmente cambiaron
        setUsuarios(prev => JSON.stringify(prev) !== JSON.stringify(data) ? data : prev);
      } else {
        setError('Error al cargar usuarios');
      }
    } catch (error) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (updatedUser: User) => {
    setEditError('');
    setUpdatingId(updatedUser.id);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${updatedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      if (response.ok) {
        const userFromServer = await response.json();
        const updated = userFromServer.user ? userFromServer.user : userFromServer;
        setUsuarios(prev => prev.map(u => u.id == updated.id ? updated : u));
        setEditingUser(null);
        setAlerts([{ message: 'Usuario actualizado correctamente.', type: 'success' }]);
      } else {
        setEditError('Error al actualizar usuario');
      }
    } catch (error) {
      setEditError('Error de conexión');
    } finally {
      setUpdatingId(null);
    }
  };

  // Habilitar todos los privilegios para un usuario (ADMIN)
  const handleEnableAllPrivileges = (userId: number) => {
    const userToUpdate = usuarios.find(u => u.id === userId);
    if (userToUpdate) {
      const updatedUser = {
        ...userToUpdate,
        canViewTrips: true,
        canViewRecorridos: true,
        canViewProduccion: true,
        canViewValidacion: true,
        canViewLiquidacion: true,
        canViewReportes: true,
        canViewUsuarios: true,
      };
      handleUpdateUser(updatedUser);
    }
  };

  const handleTogglePrivilege = (userId: number, privilege: keyof User, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const userToUpdate = usuarios.find(u => u.id === userId);
    if (userToUpdate) {
      const valorActual = (userToUpdate as any)[privilege];
      const nuevoValor = !valorActual;
      console.log(`Intentando cambiar privilegio '${privilege}' para usuario ${userId}: actual=${valorActual}, nuevo=${nuevoValor}`);
      // Solo actualizar si el valor realmente cambia
      if (valorActual !== nuevoValor) {
        const updatedUser = { ...userToUpdate, [privilege]: nuevoValor };
        console.log('Disparando update de usuario:', updatedUser);
        handleUpdateUser(updatedUser);
      } else {
        console.log('No se dispara update porque el valor no cambió');
      }
    }
  };

  if (!user?.canViewUsuarios) {
    return (
      <div className="p-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          No tienes permisos para acceder a esta sección.
        </div>
      </div>
    );
  }
  // Solo mostrar loading si no se está editando.
  if (loading && !editingUser) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <SpinnerWithText size="lg" text="Cargando usuarios..." />
      </div>
    );
  }
}