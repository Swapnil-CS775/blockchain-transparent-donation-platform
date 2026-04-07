package com.ngoplatform.donor.dto;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class CampaignSummaryDTO {
    private UUID id;
    private String title;
    private String description;
    private BigDecimal targetAmount;
    private BigDecimal raisedAmount;
    private String category;
    private String coverImageCid; // IPFS hash for the image
    private String status;
    private Long blockchainCampaignId;
}