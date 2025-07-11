import { useState, useEffect } from 'react';
import { apiGet, apiPost } from '../services/api';

export interface Privilege {
  id: number;
  name: string;
  description: string;
  category: string;
  action: string;
  enabled: boolean;
}

export interface RolePrivileges {
  [key: string]: boolean;
}

export const usePrivilegesApi = () => {
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [privilegesByCategory, setPrivilegesByCategory] = useState<{[key: string]: Privilege[]}>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [actions, setActions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Obtener todos los privilegios
  const fetchPrivileges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet('/privileges');
      setPrivileges(response);
    } catch (err) {
      setError('Error al cargar privilegios');
      console.error('Error fetching privileges:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener privilegios agrupados por categoría
  const fetchPrivilegesByCategory = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiGet('/privileges/by-category');
      setPrivilegesByCategory(response);
    } catch (err) {
      setError('Error al cargar privilegios por categoría');
      console.error('Error fetching privileges by category:', err);
    } finally {
      setLoading(false);
    }
  };

  // Obtener categorías
  const fetchCategories = async () => {
    try {
      const response = await apiGet('/privileges/categories');
      setCategories(response);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  // Obtener acciones
  const fetchActions = async () => {
    try {
      const response = await apiGet('/privileges/actions');
      setActions(response);
    } catch (err) {
      console.error('Error fetching actions:', err);
    }
  };

  // Obtener privilegios de un rol
  const fetchRolePrivileges = async (role: string): Promise<RolePrivileges> => {
    try {
      const response = await apiGet(`/privileges/role/${role}`);
      return response;
    } catch (err) {
      console.error('Error fetching role privileges:', err);
      return {};
    }
  };

  // Actualizar privilegios de un rol
  const updateRolePrivileges = async (role: string, privileges: RolePrivileges) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(`/privileges/role/${role}`, privileges);
      return response;
    } catch (err) {
      setError('Error al actualizar privilegios del rol');
      console.error('Error updating role privileges:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Verificar si un rol tiene un privilegio
  const checkPrivilege = async (role: string, privilegeName: string): Promise<boolean> => {
    try {
      const response = await apiGet(`/privileges/check/${role}/${privilegeName}`);
      return response.hasPrivilege;
    } catch (err) {
      console.error('Error checking privilege:', err);
      return false;
    }
  };

  // Inicializar privilegios por defecto
  const initializePrivileges = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost('/privileges/initialize', {});
      await fetchPrivileges();
      await fetchPrivilegesByCategory();
      return response;
    } catch (err) {
      setError('Error al inicializar privilegios');
      console.error('Error initializing privileges:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Crear nuevo privilegio
  const createPrivilege = async (privilege: Omit<Privilege, 'id'>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost('/privileges', privilege);
      await fetchPrivileges();
      await fetchPrivilegesByCategory();
      return response;
    } catch (err) {
      setError('Error al crear privilegio');
      console.error('Error creating privilege:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Actualizar privilegio
  const updatePrivilege = async (id: number, privilege: Partial<Privilege>) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(`/privileges/${id}`, privilege);
      await fetchPrivileges();
      await fetchPrivilegesByCategory();
      return response;
    } catch (err) {
      setError('Error al actualizar privilegio');
      console.error('Error updating privilege:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Eliminar privilegio
  const deletePrivilege = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiPost(`/privileges/${id}/delete`, {});
      await fetchPrivileges();
      await fetchPrivilegesByCategory();
      return response;
    } catch (err) {
      setError('Error al eliminar privilegio');
      console.error('Error deleting privilege:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchPrivileges();
    fetchPrivilegesByCategory();
    fetchCategories();
    fetchActions();
  }, []);

  return {
    privileges,
    privilegesByCategory,
    categories,
    actions,
    loading,
    error,
    fetchPrivileges,
    fetchPrivilegesByCategory,
    fetchRolePrivileges,
    updateRolePrivileges,
    checkPrivilege,
    initializePrivileges,
    createPrivilege,
    updatePrivilege,
    deletePrivilege,
  };
}; 