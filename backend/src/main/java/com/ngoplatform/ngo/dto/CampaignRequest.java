package com.ngoplatform.ngo.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class CampaignRequest {
    private String title;
    private String description;
    private BigDecimal targetAmount;
    private String category;
    private String coverImageCid; 
    
    // Add these to match your React payload
    private Long blockchainCampaignId;
    private String transactionHash;
    private List<MilestoneRequest> milestones; 

    @Data
    public static class MilestoneRequest {
        private String title;
        private BigDecimal budget;
        private Integer percentage;
    }
}