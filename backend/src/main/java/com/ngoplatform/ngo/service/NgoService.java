package com.ngoplatform.ngo.service;

import com.ngoplatform.common.enums.AccountStatus;
import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.common.enums.Role;
import com.ngoplatform.common.util.EncryptionService;
import com.ngoplatform.common.util.FileEncryptionService;
import com.ngoplatform.external.ipfs.IpfsService;
import com.ngoplatform.external.signzy.SignzyService;
import com.ngoplatform.external.signzy.dto.PanVerificationResponse;
import com.ngoplatform.ngo.dto.NgoRegistrationRequest;
import com.ngoplatform.ngo.dto.StakeholderDto;
import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.ngo.entity.NgoStakeholder;
import com.ngoplatform.ngo.repository.NgoProfileRepository;
import com.ngoplatform.ngo.repository.NgoStakeholderRepository;
import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.web3j.protocol.Web3j;

@Service
@RequiredArgsConstructor
public class NgoService {

    private final NgoProfileRepository ngoRepository;
    private final UserRepository userRepository;
    private final SignzyService signzyService;
    private final EncryptionService encryptionService;
    private final NgoStakeholderRepository stakeholderRepository;
    private final FileEncryptionService fileEncryptionService;
    private final IpfsService ipfsService;
    private final NgoApplicationBuilder applicationBuilder;
    private final Web3j web3j;

    @Transactional
    public void registerNgo(User user, NgoRegistrationRequest request) throws Exception {

        if (user.getRole() != null) {
            throw new IllegalStateException("Role already assigned");
        }

        // 1️⃣ PAN Verification
        var panResponse = signzyService.verifyPan(
                request.getPanNumber(),
                request.getNgoName()
        );

        String encryptedPan = encryptionService.encrypt(request.getPanNumber());

        // 2️⃣ Encrypt & Upload Registration Certificate
        String registrationCid = null;
        if (request.getRegistrationCertificate() != null) {
            byte[] encryptedBytes =
                    fileEncryptionService.encrypt(
                            request.getRegistrationCertificate().getBytes()
                    );

            registrationCid = ipfsService.uploadFile(encryptedBytes);
        }

        // 3️⃣ Encrypt & Upload 80G Certificate
        String eightyGCid = null;
        if (request.getEightyGCertificate() != null) {
            byte[] encryptedBytes =
                    fileEncryptionService.encrypt(
                            request.getEightyGCertificate().getBytes()
                    );

            eightyGCid = ipfsService.uploadFile(encryptedBytes);
        }

        // 4️⃣ Encrypt & Upload 12A Certificate
        String twelveACid = null;
        if (request.getTwelveACertificate() != null) {
            byte[] encryptedBytes =
                    fileEncryptionService.encrypt(
                            request.getTwelveACertificate().getBytes()
                    );

            twelveACid = ipfsService.uploadFile(encryptedBytes);
        }

        // 5️⃣ Assign Role
        user.setRole(Role.NGO);
        user.setAccountStatus(AccountStatus.PENDING);
        userRepository.save(user);

        // 6️⃣ Save NGO Draft
        NgoProfile profile = NgoProfile.builder()
                .user(user)
                .ngoName(panResponse.getFullName())
                .encryptedPan(encryptedPan)
                .panVerified(true)
                .registeredAddress(request.getRegisteredAddress())
                .state(request.getState())
                .district(request.getDistrict())
                .pinCode(request.getPinCode())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .registrationType(request.getRegistrationType())
                .registrationNumber(request.getRegistrationNumber())
                .incorporationDate(request.getIncorporationDate())
                .registrationCertificateCid(registrationCid)
                .eightyGNumber(request.getEightyGNumber())
                .eightyGValidityDate(request.getEightyGValidityDate())
                .eightyGCertificateCid(eightyGCid)
                .twelveANumber(request.getTwelveANumber())
                .twelveACertificateCid(twelveACid)
                .onboardingStatus(OnboardingStatus.DRAFT)
                .isVerified(false)
                .build();

        ngoRepository.save(profile);
    }
    
    @Transactional
    public void addStakeholder(User user, StakeholderDto dto) {

        if (user.getRole() != Role.NGO) {
            throw new IllegalStateException("Not an NGO user");
        }

        NgoProfile profile = ngoRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalStateException("NGO profile not found"));

        if (profile.getOnboardingStatus() != OnboardingStatus.DRAFT) {
            throw new IllegalStateException("Cannot modify after submission");
        }

        // 🔐 Verify PAN
        PanVerificationResponse response =
                signzyService.verifyPan(dto.getPanNumber(), dto.getFullName());

        // 🔐 Encrypt PAN
        String encryptedPan =
                encryptionService.encrypt(dto.getPanNumber());

        NgoStakeholder stakeholder = NgoStakeholder.builder()
                .ngoProfile(profile)
                .fullName(response.getFullName())
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
            throw new IllegalStateException("Not an NGO user");
        }

        if (!termsAccepted) {
            throw new IllegalStateException("Terms must be accepted");
        }

        NgoProfile profile = ngoRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalStateException("NGO profile not found"));

        if (profile.getOnboardingStatus() != OnboardingStatus.DRAFT) {
            throw new IllegalStateException("Already submitted");
        }

        // Save Terms Acceptance
        profile.setTermsAccepted(true);
        profile.setTermsAcceptedAt(LocalDateTime.now());
        profile.setTermsVersion("v1.0");
        profile.setAcceptedIpAddress(ipAddress);
        profile.setAcceptedUserAgent(userAgent);

        // Fetch stakeholders
        List<NgoStakeholder> stakeholders =
                stakeholderRepository.findByNgoProfile_Id(profile.getId());

        if (stakeholders.isEmpty()) {
            throw new IllegalStateException("At least one stakeholder required");
        }

        // Build master JSON
        byte[] applicationJson =
                applicationBuilder.buildApplicationJson(profile, stakeholders);

        // Upload master JSON to IPFS
        String masterCid =
                ipfsService.uploadFile(applicationJson);

        profile.setMasterApplicationCid(masterCid);
        profile.setOnboardingStatus(OnboardingStatus.SUBMITTED);

        ngoRepository.save(profile);

        return masterCid;
    }
    
    @Transactional
    public void confirmApplication(User user, String txHash) throws Exception {

        if (user.getRole() != Role.NGO) {
            throw new IllegalStateException("Not an NGO user");
        }

        NgoProfile profile = ngoRepository
                .findByUser_Id(user.getId())
                .orElseThrow(() -> new IllegalStateException("NGO profile not found"));

        if (profile.getOnboardingStatus() != OnboardingStatus.SUBMITTED) {
            throw new IllegalStateException("Application not submitted properly");
        }

        // 🔍 Fetch transaction from blockchain
//        var transaction = web3j
//                .ethGetTransactionByHash(txHash)
//                .send()
//                .getTransaction()
//                .orElseThrow(() -> new IllegalStateException("Invalid transaction hash"));
//
//        // Verify sender matches wallet
//        if (!transaction.getFrom().equalsIgnoreCase(user.getWalletAddress())) {
//            throw new IllegalStateException("Transaction sender mismatch");
//        }

        // Store tx hash
        profile.setApplicationTxHash(txHash);

        ngoRepository.save(profile);
    }
}