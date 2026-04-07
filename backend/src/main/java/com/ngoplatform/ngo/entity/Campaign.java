package com.ngoplatform.ngo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.ngoplatform.common.enums.CampaignStatus;

@Entity
@Table(name = "campaigns")
@Getter
@Setter
@NoArgsConstructor 
@AllArgsConstructor
@Builder
public class Campaign {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    private Long blockchainCampaignId; // The ID from DonationManager.sol

    @ManyToOne
    @JoinColumn(name = "ngo_id")
    private NgoProfile ngoProfile;

    private String title;
    @Column(columnDefinition = "TEXT")
    private String description;
    
    private BigDecimal targetAmount;
    private String category;
    private String coverImageCid; // Image stored on IPFS
    
    @Enumerated(EnumType.STRING)
    private CampaignStatus status; // ACTIVE, COMPLETED, HALTED
    private boolean firstMilestonePaid;

    private LocalDateTime createdAt;
    
    private String transactionHash;
    
    @Column(precision = 19, scale = 4)
    @Builder.Default
    private java.math.BigDecimal raisedAmount = java.math.BigDecimal.ZERO;

    @OneToMany(mappedBy = "campaign", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<CampaignMilestone> milestones;
}