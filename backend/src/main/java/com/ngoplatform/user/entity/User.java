package com.ngoplatform.user.entity;

import com.ngoplatform.common.enums.AccountStatus;
import com.ngoplatform.common.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue
    private UUID id;

    @Column(name = "wallet_address", unique = true, nullable = false)
    private String walletAddress;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Enumerated(EnumType.STRING)
    @Column(name = "account_status", nullable = false)
    private AccountStatus accountStatus;

    // Only meaningful for NGO
    @Column(name = "is_verified")
    private Boolean isVerified;

    // Used for wallet login challenge
    @Column(name = "nonce")
    private String nonce;

    // Used for forced logout / token invalidation
    @Version
    @Column(name = "token_version")
    private Integer tokenVersion;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();

        if (this.role == null)
            this.role = Role.GUEST;

        if (this.accountStatus == null)
            this.accountStatus = AccountStatus.ACTIVE;

        if (this.isVerified == null)
            this.isVerified = false;

        if (this.tokenVersion == null)
            this.tokenVersion = 1;
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    
}
