package com.ngoplatform.donor.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class NgoSummaryDTO {
    private UUID id;
    private String ngoName;
    private String registrationType;
    private String registeredAddress;
    private Double reputationScore;
    private Long activeCampaignsCount;
    private String walletAddress;
}