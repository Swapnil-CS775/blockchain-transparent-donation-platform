package com.ngoplatform.ngo.service;

import com.ngoplatform.common.enums.AccountStatus;
import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.common.enums.Role;
import com.ngoplatform.common.util.EncryptionService;
import com.ngoplatform.common.util.FileEncryptionService;
import com.ngoplatform.donor.entity.BlockchainTransaction;
import com.ngoplatform.donor.entity.DonationHistory;
import com.ngoplatform.donor.repository.DonationRepository;
import com.ngoplatform.donor.repository.LedgerRepository;
import com.ngoplatform.external.ipfs.IpfsService;
import com.ngoplatform.external.signzy.SignzyService;
import com.ngoplatform.external.signzy.dto.PanVerificationRequest;
import com.ngoplatform.external.signzy.dto.PanVerificationResponse;
import com.ngoplatform.ngo.dto.NgoDetailsResponse;
import com.ngoplatform.ngo.dto.NgoDonationResponse;
import com.ngoplatform.ngo.dto.NgoRegistrationRequest;
import com.ngoplatform.ngo.dto.NgoReputationResponse;
import com.ngoplatform.ngo.dto.StakeholderDto;
import com.ngoplatform.ngo.dto.StakeholderResponseDTO;
import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.ngo.entity.NgoStakeholder;
import com.ngoplatform.ngo.repository.NgoProfileRepository;
import com.ngoplatform.ngo.repository.NgoStakeholderRepository;
import com.ngoplatform.security.jwt.JwtService;
import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.protocol.Web3j;

@Service
@RequiredArgsConstructor
public class NgoService {

    private final JwtService jwtService;
    private final NgoProfileRepository ngoRepository;
    private final UserRepository userRepository;
    private final SignzyService signzyService;
    private final EncryptionService encryptionService;
    private final FileEncryptionService fileEncryptionService;
    private final NgoStakeholderRepository stakeholderRepository;
    private final IpfsService ipfsService;
    private final Web3j web3j;
    private final DonationRepository donationRepository;
    private final LedgerRepository ledgerRepository;
    
    @Value("${contracts.ngo-factory}")
    private String ngoFactoryAddress;

    @Value("${contracts.donation-manager}")
    private String donationManagerAddress;

    
    public PanVerificationResponse verifyOnlyNgoPan(PanVerificationRequest dto) {
        // Logic: Call signzyService.verifyPan(pan, name)
        // For learning/dev, you can return a mock if signzy is disabled
        return signzyService.verifyPan(dto.getPanNumber(),dto.getName()); 
    }

    public PanVerificationResponse verifyOnlyStakeholderPan(PanVerificationRequest dto) {
        return signzyService.verifyPan(dto.getPanNumber(),dto.getName());
    }

    @Transactional
    public String registerNgo(User user, NgoRegistrationRequest request) throws Exception {
        // Validation: Ensure we aren't overwriting a role
    	// Allow if role is GUEST (new user) or NGO (existing draft)
        if (user.getRole() != Role.GUEST && user.getRole() != Role.NGO) {
            throw new RuntimeException("Only users with GUEST role can register as an NGO.");
        }

        // Encryption of sensitive data
        String encryptedPan = encryptionService.encrypt(request.getPanNumber());

        // Assign Role & Status
        if (user.getRole() == Role.GUEST) {
            user.setRole(Role.NGO);
            user.setAccountStatus(AccountStatus.PENDING);
            user = userRepository.saveAndFlush(user);
        }
        
        // Save/Update NGO Draft
        NgoProfile profile = ngoRepository.findByUser_Id(user.getId())
                .orElse(new NgoProfile());
        
        profile.setUser(user);
        profile.setNgoName(request.getNgoName());
        profile.setEncryptedPan(encryptedPan);
        profile.setPanVerified(true);
        profile.setRegisteredAddress(request.getRegisteredAddress());
        profile.setState(request.getState());
        profile.setDistrict(request.getDistrict());
        profile.setPinCode(request.getPinCode());
        profile.setContactEmail(request.getContactEmail());
        profile.setContactPhone(request.getContactPhone());
        profile.setRegistrationType(request.getRegistrationType());
        profile.setIncorporationDate(request.getIncorporationDate());
        profile.setEightyGValidityDate(request.getEightyGValidityDate());
        
        		
        // Mapping CIDs directly from the updated DTO
        profile.setRegistrationCertificateCid(request.getRegistrationCertificateCid());
        profile.setEightyGCertificateCid(request.getEightyGCertificateCid());
        profile.setTwelveACertificateCid(request.getTwelveACertificateCid());
        
        profile.setEightyGNumber(request.getEightyGNumber());
        profile.setTwelveANumber(request.getTwelveANumber());
        profile.setRegistrationNumber(request.getRegistrationNumber());
        
        profile.setOnboardingStatus(OnboardingStatus.DRAFT);

        ngoRepository.save(profile);
        return jwtService.generateToken(user);
    }

    @Transactional
    public void addStakeholder(User user, StakeholderDto dto) {
        NgoProfile profile = ngoRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalStateException("NGO profile not found. Complete Step 1-3 first."));

        String encryptedPan = encryptionService.encrypt(dto.getPanNumber());

        NgoStakeholder stakeholder = NgoStakeholder.builder()
                .ngoProfile(profile)
                .fullName(dto.getFullName())
                .designation(dto.getDesignation())
                .encryptedPan(encryptedPan)
                .panVerified(true)
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .build();

        stakeholderRepository.save(stakeholder);
    }
    
    @Transactional
    public String finalizeApplication(
            User user,
            boolean termsAccepted,
            String ipAddress,
            String userAgent
    ) throws Exception {
        if (user.getRole() != Role.NGO) {
            throw new RuntimeException("Not an NGO user");
        }

        if (!termsAccepted) {
            throw new RuntimeException("Terms must be accepted");
        }

        NgoProfile profile = ngoRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("NGO profile not found"));

        profile.setTermsAccepted(true);
        profile.setTermsAcceptedAt(LocalDateTime.now());
        profile.setTermsVersion("v1.0");
        profile.setAcceptedIpAddress(ipAddress);
        profile.setAcceptedUserAgent(userAgent);

        List<NgoStakeholder> stakeholders = stakeholderRepository.findByNgoProfile_Id(profile.getId());

        if (stakeholders.isEmpty()) {
            throw new RuntimeException("At least one stakeholder required");
        }

        // 1. Manually build a clean data structure to avoid Circular Reference loop
        Map<String, Object> masterApplication = new HashMap<>();
        masterApplication.put("ngoName", profile.getNgoName());
        masterApplication.put("registrationNumber", profile.getRegistrationNumber());
        masterApplication.put("panNumber", profile.getEncryptedPan());
        masterApplication.put("state", profile.getState());
        masterApplication.put("district", profile.getDistrict());
        
        // Map stakeholders to a simple list of maps
        List<Map<String, String>> stakeholderData = stakeholders.stream().map(s -> {
            Map<String, String> m = new HashMap<>();
            m.put("fullName", s.getFullName());
            m.put("designation", s.getDesignation());
            m.put("pan", s.getEncryptedPan());
            return m;
        }).collect(Collectors.toList());
        
        masterApplication.put("stakeholders", stakeholderData);
        masterApplication.put("submissionDate", LocalDateTime.now().toString());

        // 2. Convert the clean map to JSON bytes
        byte[] applicationJson = new com.fasterxml.jackson.databind.ObjectMapper()
                .writeValueAsBytes(masterApplication);

        // 3. Upload to IPFS
        String masterCid = ipfsService.uploadFile(applicationJson);

        profile.setMasterApplicationCid(masterCid);
        profile.setOnboardingStatus(OnboardingStatus.SUBMITTED);

        ngoRepository.save(profile);
        
        return masterCid;
    }
    
    @Transactional
    public void confirmApplication(User user, String txHash) throws Exception {
        if (user.getRole() != Role.NGO) {
            throw new RuntimeException("Not an NGO user");
        }

        NgoProfile profile = ngoRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("NGO profile not found"));

        if (profile.getOnboardingStatus() != OnboardingStatus.SUBMITTED) {
        	System.out.println("I am here 3");
            throw new RuntimeException("Application not submitted properly");
        }

        // 🔍 Fetch transaction from blockchain
        //skip in testing , don't verify hash just store directly ok 
        var transaction = web3j
                .ethGetTransactionByHash(txHash)
                .send()
                .getTransaction()
                .orElseThrow(() -> new IllegalStateException("Invalid transaction hash"));
        
        // Verify sender matches wallet
        if (!transaction.getFrom().equalsIgnoreCase(user.getWalletAddress())) {
            throw new IllegalStateException("Transaction sender mismatch");
        }

        // Store tx hash
        profile.setApplicationTxHash(txHash);
        
        ngoRepository.save(profile);
        
        BlockchainTransaction ledgerTx = BlockchainTransaction.builder()
                .hash(txHash)
                .sender(user.getWalletAddress())
                .receiver(ngoFactoryAddress) // Using the address from properties
                .purpose("NGO Registration: " + profile.getNgoName())
                .category("ngo")
                .timestamp(LocalDateTime.now())
                .build();

        ledgerRepository.save(ledgerTx);
    }
    
    @Transactional(readOnly = true)
    public NgoDetailsResponse getNgoDetails(User user) throws Exception {
        NgoProfile profile = ngoRepository.findByUser_Id(user.getId())
                .orElseThrow(() -> new RuntimeException("NGO profile not found"));
        
        // 1. Decrypt PAN Number (Stored as encrypted String in DB)
        String decryptedPan = encryptionService.decrypt(profile.getEncryptedPan());

        // 1. Fetch and Decrypt documents
        String regDoc = decryptIpfsFile(profile.getRegistrationCertificateCid());
        String eightyGDoc = decryptIpfsFile(profile.getEightyGCertificateCid());
        String twelveADoc = decryptIpfsFile(profile.getTwelveACertificateCid());

        return NgoDetailsResponse.builder()
                .ngoName(profile.getNgoName())
                .district(profile.getDistrict())
                .state(profile.getState())
                .walletAddress(user.getWalletAddress())
                .masterApplicationCid(profile.getMasterApplicationCid())
                .registrationNumber(profile.getRegistrationNumber())
                .registrationType(profile.getRegistrationType())
                .panNumber(decryptedPan)
                .registrationCertificateBase64(regDoc) // Decrypted
                .eightyGCertificateBase64(eightyGDoc)   // Decrypted
                .twelveACertificateBase64(twelveADoc)   // Decrypted
                .status(profile.getOnboardingStatus())
                .stakeholders(profile.getStakeholders().stream()
                    .map(s -> new StakeholderResponseDTO(s.getFullName(), s.getDesignation()))
                    .toList())
                .build();
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
    
    @Transactional(readOnly = true)
    public NgoDonationResponse getDonationHistoryForNgo(UUID userId) {
        NgoProfile ngo = ngoRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("NGO not found"));
        List<DonationHistory> donations = donationRepository.findByCampaign_NgoProfile_IdOrderByDonationDateDesc(ngo.getId());
        
        List<NgoDonationResponse.DonationDetailDTO> history = donations.stream().map(d -> 
            NgoDonationResponse.DonationDetailDTO.builder()
                .donorName(d.getDonorProfile().getFullName())
                .panNumber(encryptionService.decrypt(d.getDonorProfile().getPanNumber())) // Note: Decrypt if stored encrypted
                .transactionHash(d.getTransactionHash())
                .donationDate(d.getDonationDate().toString().replace("T", " ").substring(0, 16))
                .amount(d.getAmount())
                .campaignTitle(d.getCampaign().getTitle())
                .build()
        ).collect(Collectors.toList());

        return NgoDonationResponse.builder().history(history).build();
    }
    
    @Transactional(readOnly = true)
    public NgoReputationResponse getReputationSummary(UUID userId) {
        NgoProfile ngo = ngoRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("NGO not found"));

        // Fetch all donations that have a rating
        List<DonationHistory> ratedDonations = donationRepository.findByCampaign_NgoProfile_IdAndAlreadyRatedTrue(ngo.getId());

        double avg = ratedDonations.stream()
                .mapToInt(DonationHistory::getRating)
                .average()
                .orElse(0.0);

        List<NgoReputationResponse.ReviewDTO> reviews = ratedDonations.stream().map(r -> 
            NgoReputationResponse.ReviewDTO.builder()
                .donorName(r.getDonorProfile().getFullName())
                .campaignTitle(r.getCampaign().getTitle())
                .rating(r.getRating())
                .comment(r.getReviewDescription())
                .txHash(r.getTransactionHash()) // Assuming rating uses same tx or update with specific rating hash
                .date(r.getTimestamp().toString().substring(0, 10))
                .build()
        ).collect(Collectors.toList());

        return NgoReputationResponse.builder()
                .summary(NgoReputationResponse.ReputationSummary.builder()
                        .avgRating(avg)
                        .totalReviews((long) ratedDonations.size())
                        .build())
                .reviews(reviews)
                .build();
    }
    
    
    @Transactional(readOnly = true)
    public Map<String, Object> getNgoDashboardStats(UUID userId) {
        NgoProfile ngo = ngoRepository.findByUser_Id(userId)
                .orElseThrow(() -> new RuntimeException("NGO not found"));

        // Calculate total raised across ALL campaigns for this NGO
        BigDecimal totalRaised = donationRepository.findByCampaign_NgoProfile_IdOrderByDonationDateDesc(ngo.getId())
                .stream()
                .map(DonationHistory::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalRaised", totalRaised);
        stats.put("activeCampaigns", ngo.getActiveCampaignsCount());
        stats.put("reputationScore", ngo.getReputationScore());
        
        return stats;
    }
    
}