package com.ngoplatform.ngo.dto;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class NgoDonationResponse {
    private List<DonationDetailDTO> history;

    @Data
    @Builder
    public static class DonationDetailDTO {
        private String donorName;
        private String panNumber;
        private String transactionHash;
        private String donationDate; // Formatted as "dd MMM yyyy, HH:mm"
        private BigDecimal amount;
        private String campaignTitle;
    }
}