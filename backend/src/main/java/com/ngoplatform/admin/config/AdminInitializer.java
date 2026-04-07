package com.ngoplatform.admin.config;

import java.util.UUID;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.ngoplatform.common.enums.Role;
import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) {
        String adminWallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

        if (!userRepository.existsByWalletAddress(adminWallet)) {
            User admin = new User();
            // REMOVE THIS LINE: admin.setId(UUID.randomUUID()); 
            
            admin.setWalletAddress(adminWallet);
            admin.setRole(Role.SUPER_ADMIN);
            
            // Let Hibernate generate the UUID automatically via @GeneratedValue
            userRepository.save(admin);
            System.out.println("SUPER ADMIN CREATED: " + adminWallet);
        }
    }
}
