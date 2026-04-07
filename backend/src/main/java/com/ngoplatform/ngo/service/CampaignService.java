package com.ngoplatform.ngo.service;

import com.ngoplatform.common.enums.CampaignStatus;
import com.ngoplatform.common.enums.MilestoneStatus;
import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.donor.entity.BlockchainTransaction;
import com.ngoplatform.donor.repository.LedgerRepository;
import com.ngoplatform.ngo.dto.CampaignRequest;
import com.ngoplatform.ngo.dto.MilestoneSyncRequest;
import com.ngoplatform.ngo.entity.*;
import com.ngoplatform.ngo.repository.CampaignRepository;
import com.ngoplatform.ngo.repository.MilestoneRepository;
import com.ngoplatform.ngo.repository.NgoProfileRepository;
import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CampaignService {

    private final CampaignRepository campaignRepository;
    private final NgoProfileRepository ngoProfileRepository;
    private final MilestoneRepository milestoneRepository;
    
    private final LedgerRepository ledgerRepository; 

    @Value("${contracts.donation-manager}")
    private String donationManagerAddress;

    @Transactional
    public Campaign createCampaign(UUID userId, CampaignRequest request) {
        NgoProfile ngo = ngoProfileRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("NGO Profile not found"));

        if (ngo.getOnboardingStatus() != OnboardingStatus.APPROVED) {
            throw new RuntimeException("Only APPROVED NGOs can create campaigns");
        }

        Campaign campaign = Campaign.builder()
                .ngoProfile(ngo)
                .title(request.getTitle())
                .description(request.getDescription())
                .targetAmount(request.getTargetAmount())
                .category(request.getCategory())
                .coverImageCid(request.getCoverImageCid())
                .blockchainCampaignId(request.getBlockchainCampaignId()) 
                .transactionHash(request.getTransactionHash())
                .status(CampaignStatus.ACTIVE)
                .raisedAmount(BigDecimal.ZERO)
                .createdAt(LocalDateTime.now())
                .build();

        List<CampaignMilestone> milestones = new ArrayList<>();
        for (int i = 0; i < request.getMilestones().size(); i++) {
            CampaignRequest.MilestoneRequest mReq = request.getMilestones().get(i);
            CampaignMilestone milestone = new CampaignMilestone();
            milestone.setCampaign(campaign);
            milestone.setTitle(mReq.getTitle()); // Match Title field in entity
            milestone.setAmount(mReq.getBudget()); 
            milestone.setPercentage(mReq.getPercentage());
            milestone.setStatus(MilestoneStatus.LOCKED);
            milestone.setMilestoneNumber(i + 1); 
            milestones.add(milestone);
        }

        campaign.setMilestones(milestones);
        Campaign savedCampaign = campaignRepository.save(campaign);
        long currentCount = ngo.getActiveCampaignsCount() != null ? ngo.getActiveCampaignsCount() : 0L;
        ngo.setActiveCampaignsCount(currentCount + 1);
        ngoProfileRepository.save(ngo);
        
        BlockchainTransaction ledgerTx = BlockchainTransaction.builder()
                .hash(request.getTransactionHash())
                .sender(ngo.getUser().getWalletAddress())
                .receiver(donationManagerAddress)
                .purpose("New campaign created: " + request.getTitle())
                .category("ngo")
                .timestamp(LocalDateTime.now())
                .build();

        ledgerRepository.save(ledgerTx);
        
        return savedCampaign;
    }
    
    public List<Campaign> getCampaignsByNgoUser(UUID userId) {
        // 1. Find the NGO Profile linked to this User UUID
        NgoProfile ngo = ngoProfileRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("NGO Profile not found"));

        // 2. Fetch campaigns with their milestones loaded (eagerly or via repository)
        return campaignRepository.findByNgoProfile_Id(ngo.getId());
    }
    
    @Transactional
    public void syncMilestoneProof(UUID userId, MilestoneSyncRequest request) {
        // 1. Verify NGO ownership
        NgoProfile ngo = ngoProfileRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("NGO Profile not found"));

        // 2. Locate the specific milestone across campaigns
        // Assuming you have a MilestoneRepository, or fetch via Campaign
        CampaignMilestone milestone = milestoneRepository.findById(request.getMilestoneId())
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        // 3. Security Check: Does this milestone belong to the logged-in NGO?
        if (!milestone.getCampaign().getNgoProfile().getId().equals(ngo.getId())) {
            throw new RuntimeException("Unauthorized: You do not own this campaign");
        }

        // 4. Update the record with Blockchain Data
        milestone.setMasterIpfsHash(request.getMasterCid()); // The bundled JSON CID
        milestone.setBlockchainTxHash(request.getTransactionHash()); // On-chain proof
        milestone.setStatus(MilestoneStatus.SUBMITTED); // Update enum
        milestone.setProofDescription(request.getDescription());
        
        milestoneRepository.save(milestone);
        BlockchainTransaction ledgerTx = BlockchainTransaction.builder()
                .hash(request.getTransactionHash())
                .sender(ngo.getUser().getWalletAddress())
                .receiver(donationManagerAddress)
                .purpose("Milestone " + milestone.getMilestoneNumber() + " proof submission for: " + milestone.getCampaign().getTitle())
                .category("ngo")
                .timestamp(LocalDateTime.now())
                .build();

        ledgerRepository.save(ledgerTx);
    }
    
    @Transactional
    public void markCampaignAsCompleted(UUID campaignId) {
        Campaign campaign = campaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        if (campaign.getStatus() == CampaignStatus.ACTIVE) {
            campaign.setStatus(CampaignStatus.COMPLETED);
            
            // DECREMENT THE COUNT
            NgoProfile profile = campaign.getNgoProfile();
            long currentCount = profile.getActiveCampaignsCount();
            profile.setActiveCampaignsCount(Math.max(0, currentCount - 1)); // Ensure it never goes below 0
            
            ngoProfileRepository.save(profile);
            campaignRepository.save(campaign);
        }
    }
}