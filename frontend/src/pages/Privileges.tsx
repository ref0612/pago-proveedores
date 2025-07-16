import React, { useState, useEffect } from 'react';
import { usePrivilegesApi, Privilege, RolePrivileges } from '../hooks/usePrivilegesApi';
import { SpinnerWithText } from '../components/ui/Spinner';

interface Role {
  value: string;
  label: string;
}

const Privileges: React.FC = () => {
  const {
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
    initializePrivileges,
    createPrivilege,
    updatePrivilege,
    deletePrivilege,
  } = usePrivilegesApi();

  const [selectedRole, setSelectedRole] = useState<string>('ADMIN');
  const [rolePrivileges, setRolePrivileges] = useState<RolePrivileges>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPrivilege, setEditingPrivilege] = useState<Privilege | null>(null);
  const [newPrivilege, setNewPrivilege] = useState({
    name: '',
    description: '',
    category: '',
    action: '',
    enabled: true,
  });

  const roles: Role[] = [
    { value: 'ADMIN', label: 'Administrador' },
    { value: 'VALIDATOR', label: 'Validador' },
    { value: 'OPERATOR', label: 'Operador' },
    { value: 'MEMBER', label: 'Miembro' },
    { value: 'GUEST', label: 'Invitado' },
  ];

  // Cargar privilegios del rol seleccionado
  useEffect(() => {
    const loadRolePrivileges = async () => {
      const privileges = await fetchRolePrivileges(selectedRole);
      setRolePrivileges(privileges);
    };
    loadRolePrivileges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRole]);

  // Manejar cambios en privilegios del rol
  const handlePrivilegeChange = (privilegeName: string, granted: boolean) => {
    setRolePrivileges(prev => ({
      ...prev,
      [privilegeName]: granted,
    }));
  };

  // Guardar cambios de privilegios del rol
  const handleSaveRolePrivileges = async () => {
    try {
      await updateRolePrivileges(selectedRole, rolePrivileges);
      alert('Privilegios actualizados exitosamente');
    } catch (err) {
      alert('Error al actualizar privilegios');
    }
  };

  // Inicializar privilegios por defecto
  const handleInitializePrivileges = async () => {
    try {
      await initializePrivileges();
      alert('Privilegios inicializados exitosamente');
    } catch (err) {
      alert('Error al inicializar privilegios');
    }
  };

  // Crear nuevo privilegio
  const handleCreatePrivilege = async () => {
    try {
      await createPrivilege(newPrivilege);
      setShowCreateModal(false);
      setNewPrivilege({
        name: '',
        description: '',
        category: '',
        action: '',
        enabled: true,
      });
      alert('Privilegio creado exitosamente');
    } catch (err) {
      alert('Error al crear privilegio');
    }
  };

  // Actualizar privilegio
  const handleUpdatePrivilege = async () => {
    if (!editingPrivilege) return;
    try {
      await updatePrivilege(editingPrivilege.id, editingPrivilege);
      setEditingPrivilege(null);
      alert('Privilegio actualizado exitosamente');
    } catch (err) {
      alert('Error al actualizar privilegio');
    }
  };

  // Eliminar privilegio
  const handleDeletePrivilege = async (id: number) => {
    if (window.confirm('¿Está seguro de que desea eliminar este privilegio?')) {
      try {
        await deletePrivilege(id);
        alert('Privilegio eliminado exitosamente');
      } catch (err) {
        alert('Error al eliminar privilegio');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-32">
        <SpinnerWithText size="lg" text="Cargando privilegios..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Manejo de Privilegios
        </h1>
        <p className="text-gray-600">
          Configure los privilegios para cada rol del sistema
        </p>
      </div>

      {/* Botones de acción */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handleInitializePrivileges}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Inicializar Privilegios por Defecto
        </button>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
        >
          Crear Nuevo Privilegio
        </button>
      </div>

      {/* Selector de rol */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seleccionar Rol:
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          {roles.map((role) => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>

      {/* Privilegios por categoría */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(privilegesByCategory).map(([category, categoryPrivileges]) => (
          <div key={category} className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 capitalize">
              {category}
            </h3>
            <div className="space-y-3">
              {categoryPrivileges.map((privilege) => (
                <div key={privilege.id} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{privilege.description}</div>
                    <div className="text-sm text-gray-500">{privilege.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={rolePrivileges[privilege.name] || false}
                        onChange={(e) => handlePrivilegeChange(privilege.name, e.target.checked)}
                        className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                      />
                      <span className="ml-2 text-sm text-gray-700">Concedido</span>
                    </label>
                    <button
                      onClick={() => setEditingPrivilege(privilege)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeletePrivilege(privilege.id)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Botón para guardar cambios */}
      <div className="mt-8">
        <button
          onClick={handleSaveRolePrivileges}
          className="bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
        >
          Guardar Cambios de Privilegios
        </button>
      </div>

      {/* Modal para crear privilegio */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Crear Nuevo Privilegio
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={newPrivilege.name}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <input
                    type="text"
                    value={newPrivilege.description}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={newPrivilege.category}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar categoría</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Acción</label>
                  <select
                    value={newPrivilege.action}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, action: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar acción</option>
                    {actions.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newPrivilege.enabled}
                    onChange={(e) => setNewPrivilege({ ...newPrivilege, enabled: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <label className="ml-2 text-sm text-gray-700">Habilitado</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreatePrivilege}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Crear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar privilegio */}
      {editingPrivilege && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Editar Privilegio
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={editingPrivilege.name}
                    onChange={(e) => setEditingPrivilege({ ...editingPrivilege, name: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descripción</label>
                  <input
                    type="text"
                    value={editingPrivilege.description}
                    onChange={(e) => setEditingPrivilege({ ...editingPrivilege, description: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <select
                    value={editingPrivilege.category}
                    onChange={(e) => setEditingPrivilege({ ...editingPrivilege, category: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Acción</label>
                  <select
                    value={editingPrivilege.action}
                    onChange={(e) => setEditingPrivilege({ ...editingPrivilege, action: e.target.value })}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    {actions.map((action) => (
                      <option key={action} value={action}>
                        {action}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editingPrivilege.enabled}
                    onChange={(e) => setEditingPrivilege({ ...editingPrivilege, enabled: e.target.checked })}
                    className="rounded border-gray-300 text-indigo-600"
                  />
                  <label className="ml-2 text-sm text-gray-700">Habilitado</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  onClick={() => setEditingPrivilege(null)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdatePrivilege}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Privileges; 