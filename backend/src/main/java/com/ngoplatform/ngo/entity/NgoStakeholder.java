package com.ngoplatform.ngo.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ngo_stakeholders")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NgoStakeholder {

    @Id
    @GeneratedValue
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "ngo_profile_id", nullable = false)
    private NgoProfile ngoProfile;

    private String fullName;

    private String designation;

    private String encryptedPan;

    private Boolean panVerified;

    private String email;
    
    private String phone;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}