package com.ngoplatform.donor.service;

import com.ngoplatform.common.enums.AccountStatus;
import com.ngoplatform.common.enums.CampaignStatus;
import com.ngoplatform.common.enums.MilestoneStatus;
import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.common.enums.Role;
import com.ngoplatform.common.util.EncryptionService;
import com.ngoplatform.donor.dto.CampaignSummaryDTO;
import com.ngoplatform.donor.dto.DonationRequestDTO;
import com.ngoplatform.donor.dto.DonorCampaignExploreDTO;
import com.ngoplatform.donor.dto.DonorHistoryDTO;
import com.ngoplatform.donor.dto.DonorRegistrationDto;
import com.ngoplatform.donor.dto.DonorStatsDTO;
import com.ngoplatform.donor.dto.NgoFullDetailDTO;
import com.ngoplatform.donor.dto.NgoSummaryDTO;
import com.ngoplatform.donor.dto.RatingRequestDTO;
import com.ngoplatform.donor.entity.BlockchainTransaction;
import com.ngoplatform.donor.entity.DonationHistory;
import com.ngoplatform.donor.entity.DonorProfile;
import com.ngoplatform.donor.repository.DonationRepository;
import com.ngoplatform.donor.repository.DonorProfileRepository;
import com.ngoplatform.donor.repository.LedgerRepository;
import com.ngoplatform.external.signzy.SignzyService;
import com.ngoplatform.external.signzy.dto.PanVerificationRequest;
import com.ngoplatform.external.signzy.dto.PanVerificationResponse;
import com.ngoplatform.ngo.entity.Campaign;
import com.ngoplatform.ngo.entity.CampaignMilestone;
import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.ngo.repository.CampaignRepository;
import com.ngoplatform.ngo.repository.NgoProfileRepository;
import com.ngoplatform.security.jwt.JwtService;
import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final JwtService jwtService;

    private final DonorProfileRepository donorRepository;
    private final UserRepository userRepository;
    private final SignzyService signzyService;
    private final EncryptionService encryptionService;
    private final NgoProfileRepository ngoRepository;
    private final CampaignRepository campaignRepository;
    private final DonationRepository donationRepository; 
    private final LedgerRepository ledgerRepository;
    
    @Value("${contracts.reputation-manager}")
    private String reputationManagerAddress;

    @Value("${contracts.donation-manager}")
    private String donationManagerAddress;

 // Called by the "Verify" button
    public PanVerificationResponse onlyVerifyPan(PanVerificationRequest dto) {
        return signzyService.verifyPan(dto.getPanNumber(),dto.getName()); // Hits Signzy API
    }

    @Transactional
    public String registerDonor(User user, DonorRegistrationDto dto, String ip, String userAgent) {
        // 0. Check profile already exists
        if (donorRepository.existsByUser(user)) {
            throw new IllegalStateException("Donor profile already exists");
        }
        
        // 1. Legal Guard
        if (dto.getTermsAccepted() == null || !dto.getTermsAccepted()) {
            throw new IllegalStateException("Legal agreement must be accepted to proceed.");
        }

        // 2. Security Guard: Re-verify PAN
        var panResponse = signzyService.verifyPan(dto.getPanNumber(), dto.getFullName());
        if (panResponse == null || !panResponse.isValid()) {
            throw new IllegalArgumentException("PAN verification failed.");
        }

        // 3. Encrypt PAN
        String encryptedPan = encryptionService.encrypt(dto.getPanNumber());
        
        // 4. Update User Role & Status
        // REMOVED: user.setTokenVersion(...) -> Let @Version handle this!
        user.setRole(Role.DONOR);
        user.setAccountStatus(AccountStatus.ACTIVE);
        
        // Use saveAndFlush to sync the User state immediately
        userRepository.saveAndFlush(user);

        // 5. Save Profile
        DonorProfile profile = DonorProfile.builder()
                .user(user)
                .fullName(panResponse.getFullName()) 
                .email(dto.getEmail())
                .country(dto.getCountry())
                .panNumber(encryptedPan)
                .panVerified(true)
                .termsAccepted(true)
                .acceptedIpAddress(ip)
                .acceptedUserAgent(userAgent)
                .termsAcceptedAt(LocalDateTime.now())
                .termsVersion("v1.0")
                .build();

        donorRepository.save(profile);
        
        // Return fresh token with the new ROLE_DONOR
        return jwtService.generateToken(user);
    }
    
    
    public List<NgoSummaryDTO> getVerifiedNgosForExplore(String sortBy) {
        Sort sort;
        
        // Match the 'sortBy' values from your React frontend
        switch (sortBy) {
            case "newest":
                sort = Sort.by(Sort.Direction.DESC, "createdAt");
                break;
            case "activeCampaigns":
                sort = Sort.by(Sort.Direction.DESC, "activeCampaignsCount");
                break;
            case "reputationDesc":
            default:
                sort = Sort.by(Sort.Direction.DESC, "reputationScore");
                break;
        }

        // Only fetch APPROVED NGOs
        List<NgoProfile> profiles = ngoRepository.findByOnboardingStatus(OnboardingStatus.APPROVED, sort);

        return profiles.stream()
                .map(this::mapToSummaryDTO)
                .collect(Collectors.toList());
    }

    private NgoSummaryDTO mapToSummaryDTO(NgoProfile profile) {
        return NgoSummaryDTO.builder()
                .id(profile.getId())
                .walletAddress(profile.getUser().getWalletAddress())
                .ngoName(profile.getNgoName())
                .registrationType(profile.getRegistrationType()) // Or profile.getCategory()
                .registeredAddress(profile.getRegisteredAddress())
                .reputationScore(profile.getReputationScore())
                .activeCampaignsCount(profile.getActiveCampaignsCount())
                .build();
    }
    
    public NgoFullDetailDTO getNgoFullProfile(UUID ngoId) {
        NgoProfile ngo = ngoRepository.findById(ngoId)
                .orElseThrow(() -> new RuntimeException("NGO not found"));

        // Map campaigns - Assuming you have a Campaign entity linked
        List<CampaignSummaryDTO> activeCampaigns = campaignRepository.findByNgoProfile_Id(ngo.getId()).stream()
                .filter(c -> "ACTIVE".equals(c.getStatus().name()))
                .map(c -> CampaignSummaryDTO.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .description(c.getDescription())
                        .targetAmount(c.getTargetAmount())
                        .raisedAmount(c.getRaisedAmount())
                        .category(c.getCategory())
                        .targetAmount(c.getTargetAmount())
                        .coverImageCid(c.getCoverImageCid())
                        .blockchainCampaignId(c.getBlockchainCampaignId())
                        .build())
                .collect(Collectors.toList());
       
        for(int i=0;i<activeCampaigns.size();i++) {
        	System.out.println(activeCampaigns.get(i).getRaisedAmount());
        }
        return NgoFullDetailDTO.builder()
                .id(ngo.getId())
                .ngoName(ngo.getNgoName())
                .walletAddress(ngo.getUser().getWalletAddress())
                .registrationType(ngo.getRegistrationType())
                .registrationNumber(ngo.getRegistrationNumber())
                .incorporationDate(ngo.getIncorporationDate())
                .registeredAddress(ngo.getRegisteredAddress())
                .state(ngo.getState())
                .district(ngo.getDistrict())
                .pinCode(ngo.getPinCode())
                .contactEmail(ngo.getContactEmail())
                .contactPhone(ngo.getContactPhone())
                .reputationScore(ngo.getReputationScore())
                .activeCampaignsCount(ngo.getActiveCampaignsCount())
                .isVerified(ngo.getIsVerified())
                // Logic to check if tax benefits are available
                .has80G(ngo.getEightyGNumber() != null && !ngo.getEightyGNumber().isEmpty())
                .has12A(ngo.getTwelveANumber() != null && !ngo.getTwelveANumber().isEmpty())
                .campaigns(activeCampaigns)
                .build();
    }
    
    
    @Transactional
    public void processDonation(DonationRequestDTO dto) {
        // 1. Fetch Campaign
        Campaign campaign = campaignRepository.findById(dto.getCampaignId())
                .orElseThrow(() -> new RuntimeException("Campaign not found"));

        // ✨ NEW: Fetch the DonorProfile using the wallet address from the DTO
        // Ensure your DonorRepository has findByWalletAddress()
        DonorProfile donor = donorRepository.findByUser_WalletAddress(dto.getDonorAddress())
                .orElseThrow(() -> new RuntimeException("Donor Profile not found for address: " + dto.getDonorAddress()));

        BigDecimal donationAmount = new BigDecimal(dto.getAmount());

        // 2. Update Campaign Logic
        campaign.setRaisedAmount(campaign.getRaisedAmount().add(donationAmount));
        
        BigDecimal currentTotal = donor.getTotalDonated() != null ? donor.getTotalDonated() : BigDecimal.ZERO;
        donor.setTotalDonated(currentTotal.add(donationAmount));
        
        // Milestone 1 Auto-Release Logic
        CampaignMilestone milestone1 = campaign.getMilestones().stream()
                .filter(m -> m.getMilestoneNumber() == 1)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Milestone 1 data missing in DB"));
        
        if (!campaign.isFirstMilestonePaid() && 
                campaign.getRaisedAmount().compareTo(milestone1.getAmount()) >= 0) {
                campaign.setFirstMilestonePaid(true);
                milestone1.setStatus(MilestoneStatus.RELEASED);
            }
        
        // Status Sync
        if (campaign.getRaisedAmount().compareTo(campaign.getTargetAmount()) >= 0) {
            campaign.setStatus(CampaignStatus.FUNDED);
        } else {
            campaign.setStatus(CampaignStatus.ACTIVE);
        }

        // 3. Save History with FULL CONSISTENCY
        DonationHistory history = new DonationHistory();
        history.setCampaign(campaign);
        history.setBlockchainCampaignId(dto.getBlockchainCampaignId());
        history.setDonorProfile(donor); // ✨ CRITICAL: Links the Donor for the NGO view
        history.setDonorAddress(dto.getDonorAddress());
        history.setAmount(donationAmount);
        history.setTransactionHash(dto.getTransactionHash());
        history.setStatus("SUCCESS"); // ✨ Set the status from DTO
        
        // Keep your dates consistent
        LocalDateTime now = LocalDateTime.now();
        history.setDonationDate(now);
        history.setTimestamp(now);
        
        campaignRepository.save(campaign);
        donationRepository.save(history); 
        
        BlockchainTransaction tx = BlockchainTransaction.builder()
        	    .hash(dto.getTransactionHash())
        	    .sender(dto.getDonorAddress())
        	    .receiver(campaign.getNgoProfile().getUser().getWalletAddress())
        	    .purpose("Campaign donation: " + campaign.getTitle())
        	    .category("donation")
        	    .timestamp(LocalDateTime.now())
        	    .build();

        	ledgerRepository.save(tx);
    }
    
    public List<DonorCampaignExploreDTO> getCampaignsByStatus(CampaignStatus status) {
        return campaignRepository.findByStatusOrderByCreatedAtDesc(status).stream()
            .map(c -> DonorCampaignExploreDTO.builder()
                .id(c.getId())
                .blockchainCampaignId(c.getBlockchainCampaignId())
                .title(c.getTitle())
                .ngoName(c.getNgoProfile().getNgoName())
                .description(c.getDescription())
                .category(c.getCategory())
                .coverImageCid(c.getCoverImageCid())
                .targetAmount(c.getTargetAmount())
                .raisedAmount(c.getRaisedAmount())
                .status(c.getStatus())
                .createdAt(c.getCreatedAt())
                .milestones(c.getMilestones().stream().map(m -> 
                    DonorCampaignExploreDTO.MilestoneInfoDTO.builder()
                        .id(m.getId())
                        .milestoneNumber(m.getMilestoneNumber())
                        .status(m.getStatus())
                        .percentage(m.getPercentage())
                        .build()
                ).collect(Collectors.toList()))
                .build())
            .collect(Collectors.toList());
    }
    
    
    public List<DonorHistoryDTO> getDonorHistory(UUID userId) {
    	DonorProfile profile = donorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Donor Profile not found for User: " + userId));
        List<DonationHistory> history = donationRepository.findByDonorProfile_IdOrderByDonationDateDesc(profile.getId());
        
        return history.stream().map(h -> {
            Campaign c = h.getCampaign();
            
            return DonorHistoryDTO.builder()
                .id(h.getId())
                .blockchainCampaignId(h.getBlockchainCampaignId())
                .campaignTitle(c.getTitle())
                .ngoName(c.getNgoProfile().getNgoName())
                .amount(h.getAmount())
                // ✨ Add these two fields to your DTO if they aren't there!
                .alreadyRated(h.isAlreadyRated()) 
                .onChainRating(h.getRating())
                .milestones(c.getMilestones().stream()
                	    .map(m -> new DonorHistoryDTO.MilestoneProofDTO(
                	        m.getMasterIpfsHash(), 
                	        m.getStatus() != null ? m.getStatus().name() : "LOCKED" // ✨ Prevents the crash
                	    ))
                	    .collect(Collectors.toList()))
                .build();
        }).collect(Collectors.toList());
    }
    
    public DonorStatsDTO getDonorStats(UUID userId) {
        // 1. Fetch Profile and IDs
        DonorProfile profile = donorRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        UUID profileId = profile.getId();
        
        // 2. Financial Totals
        BigDecimal total = donationRepository.sumAmountByDonorProfile(profileId);
        total = (total != null) ? total : BigDecimal.ZERO;
        Long ngoCount = donationRepository.countDistinctNgoByDonorProfile(profileId);

        // 3. Dynamic Trust Factor Calculation
        // Logic: Base 5.0 + (Unique NGOs * 1.0) + (Total Donations / 5)
        Long totalDonations = donationRepository.countByDonorProfile_Id(profileId);
        double trustCalc = 5.0 + Math.min(ngoCount * 1.0, 3.0) + Math.min((totalDonations / 5.0), 2.0);
        Double trustFactor = Math.min(trustCalc, 10.0);

        // 4. Global Rank Calculation
        // Uses the new totalDonated field in DonorProfile
        Long rank = donorRepository.countByTotalDonatedGreaterThan(total) + 1;

        // 5. Category Analytics (Pie Chart)
        List<Object[]> catRows = donationRepository.getCategoryStats(profileId);
        List<DonorStatsDTO.CategoryData> categories = catRows.stream()
            .map(row -> new DonorStatsDTO.CategoryData(row[0].toString(), (BigDecimal) row[1]))
            .collect(Collectors.toList());
        if (categories.isEmpty()) categories.add(new DonorStatsDTO.CategoryData("Impact Pending", BigDecimal.ONE));

        // 6. Monthly Momentum (Bar Chart for March, April, May, June)
        List<Object[]> monthRows = donationRepository.getMonthlyStats(profileId);
        List<DonorStatsDTO.MonthlyData> monthly = monthRows.stream()
            .map(row -> new DonorStatsDTO.MonthlyData(row[0].toString().substring(0, 3), (BigDecimal) row[1]))
            .collect(Collectors.toList());
        
        // If current month is empty, ensure it shows up as 0 for the chart
        if (monthly.isEmpty()) monthly.add(new DonorStatsDTO.MonthlyData("Mar", BigDecimal.ZERO));

        // 7. Verified Milestones
        Long verifiedMilestones = donationRepository.countVerifiedMilestonesForDonor(profileId);

        return DonorStatsDTO.builder()
                .totalAmount(total)
                .ngoCount(ngoCount != null ? ngoCount : 0L)
                .verifiedMilestones(verifiedMilestones != null ? verifiedMilestones : 0L)
                .globalRank(rank)
                .trustFactor(trustFactor)
                .categories(categories)
                .monthlyHistory(monthly)
                .build();
    }
    
    @Transactional // ✨ Ensures DB consistency
    public void saveDonationRating(UUID donationId, RatingRequestDTO dto) {
        DonationHistory donation = donationRepository.findById(donationId)
                .orElseThrow(() -> new RuntimeException("Donation not found"));

        // Prevent double rating
        if (donation.isAlreadyRated()) {
            System.out.println(">>> [WARN] User tried to rate already-rated donation: " + donationId);
            return; 
        }

        donation.setRating(dto.getStars());
        donation.setReviewDescription(dto.getDescription());
        donation.setAlreadyRated(true);

        donationRepository.save(donation);
        System.out.println(">>> [SUCCESS] Rating persisted for donation " + donationId);
        
        BlockchainTransaction ledgerTx = BlockchainTransaction.builder()
                .hash(dto.getTransactionHash())
                .sender(donation.getDonorProfile().getUser().getWalletAddress())
                .receiver(reputationManagerAddress) // Interaction with Reputation contract
                .purpose("NGO rated: " + donation.getCampaign().getNgoProfile().getNgoName() + " (" + dto.getStars() + " Stars)")
                .category("donation")
                .timestamp(LocalDateTime.now())
                .build();

        ledgerRepository.save(ledgerTx);
    }
}