package com.ngoplatform.ngo.entity;

import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "ngo_profiles")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NgoProfile {

    @Id
    @GeneratedValue
    private UUID id;

    // Linked wallet user
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // -----------------------
    // BASIC LEGAL INFO
    // -----------------------

    private String ngoName;

    private String encryptedPan;

    private Boolean panVerified;

    private String registeredAddress;

    private String state;

    private String district;

    private String pinCode;

    private String contactEmail;

    private String contactPhone;

    // -----------------------
    // REGISTRATION DETAILS
    // -----------------------

    private String registrationType; // TRUST / SOCIETY / SECTION_8

    private String registrationNumber;

    private LocalDate incorporationDate;

    private String registrationCertificateCid;

    // -----------------------
    // TAX COMPLIANCE
    // -----------------------

    private String eightyGNumber;

    private LocalDate eightyGValidityDate;

    private String eightyGCertificateCid;

    private String twelveANumber;

    private String twelveACertificateCid;

    // -----------------------
    // SYSTEM FIELDS
    // -----------------------

    @Enumerated(EnumType.STRING)
    private OnboardingStatus onboardingStatus;

    private String masterApplicationCid; // Set only after final submit

    private String applicationTxHash;    // Blockchain tx hash

    private Boolean isVerified;          // Reflect on-chain state

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
    
	 // -----------------------
	 // TERMS & CONDITIONS
	 // -----------------------
	
	 private Boolean termsAccepted;
	
	 private LocalDateTime termsAcceptedAt;
	
	 private String termsVersion;
	
	 private String acceptedIpAddress;
	
	 private String acceptedUserAgent;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.onboardingStatus = OnboardingStatus.DRAFT;
        this.isVerified = false;
    }

    @PreUpdate
    public void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}