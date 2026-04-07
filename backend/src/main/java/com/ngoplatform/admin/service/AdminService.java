package com.ngoplatform.admin.service;

import com.ngoplatform.common.enums.CampaignStatus;
import com.ngoplatform.common.enums.MilestoneStatus;
import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.common.enums.Role;
import com.ngoplatform.common.util.EncryptionService;
import com.ngoplatform.common.util.FileEncryptionService;
import com.ngoplatform.donor.entity.BlockchainTransaction;
import com.ngoplatform.donor.repository.LedgerRepository;
import com.ngoplatform.external.ipfs.IpfsService;
import com.ngoplatform.ngo.dto.NgoDetailsResponse;
import com.ngoplatform.ngo.entity.Campaign;
import com.ngoplatform.ngo.entity.CampaignMilestone;
import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.ngo.repository.MilestoneRepository;
import com.ngoplatform.ngo.repository.NgoProfileRepository;
import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;
import com.ngoplatform.admin.dto.AdminActionRequest;
import com.ngoplatform.admin.dto.MilestoneResponseDTO;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.UUID;
import java.util.Objects;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final NgoProfileRepository ngoProfileRepository;
    private final MilestoneRepository milestoneRepository;
    private final UserRepository userRepository;
    private final IpfsService ipfsService;
    private final EncryptionService encryptionService;
    private final FileEncryptionService fileEncryptionService;
    private final LedgerRepository ledgerRepository; 

    @Value("${contracts.ngo-factory}")
    private String ngoFactoryAddress;

    @Value("${contracts.donation-manager}")
    private String donationManagerAddress;
    // --- SERVICE 1: NGO MANAGEMENT ---

    @Transactional(readOnly = true)
    public List<NgoDetailsResponse> getNGOPendingAction(OnboardingStatus status) {
        List<NgoProfile> profiles = ngoProfileRepository.findByOnboardingStatus(status);
        
        return profiles.stream().<NgoDetailsResponse>map(profile -> {
            try {
            	String wallet = (profile.getUser() != null) ? profile.getUser().getWalletAddress() : "N/A";
                // Reusing your established decryption logic
                String regDoc = decryptIpfsFile(profile.getRegistrationCertificateCid());
                String eightyGDoc = decryptIpfsFile(profile.getEightyGCertificateCid());
                String twelveADoc = decryptIpfsFile(profile.getTwelveACertificateCid());
                String decryptedPan = encryptionService.decrypt(profile.getEncryptedPan());

                return NgoDetailsResponse.builder()
                        .id(profile.getId())
                        .ngoName(profile.getNgoName())
                        .registrationNumber(profile.getRegistrationNumber())
                        .registrationType(profile.getRegistrationType())
                        .registeredAddress(profile.getRegisteredAddress())
                        .district(profile.getDistrict())
                        .state(profile.getState())
                        .pinCode(profile.getPinCode())
                        .contactEmail(profile.getContactEmail())
                        .contactPhone(profile.getContactPhone())
                        .panVerified(profile.getPanVerified())
                        .onboardingStatus(profile.getOnboardingStatus())
                        // Mapping the Base64 strings for the Frontend [cite: 2026-03-06]
                        .registrationCertificateBase64(regDoc)
                        .eightyGCertificateBase64(eightyGDoc)
                        .twelveACertificateBase64(twelveADoc)
                        .panNumber(decryptedPan)
                        .registrationNumber(profile.getRegistrationNumber())
                        .eightyGNumber(profile.getEightyGNumber())
                        .twelveANumber(profile.getTwelveANumber())
                        .walletAddress(wallet)
                        .build();
            } catch (Exception e) {
                // Log the error for specific profiles that fail decryption
                return null; 
            }
        })
        .filter(Objects::nonNull)
        .toList();
    }
    
    private String decryptIpfsFile(String cid) throws Exception {
        if (cid == null || cid.isEmpty()) return null;
        
        // 1. Get encrypted bytes from IPFS
        byte[] encryptedData = ipfsService.getFileBytes(cid);
        
        // 2. Decrypt using your existing encryption logic
        byte[] decryptedData = fileEncryptionService.decrypt(encryptedData);
        
        // 3. Convert to Base64 so the browser <img> or <iframe> can read it
        return Base64.getEncoder().encodeToString(decryptedData);
    }
    
    
    @Transactional
    public void processNgoVerification(UUID ngoId, AdminActionRequest request) {
        NgoProfile ngo = ngoProfileRepository.findById(ngoId)
                .orElseThrow(() -> new RuntimeException("NGO Profile not found"));

        if (request.isApprove()) {
            ngo.setOnboardingStatus(OnboardingStatus.APPROVED);
            if (request.getTransactionHash() != null) {
                BlockchainTransaction ledgerTx = BlockchainTransaction.builder()
                    .hash(request.getTransactionHash())
                    .sender("Admin: Platform")
                    .receiver(ngo.getUser().getWalletAddress())
                    .purpose("NGO Account Verified: " + ngo.getNgoName())
                    .category("admin")
                    .timestamp(LocalDateTime.now())
                    .build();
                ledgerRepository.save(ledgerTx);
            }
        } else {
            ngo.setOnboardingStatus(OnboardingStatus.REJECTED);
            ngo.setRejectionReason(request.getReason()); 
        }
        ngoProfileRepository.save(ngo);
    }

    // --- SERVICE 2: MILESTONE MANAGEMENT ---

    /**
     * Fetches all milestones currently in SUBMITTED state for Admin review.
     * Sorted by oldest first to ensure fair processing.
     */
    public List<MilestoneResponseDTO> getPendingMilestones() {
        List<CampaignMilestone> milestones = milestoneRepository.findPendingWithCampaign(MilestoneStatus.SUBMITTED);

        return milestones.stream().map(m -> MilestoneResponseDTO.builder()
                .id(m.getId())
                .title(m.getTitle())
                .milestoneNumber(m.getMilestoneNumber())
                .amount(m.getAmount())
                .status(m.getStatus().name())
                .proofDescription(m.getProofDescription())
                .masterIpfsHash(m.getMasterIpfsHash())
                .submissionDate(m.getSubmissionDate() != null ? m.getSubmissionDate().toString() : null)
                .campaign(MilestoneResponseDTO.CampaignMinInfo.builder()
                        .title(m.getCampaign().getTitle()) // 👈 Explicitly pulling the title
                        .blockchainCampaignId(m.getCampaign().getBlockchainCampaignId())
                        .build())
                .build()
        ).toList();
    }

    @Transactional
    public void processMilestoneVerification(UUID milestoneId, AdminActionRequest request) {
        // 1. Fetch the milestone whose PROOF is being reviewed (e.g., Milestone 1)
        CampaignMilestone proofMilestone = milestoneRepository.findById(milestoneId)
                .orElseThrow(() -> new RuntimeException("Milestone not found"));

        Campaign campaign = proofMilestone.getCampaign();

        if (request.isApprove()) {
            // 2. Mark the milestone being reviewed as APPROVED (The task is verified)
            proofMilestone.setStatus(MilestoneStatus.APPROVED);

            // 3. Find the NEXT milestone to release its funds (e.g., Milestone 2)
            int nextMilestoneNumber = proofMilestone.getMilestoneNumber() + 1;
            
            campaign.getMilestones().stream()
                .filter(m -> m.getMilestoneNumber() == nextMilestoneNumber)
                .findFirst()
                .ifPresentOrElse(next -> {
                    // RELEASE the next milestone's funds
                    next.setStatus(MilestoneStatus.RELEASED);
                    System.out.println("Unlocked & Released Milestone " + nextMilestoneNumber);
                }, () -> {
                    // If there is no next milestone, the campaign is finished
                    campaign.setStatus(CampaignStatus.COMPLETED);
                    System.out.println("Final proof verified. Campaign marked COMPLETED.");
                });
            
            if(request.getTransactionHash() != null) {
                BlockchainTransaction ledgerTx = BlockchainTransaction.builder()
                    .hash(request.getTransactionHash())
                    .sender("Admin: Platform")
                    .receiver(campaign.getNgoProfile().getUser().getWalletAddress())
                    .purpose("Funds Released for Milestone " + proofMilestone.getMilestoneNumber() + " - " + campaign.getTitle())
                    .category("admin")
                    .timestamp(LocalDateTime.now())
                    .build();
                ledgerRepository.save(ledgerTx);
            }

        } else {
            // 4. Handle Rejection (NGO must fix the proof for the CURRENT milestone)
            proofMilestone.setStatus(MilestoneStatus.REJECTED);
            proofMilestone.setRejectionReason(request.getReason());
        }

        milestoneRepository.saveAndFlush(proofMilestone);
    }
    

    public List<User> getAllVerifiers() {
        return userRepository.findByRole(Role.VERIFIER);
    }

    @Transactional
    public void addVerifier(String walletAddress,String txHash) {
            User user = userRepository.findByWalletAddress(walletAddress)
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setWalletAddress(walletAddress);
                        return newUser;
                    });
            
            user.setRole(Role.VERIFIER);
            userRepository.save(user); 
            
            BlockchainTransaction ledgerTx = BlockchainTransaction.builder()
                    .hash(txHash)
                    .sender("Admin: Platform")
                    .receiver(walletAddress)
                    .purpose("Network Verifier Added: " + walletAddress)
                    .category("admin")
                    .timestamp(LocalDateTime.now())
                    .build();
            ledgerRepository.save(ledgerTx);
    }

    @Transactional
    public void removeVerifier(UUID userId,String txHash) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        // Downgrade to GUEST or DONOR role [cite: 2026-03-06]
        user.setRole(Role.GUEST); 
        userRepository.save(user);
        
        BlockchainTransaction ledgerTx = BlockchainTransaction.builder()
                .hash(txHash)
                .sender("Admin: Platform")
                .receiver(user.getWalletAddress())
                .purpose("Network Verifier Removed: " + user.getWalletAddress())
                .category("admin")
                .timestamp(LocalDateTime.now())
                .build();
        ledgerRepository.save(ledgerTx);
    }
}