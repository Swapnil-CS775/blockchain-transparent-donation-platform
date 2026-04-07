package com.ngoplatform.ngo.repository;

import com.ngoplatform.common.enums.MilestoneStatus;
import com.ngoplatform.ngo.entity.CampaignMilestone;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MilestoneRepository extends JpaRepository<CampaignMilestone, UUID> {
	@Query("SELECT m FROM CampaignMilestone m JOIN FETCH m.campaign WHERE m.status = :status ORDER BY m.submissionDate ASC")
    List<CampaignMilestone> findPendingWithCampaign(@Param("status") MilestoneStatus status);

    List<CampaignMilestone> findByStatusOrderBySubmissionDateAsc(MilestoneStatus status);
}