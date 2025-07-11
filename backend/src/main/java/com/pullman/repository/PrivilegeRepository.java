package com.pullman.repository;

import com.pullman.domain.Privilege;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PrivilegeRepository extends JpaRepository<Privilege, Long> {
    
    // Buscar privilegios por categoría
    List<Privilege> findByCategory(String category);
    
    // Buscar privilegios habilitados
    List<Privilege> findByEnabledTrue();
    
    // Buscar privilegios por categoría y acción
    List<Privilege> findByCategoryAndAction(String category, String action);
    
    // Buscar privilegios por nombre
    Privilege findByName(String name);
    
    // Verificar si existe un privilegio por nombre
    boolean existsByName(String name);
    
    // Obtener todas las categorías únicas
    @Query("SELECT DISTINCT p.category FROM Privilege p ORDER BY p.category")
    List<String> findAllCategories();
    
    // Obtener todas las acciones únicas
    @Query("SELECT DISTINCT p.action FROM Privilege p ORDER BY p.action")
    List<String> findAllActions();
    
    // Buscar privilegios por múltiples categorías
    @Query("SELECT p FROM Privilege p WHERE p.category IN :categories")
    List<Privilege> findByCategories(@Param("categories") List<String> categories);
} 