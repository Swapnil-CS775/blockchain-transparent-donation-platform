package com.ngoplatform.donor.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.ngoplatform.donor.entity.DonationHistory;
import com.ngoplatform.donor.entity.DonorProfile;

public interface DonationRepository extends JpaRepository<DonationHistory, UUID> {
	List<DonationHistory> findByCampaign_NgoProfile_IdOrderByDonationDateDesc(UUID ngoId);
	List<DonationHistory> findByDonorProfile_IdOrderByDonationDateDesc(UUID donorId);
	
	@Query("SELECT SUM(d.amount) FROM DonationHistory d WHERE d.donorProfile.id = :profileId")
    BigDecimal sumAmountByDonorProfile(@Param("profileId") UUID profileId);

    @Query("SELECT COUNT(DISTINCT d.campaign.ngoProfile.id) FROM DonationHistory d WHERE d.donorProfile.id = :profileId")
    Long countDistinctNgoByDonorProfile(@Param("profileId") UUID profileId);

    @Query("SELECT d.campaign.category, SUM(d.amount) FROM DonationHistory d " +
           "WHERE d.donorProfile.id = :profileId GROUP BY d.campaign.category")
    List<Object[]> getCategoryStats(@Param("profileId") UUID profileId);

    // ✨ This query handles the March, April, May, June momentum
    @Query("SELECT FUNCTION('MONTHNAME', d.donationDate), SUM(d.amount) " +
           "FROM DonationHistory d WHERE d.donorProfile.id = :profileId " +
           "GROUP BY FUNCTION('MONTHNAME', d.donationDate)")
    List<Object[]> getMonthlyStats(@Param("profileId") UUID profileId);

    // ✨ Real Milestone Verification Logic
    @Query("SELECT COUNT(m) FROM CampaignMilestone m " +
           "WHERE m.campaign.id IN (SELECT DISTINCT d.campaign.id FROM DonationHistory d WHERE d.donorProfile.id = :profileId) " +
           "AND m.status = 'APPROVED'")
    Long countVerifiedMilestonesForDonor(@Param("profileId") UUID profileId);
    
    Long countByDonorProfile_Id(UUID profileId);
    

    // 2. For the Reputation Module (Only donations where a donor has submitted a rating)
    // Spring translates "AlreadyRatedTrue" into "WHERE already_rated = 1"
    List<DonationHistory> findByCampaign_NgoProfile_IdAndAlreadyRatedTrue(UUID ngoId);
    
    // --- Additional Helper for the Stats Dashboard ---
    @Query("SELECT COUNT(d) FROM DonationHistory d WHERE d.campaign.ngoProfile.id = :ngoId AND d.alreadyRated = true")
    Long countTotalReviewsByNgo(@Param("ngoId") UUID ngoId);
}
