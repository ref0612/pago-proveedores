package com.pullman;

import com.pullman.service.UserService;
import com.pullman.service.PrivilegeService;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Autowired;

@SpringBootApplication
public class PullmanPaymentSystemApplication implements CommandLineRunner {

    @Autowired
    private UserService userService;
    
    @Autowired
    private PrivilegeService privilegeService;

    public static void main(String[] args) {
        SpringApplication.run(PullmanPaymentSystemApplication.class, args);
    }

    @Override
    public void run(String... args) throws Exception {
        // Inicializar usuarios por defecto
        userService.initializeDefaultUsers();
        
        // Inicializar privilegios por defecto
        privilegeService.initializeDefaultPrivileges();
        
        System.out.println("Sistema Pullman Payment inicializado correctamente");
    }
} 