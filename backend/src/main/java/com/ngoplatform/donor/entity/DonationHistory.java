package com.ngoplatform.donor.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.ngoplatform.ngo.entity.Campaign;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Data;

@Entity
@Data
public class DonationHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donor_id", nullable = false)
    private DonorProfile donorProfile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private Campaign campaign;
    
    private LocalDateTime donationDate;
    
    private Long blockchainCampaignId; 
    
    @Column(name = "rating")
    private Integer rating;

    @Column(name = "review_description", length = 1000)
    private String reviewDescription;
    
    @Column(name = "already_rated")
    private boolean alreadyRated = false;
    
    private String donorAddress;
    private BigDecimal amount;
    private String transactionHash;
    private String status;
    private LocalDateTime timestamp;
}