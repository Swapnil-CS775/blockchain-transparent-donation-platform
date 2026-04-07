package com.ngoplatform.ngo.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.ngoplatform.common.enums.MilestoneStatus;

@Entity
@Table(name = "campaign_milestones")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CampaignMilestone {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(columnDefinition = "BINARY(16)")
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false, columnDefinition = "BINARY(16)")
    @JsonIgnore
    private Campaign campaign;

    private String title;
    private Integer milestoneNumber; 
    private BigDecimal amount;
    private Integer percentage; 

    // --- UPDATED FIELDS FOR BLOCKCHAIN SYNC ---
    
    @Column(length = 1000)
    private String proofDescription; // Impact description from the form

    private String masterIpfsHash; // Stores the Master JSON CID (bundling all 3 files)
    
    private String blockchainTxHash; // Stores the Ethereum transaction hash

    private LocalDateTime submissionDate; // Useful for NGO audit logs
    
    @Column(length = 1000)
    private String rejectionReason;
    
    @Enumerated(EnumType.STRING)
    private MilestoneStatus status; 
}