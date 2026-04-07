package com.ngoplatform.donor.dto;
import lombok.Data;
import java.util.UUID;

@Data
public class DonationRequestDTO {
    private UUID campaignId;            // DB Reference
    private Long blockchainCampaignId;  // Contract Reference
    private String amount;              // String to avoid double precision issues
    private String donorAddress;
    private String transactionHash;
    private String status;
}