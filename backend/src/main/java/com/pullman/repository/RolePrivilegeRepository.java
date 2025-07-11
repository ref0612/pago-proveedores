package com.pullman.repository;

import com.pullman.domain.RolePrivilege;
import com.pullman.domain.Privilege;
import com.pullman.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RolePrivilegeRepository extends JpaRepository<RolePrivilege, Long> {
    
    // Buscar privilegios por rol
    List<RolePrivilege> findByRole(User.Role role);
    
    // Buscar privilegios concedidos por rol
    List<RolePrivilege> findByRoleAndGrantedTrue(User.Role role);
    
    // Buscar privilegios por rol y categoría
    @Query("SELECT rp FROM RolePrivilege rp WHERE rp.role = :role AND rp.privilege.category = :category")
    List<RolePrivilege> findByRoleAndCategory(@Param("role") User.Role role, @Param("category") String category);
    
    // Verificar si un rol tiene un privilegio específico
    @Query("SELECT COUNT(rp) > 0 FROM RolePrivilege rp WHERE rp.role = :role AND rp.privilege.name = :privilegeName AND rp.granted = true")
    boolean hasPrivilege(@Param("role") User.Role role, @Param("privilegeName") String privilegeName);
    
    // Obtener todos los privilegios de un rol
    @Query("SELECT rp.privilege FROM RolePrivilege rp WHERE rp.role = :role AND rp.granted = true")
    List<Privilege> findPrivilegesByRole(@Param("role") User.Role role);
    
    // Buscar por rol y privilegio específico
    RolePrivilege findByRoleAndPrivilege(User.Role role, Privilege privilege);
    
    // Eliminar todos los privilegios de un rol
    void deleteByRole(User.Role role);
    
    // Obtener estadísticas de privilegios por rol
    @Query("SELECT rp.role, COUNT(rp) FROM RolePrivilege rp WHERE rp.granted = true GROUP BY rp.role")
    List<Object[]> getPrivilegeStatsByRole();
} 