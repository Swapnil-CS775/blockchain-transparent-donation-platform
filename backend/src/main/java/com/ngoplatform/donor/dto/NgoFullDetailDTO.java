package com.ngoplatform.donor.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class NgoFullDetailDTO {
    private UUID id;
    private String ngoName;
    private String walletAddress;
    private String registrationType;
    private String registrationNumber;
    private LocalDate incorporationDate;
    private String registeredAddress;
    private String state;
    private String district;
    private String pinCode;
    
    // Contact Info
    private String contactEmail;
    private String contactPhone;
    
    // Legal Compliance Flags (Important for Donor Trust)
    private Boolean has80G;
    private Boolean has12A;
    private Boolean isVerified; // On-chain status
    
    private Double reputationScore;
    private Long activeCampaignsCount;
    
    private List<CampaignSummaryDTO> campaigns; 
}