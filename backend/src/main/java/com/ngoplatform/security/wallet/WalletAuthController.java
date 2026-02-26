package com.ngoplatform.security.wallet;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.ngoplatform.security.dto.NonceRequest;
import com.ngoplatform.security.dto.VerifyRequest;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class WalletAuthController {

    private final WalletAuthService walletAuthService;

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
    
    @PostMapping("/verify")
    public ResponseEntity<?> verify(@RequestBody VerifyRequest request) {

        String token = walletAuthService.verifySignature(
                request.getWalletAddress(),
                request.getSignature()
        );

        return ResponseEntity.ok(token);
    }
}
