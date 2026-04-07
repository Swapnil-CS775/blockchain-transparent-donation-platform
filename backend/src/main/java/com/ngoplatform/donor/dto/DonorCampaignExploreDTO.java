package com.ngoplatform.donor.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.ngoplatform.common.enums.CampaignStatus;
import com.ngoplatform.common.enums.MilestoneStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DonorCampaignExploreDTO {
    private UUID id;
    private Long blockchainCampaignId;
    private String title;
    private String ngoName;
    private String description;
    private String category;
    private String coverImageCid;
    private BigDecimal targetAmount;
    private BigDecimal raisedAmount;
    private CampaignStatus status;
    private LocalDateTime createdAt;
    private List<MilestoneInfoDTO> milestones;

    @Data
    @Builder
    public static class MilestoneInfoDTO {
        private UUID id;
        private int milestoneNumber;
        private MilestoneStatus status;
        private double percentage;
    }
}