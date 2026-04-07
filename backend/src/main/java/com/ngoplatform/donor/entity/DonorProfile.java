package com.ngoplatform.donor.entity;

import com.ngoplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "donor_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DonorProfile {

    @Id
    @GeneratedValue
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;
    
    @Column(name = "total_donated", precision = 18, scale = 2)
    private BigDecimal totalDonated = BigDecimal.ZERO;

    private String fullName;

    private String email;

    private String country;

    private String panNumber;

    private Boolean panVerified;
    
    private Boolean termsAccepted;
    
    private LocalDateTime termsAcceptedAt;
    
    private String termsVersion;
    
    private String acceptedIpAddress;
    
    private String acceptedUserAgent;

    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}