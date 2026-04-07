package com.ngoplatform.donor.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DonorHistoryDTO {
    private UUID id;
    private Long blockchainCampaignId;
    private String campaignTitle;
    private String ngoName;
    private BigDecimal amount;
    private List<MilestoneProofDTO> milestones;
    private boolean alreadyRated; // We can fetch this from the Reputation Contract later or DB
    private Integer onChainRating;

    @Data @AllArgsConstructor
    public static class MilestoneProofDTO {
        private String masterIpfsHash;
        private String status;
    }
}