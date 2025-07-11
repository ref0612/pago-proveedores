package com.pullman.service;

import com.pullman.domain.User;
import com.pullman.repository.RolePrivilegeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthorizationService {
    
    @Autowired
    private RolePrivilegeRepository rolePrivilegeRepository;
    
    /**
     * Verifica si un usuario tiene un privilegio específico
     */
    public boolean hasPrivilege(User user, String privilegeName) {
        if (user == null || user.getRol() == null) {
            return false;
        }
        return rolePrivilegeRepository.hasPrivilege(user.getRol(), privilegeName);
    }
    
    /**
     * Verifica si un usuario puede realizar una acción en una categoría específica
     */
    public boolean canPerformAction(User user, String category, String action) {
        if (user == null || user.getRol() == null) {
            return false;
        }
        
        String privilegeName = category + "." + action;
        return rolePrivilegeRepository.hasPrivilege(user.getRol(), privilegeName);
    }
    
    /**
     * Verifica si un usuario puede ver una categoría específica
     */
    public boolean canViewCategory(User user, String category) {
        return canPerformAction(user, category, "view");
    }
    
    /**
     * Verifica si un usuario puede crear en una categoría específica
     */
    public boolean canCreateInCategory(User user, String category) {
        return canPerformAction(user, category, "create");
    }
    
    /**
     * Verifica si un usuario puede editar en una categoría específica
     */
    public boolean canEditInCategory(User user, String category) {
        return canPerformAction(user, category, "edit");
    }
    
    /**
     * Verifica si un usuario puede eliminar en una categoría específica
     */
    public boolean canDeleteInCategory(User user, String category) {
        return canPerformAction(user, category, "delete");
    }
    
    /**
     * Verifica si un usuario puede exportar en una categoría específica
     */
    public boolean canExportFromCategory(User user, String category) {
        return canPerformAction(user, category, "export");
    }
    
    /**
     * Verifica si un usuario puede importar en una categoría específica
     */
    public boolean canImportToCategory(User user, String category) {
        return canPerformAction(user, category, "import");
    }
    
    /**
     * Verifica si un usuario puede aprobar validaciones
     */
    public boolean canApproveValidations(User user) {
        return canPerformAction(user, "validations", "approve");
    }
    
    /**
     * Verifica si un usuario puede rechazar validaciones
     */
    public boolean canRejectValidations(User user) {
        return canPerformAction(user, "validations", "reject");
    }
    
    /**
     * Verifica si un usuario puede editar validaciones aprobadas
     */
    public boolean canEditApprovedValidations(User user) {
        return canPerformAction(user, "validations", "edit_approved");
    }
    
    /**
     * Verifica si un usuario puede subir comprobantes de pago
     */
    public boolean canUploadPaymentProof(User user) {
        return canPerformAction(user, "liquidations", "upload_proof");
    }
    
    /**
     * Verifica si un usuario puede descargar comprobantes de pago
     */
    public boolean canDownloadPaymentProof(User user) {
        return canPerformAction(user, "liquidations", "download_proof");
    }
    
    /**
     * Verifica si un usuario puede gestionar roles
     */
    public boolean canManageRoles(User user) {
        return canPerformAction(user, "users", "manage_roles");
    }
    
    /**
     * Verifica si un usuario puede gestionar privilegios
     */
    public boolean canManagePrivileges(User user) {
        return canPerformAction(user, "privileges", "manage");
    }
    
    /**
     * Obtiene todos los privilegios de un usuario
     */
    public java.util.List<String> getUserPrivileges(User user) {
        if (user == null || user.getRol() == null) {
            return java.util.Collections.emptyList();
        }
        
        return rolePrivilegeRepository.findPrivilegesByRole(user.getRol())
            .stream()
            .map(privilege -> privilege.getName())
            .collect(java.util.stream.Collectors.toList());
    }
} 