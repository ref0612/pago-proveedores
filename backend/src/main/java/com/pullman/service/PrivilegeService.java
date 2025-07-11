package com.pullman.service;

import com.pullman.domain.Privilege;
import com.pullman.domain.RolePrivilege;
import com.pullman.domain.User;
import com.pullman.repository.PrivilegeRepository;
import com.pullman.repository.RolePrivilegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@Service
public class PrivilegeService {
    
    @Autowired
    private PrivilegeRepository privilegeRepository;
    
    @Autowired
    private RolePrivilegeRepository rolePrivilegeRepository;

    // Métodos básicos CRUD
    public List<Privilege> findAll() {
        return privilegeRepository.findAll();
    }

    public Privilege findById(Long id) {
        return privilegeRepository.findById(id).orElse(null);
    }

    public Privilege save(Privilege privilege) {
        return privilegeRepository.save(privilege);
    }

    public void deleteById(Long id) {
        privilegeRepository.deleteById(id);
    }

    // Métodos específicos para privilegios
    public List<Privilege> findByCategory(String category) {
        return privilegeRepository.findByCategory(category);
    }

    public List<Privilege> findEnabled() {
        return privilegeRepository.findByEnabledTrue();
    }

    public List<String> findAllCategories() {
        return privilegeRepository.findAllCategories();
    }

    public List<String> findAllActions() {
        return privilegeRepository.findAllActions();
    }

    // Métodos para gestión de roles y privilegios
    public List<Privilege> findPrivilegesByRole(User.Role role) {
        return rolePrivilegeRepository.findPrivilegesByRole(role);
    }

    public boolean hasPrivilege(User.Role role, String privilegeName) {
        return rolePrivilegeRepository.hasPrivilege(role, privilegeName);
    }

    public Map<String, Boolean> getPrivilegesForRole(User.Role role) {
        List<Privilege> allPrivileges = privilegeRepository.findByEnabledTrue();
        List<Privilege> rolePrivileges = findPrivilegesByRole(role);
        
        Map<String, Boolean> privilegesMap = new HashMap<>();
        for (Privilege privilege : allPrivileges) {
            boolean hasPrivilege = rolePrivileges.stream()
                .anyMatch(rp -> rp.getName().equals(privilege.getName()));
            privilegesMap.put(privilege.getName(), hasPrivilege);
        }
        
        return privilegesMap;
    }

    public void updateRolePrivileges(User.Role role, Map<String, Boolean> privileges) {
        // Eliminar privilegios existentes del rol
        rolePrivilegeRepository.deleteByRole(role);
        
        // Agregar nuevos privilegios
        for (Map.Entry<String, Boolean> entry : privileges.entrySet()) {
            if (entry.getValue()) {
                Privilege privilege = privilegeRepository.findByName(entry.getKey());
                if (privilege != null) {
                    RolePrivilege rolePrivilege = new RolePrivilege();
                    rolePrivilege.setRole(role);
                    rolePrivilege.setPrivilege(privilege);
                    rolePrivilege.setGranted(true);
                    rolePrivilegeRepository.save(rolePrivilege);
                }
            }
        }
    }

    public Map<String, List<Privilege>> getPrivilegesByCategory() {
        List<Privilege> privileges = privilegeRepository.findByEnabledTrue();
        return privileges.stream()
            .collect(Collectors.groupingBy(Privilege::getCategory));
    }

    public List<Object[]> getPrivilegeStatsByRole() {
        return rolePrivilegeRepository.getPrivilegeStatsByRole();
    }

    // Método para inicializar privilegios por defecto
    public void initializeDefaultPrivileges() {
        if (privilegeRepository.count() == 0) {
            // Privilegios para Viajes
            createPrivilege("trips.view", "Ver viajes", "trips", "view");
            createPrivilege("trips.create", "Crear viajes", "trips", "create");
            createPrivilege("trips.edit", "Editar viajes", "trips", "edit");
            createPrivilege("trips.delete", "Eliminar viajes", "trips", "delete");
            createPrivilege("trips.import", "Importar viajes CSV", "trips", "import");
            createPrivilege("trips.export", "Exportar viajes", "trips", "export");

            // Privilegios para Zonas
            createPrivilege("zones.view", "Ver zonas", "zones", "view");
            createPrivilege("zones.create", "Crear zonas", "zones", "create");
            createPrivilege("zones.edit", "Editar zonas", "zones", "edit");
            createPrivilege("zones.delete", "Eliminar zonas", "zones", "delete");

            // Privilegios para Producción
            createPrivilege("productions.view", "Ver producción", "productions", "view");
            createPrivilege("productions.create", "Generar producción", "productions", "create");
            createPrivilege("productions.edit", "Editar producción", "productions", "edit");
            createPrivilege("productions.delete", "Eliminar producción", "productions", "delete");

            // Privilegios para Validación
            createPrivilege("validations.view", "Ver validaciones", "validations", "view");
            createPrivilege("validations.approve", "Aprobar validaciones", "validations", "approve");
            createPrivilege("validations.reject", "Rechazar validaciones", "validations", "reject");
            createPrivilege("validations.edit_approved", "Editar validaciones aprobadas", "validations", "edit_approved");

            // Privilegios para Liquidación
            createPrivilege("liquidations.view", "Ver liquidaciones", "liquidations", "view");
            createPrivilege("liquidations.create", "Crear liquidaciones", "liquidations", "create");
            createPrivilege("liquidations.edit", "Editar liquidaciones", "liquidations", "edit");
            createPrivilege("liquidations.delete", "Eliminar liquidaciones", "liquidations", "delete");
            createPrivilege("liquidations.upload_proof", "Subir comprobante de pago", "liquidations", "upload_proof");
            createPrivilege("liquidations.download_proof", "Descargar comprobante de pago", "liquidations", "download_proof");

            // Privilegios para Reportes
            createPrivilege("reports.view", "Ver reportes", "reports", "view");
            createPrivilege("reports.export_pdf", "Exportar reportes a PDF", "reports", "export_pdf");
            createPrivilege("reports.export_excel", "Exportar reportes a Excel", "reports", "export_excel");

            // Privilegios para Usuarios
            createPrivilege("users.view", "Ver usuarios", "users", "view");
            createPrivilege("users.create", "Crear usuarios", "users", "create");
            createPrivilege("users.edit", "Editar usuarios", "users", "edit");
            createPrivilege("users.delete", "Eliminar usuarios", "users", "delete");
            createPrivilege("users.manage_roles", "Gestionar roles de usuarios", "users", "manage_roles");

            // Privilegios para Privilegios
            createPrivilege("privileges.view", "Ver privilegios", "privileges", "view");
            createPrivilege("privileges.manage", "Gestionar privilegios", "privileges", "manage");

            // Privilegios para Auditoría
            createPrivilege("audit.view", "Ver auditoría", "audit", "view");
            createPrivilege("audit.export", "Exportar auditoría", "audit", "export");
        }
    }

    private void createPrivilege(String name, String description, String category, String action) {
        Privilege privilege = new Privilege();
        privilege.setName(name);
        privilege.setDescription(description);
        privilege.setCategory(category);
        privilege.setAction(action);
        privilege.setEnabled(true);
        privilegeRepository.save(privilege);
    }
} 