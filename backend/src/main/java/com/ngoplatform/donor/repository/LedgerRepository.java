package com.ngoplatform.donor.repository;

import com.ngoplatform.donor.entity.BlockchainTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.UUID;

@Repository
public interface LedgerRepository extends JpaRepository<BlockchainTransaction, UUID> {
    
    // Fetch all transactions, newest at the top
    List<BlockchainTransaction> findAllByOrderByTimestampDesc();
    
    // Fetch by category (ngo, admin, donation) for your UI filters
    List<BlockchainTransaction> findByCategoryOrderByTimestampDesc(String category);
}