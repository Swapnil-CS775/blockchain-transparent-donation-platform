package com.ngoplatform.ngo.repository;

import com.ngoplatform.common.enums.CampaignStatus;
import com.ngoplatform.ngo.entity.Campaign;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface CampaignRepository extends JpaRepository<Campaign, UUID> {
    List<Campaign> findByNgoProfile_Id(UUID ngoId);
    
    // ✨ Add this line to support the Donor Explore Feed
    List<Campaign> findByStatusOrderByCreatedAtDesc(CampaignStatus status);
    
    // Optional: If you want to search by title or category as well
    List<Campaign> findByTitleContainingIgnoreCaseAndStatus(String title, CampaignStatus status);
}																																