package com.ngoplatform.donor.service;

import com.ngoplatform.common.enums.AccountStatus;
import com.ngoplatform.common.enums.Role;
import com.ngoplatform.common.util.EncryptionService;
import com.ngoplatform.donor.dto.DonorRegistrationDto;
import com.ngoplatform.donor.entity.DonorProfile;
import com.ngoplatform.donor.repository.DonorProfileRepository;
import com.ngoplatform.external.signzy.SignzyService;
import com.ngoplatform.external.signzy.dto.PanVerificationResponse;
import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DonorService {

    private final DonorProfileRepository donorRepository;
    private final UserRepository userRepository;
    private final SignzyService signzyService;
    private final EncryptionService encryptionService;

    @Transactional
    public void registerDonor(User user, DonorRegistrationDto dto) {
    	
    	

        if (user.getRole() != null) {
            throw new IllegalStateException("Role already assigned");
        }

        // 🔐 Verify PAN via Signzy
        PanVerificationResponse response =
                signzyService.verifyPan(dto.getPanNumber(), dto.getFullName());

        // 🔐 Encrypt PAN before storing
        String encryptedPan = encryptionService.encrypt(dto.getPanNumber());
        
        // Assign role
        user.setRole(Role.DONOR);
        user.setAccountStatus(AccountStatus.ACTIVE);
        userRepository.save(user);

        // Save profile
        DonorProfile profile = DonorProfile.builder()
                .user(user)
                .fullName(response.getFullName()) // use verified name
                .email(dto.getEmail())
                .country(dto.getCountry())
                .panNumber(encryptedPan)
                .panVerified(true)
                .build();

        donorRepository.save(profile);
    }
}