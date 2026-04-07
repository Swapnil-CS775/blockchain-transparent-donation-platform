package com.ngoplatform.security.wallet;

import lombok.RequiredArgsConstructor;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.ngo.repository.NgoProfileRepository;
import com.ngoplatform.security.dto.NonceRequest;
import com.ngoplatform.security.dto.VerifyRequest;
import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class WalletAuthController {

    private final WalletAuthService walletAuthService;
    private final UserRepository userRepository;
    private final NgoProfileRepository ngoProfileRepository;

    @PostMapping("/nonce")
    public ResponseEntity<?> getNonce(@RequestBody NonceRequest request) {
        // Validate that the address is not null or empty
        if (request.getWalletAddress() == null || request.getWalletAddress().isEmpty()) {
            return ResponseEntity.badRequest().body("Wallet address is required");
        }

        String walletAddress = request.getWalletAddress();
        
        // Generate the nonce (e.g., "Sign this message to login: 123456")
        String nonce = walletAuthService.generateNonce(walletAddress);

        return ResponseEntity.ok(nonce);
    }
    
    @SuppressWarnings("unlikely-arg-type")
	@PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody VerifyRequest request) {

        String token = walletAuthService.verifySignature(
                request.getWalletAddress(),
                request.getSignature()
        );
        
    
        // 2. Fetch the user and handle the Optional
        User user = userRepository.findByWalletAddress(request.getWalletAddress())
                .orElseThrow(() -> new RuntimeException("User not found for this wallet"));
        
        // 3. Return as a JSON Object
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name()); // e.g., "NGO", "DONOR", or "GUEST"
        
        OnboardingStatus status = null;

        // 2. If the user is an NGO, fetch their status
        if ("NGO".equals(user.getRole())) {
            status = ngoProfileRepository.findByUser_Id(user.getId())
                        .map(NgoProfile::getOnboardingStatus)
                        .orElse(OnboardingStatus.DRAFT); // Default to DRAFT if no profile exists yet
        }
        response.put("onboardingStatus", status);

        return ResponseEntity.ok(response);
    }
}
