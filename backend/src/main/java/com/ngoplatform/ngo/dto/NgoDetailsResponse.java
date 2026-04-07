package com.ngoplatform.ngo.dto;

import java.util.List;
import java.util.UUID;

import com.ngoplatform.common.enums.OnboardingStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NgoDetailsResponse {
	private UUID id;
    private String ngoName;
    private String registrationNumber;
    private String eightyGNumber;
    private String twelveANumber;
    private String registrationType;
    private String panNumber; // Now explicitly included
    private String contactEmail;
    private String contactPhone;
    private String state;
    private String district;
    private String pinCode;
    private Boolean panVerified;
    private String registeredAddress;
    private OnboardingStatus onboardingStatus;
    
    // Document CIDs
    // Decrypted Document Content (Base64 Strings)
    private String registrationCertificateBase64;
    private String eightyGCertificateBase64;
    private String twelveACertificateBase64;
    
    private String masterApplicationCid;
    
    private OnboardingStatus status;
    private String walletAddress;
    
    private List<StakeholderResponseDTO> stakeholders;
}
