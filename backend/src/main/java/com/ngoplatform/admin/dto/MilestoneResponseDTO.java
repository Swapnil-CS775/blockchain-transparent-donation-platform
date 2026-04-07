package com.ngoplatform.admin.dto;

import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class MilestoneResponseDTO {
    private UUID id;
    private String title;
    private Integer milestoneNumber;
    private BigDecimal amount;
    private String status;
    private String proofDescription;
    private String masterIpfsHash;
    private String submissionDate;
    
    // ✨ This is what your React code is looking for: req.campaign.title
    private CampaignMinInfo campaign;

    @Data
    @Builder
    public static class CampaignMinInfo {
        private String title;
        private Long blockchainCampaignId;
    }
}