package com.ngoplatform.donor.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DonorStatsDTO {
    private BigDecimal totalAmount;
    private Long ngoCount;
    private Long verifiedMilestones;
    private List<CategoryData> categories;
    private List<MonthlyData> monthlyHistory;
    private Long globalRank;      
    private Double trustFactor;

    @Data @AllArgsConstructor
    public static class CategoryData {
        private String name;
        private BigDecimal value;
    }

    @Data @AllArgsConstructor
    public static class MonthlyData {
        private String month;
        private BigDecimal amount;
    }
}