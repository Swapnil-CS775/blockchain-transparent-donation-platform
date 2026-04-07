package com.ngoplatform.donor.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "blockchain_ledger")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BlockchainTransaction {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String hash;         // The transaction hash from MetaMask

    private String sender;       // Wallet address of the person who started it
    private String receiver;     // Wallet address of the NGO or Contract
    private String purpose;      // e.g., "campaign creation", "donation"
    private String category;     // ngo, admin, or donation
    
    private LocalDateTime timestamp;

    // Helper for the frontend to show a clean date
    @Transient
    public String getFormattedDate() {
        return timestamp != null ? timestamp.toString().replace("T", " ").substring(0, 19) : "";
    }
}