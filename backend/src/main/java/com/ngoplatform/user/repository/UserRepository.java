package com.ngoplatform.user.repository;

import com.ngoplatform.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import com.ngoplatform.common.enums.Role;


public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByWalletAddress(String walletAddress);

    boolean existsByWalletAddress(String walletAddress);
    
    List<User> findByRole(Role role);
}
