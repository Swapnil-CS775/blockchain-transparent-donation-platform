package com.ngoplatform.ngo.dto;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NgoReputationResponse {
    private ReputationSummary summary;
    private List<ReviewDTO> reviews;

    @Data
    @Builder
    public static class ReputationSummary {
        private Double avgRating;
        private Long totalReviews;
    }

    @Data
    @Builder
    public static class ReviewDTO {
        private String donorName;
        private String campaignTitle;
        private Integer rating;
        private String comment;
        private String txHash;
        private String date;
    }
}