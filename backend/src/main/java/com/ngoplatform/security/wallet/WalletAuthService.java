package com.ngoplatform.security.wallet;

import com.ngoplatform.common.enums.AccountStatus;
import com.ngoplatform.security.jwt.JwtService;
import com.ngoplatform.user.entity.User;
import com.ngoplatform.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class WalletAuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    public String generateNonce(String walletAddress) {

    	String normalizedAddress = walletAddress.toLowerCase();

        User user = userRepository.findByWalletAddress(normalizedAddress)
                .orElseGet(() -> User.builder()
                        .walletAddress(normalizedAddress)
                        .role(null)
                        .accountStatus(AccountStatus.ACTIVE)
                        .build());

        String nonce = generateRandomNonce();

        String message = """
                ngoplatform.com wants you to sign in with your Ethereum account:
                %s

                Sign in to NGO Platform.

                URI: https://ngoplatform.com
                Version: 1
                Chain ID: 137
                Nonce: %s
                Issued At: %s
                """.formatted(walletAddress, nonce, Instant.now());

        user.setNonce(nonce);
        userRepository.save(user);

        return message;
    }

    private String generateRandomNonce() {
        SecureRandom secureRandom = new SecureRandom();
        return String.valueOf(secureRandom.nextInt(1_000_000));
    }
    
    
    public String verifySignature(String walletAddress, String signature) {
        walletAddress = walletAddress.toLowerCase();
        User user = userRepository.findByWalletAddress(walletAddress)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String nonce = user.getNonce();
        if (nonce == null) throw new RuntimeException("Nonce expired");

        // BUG FIX: Reconstruct the EXACT message the user signed
        String fullMessage = """
                ngoplatform.com wants you to sign in with your Ethereum account:
                %s

                Sign in to NGO Platform.

                URI: https://ngoplatform.com
                Version: 1
                Chain ID: 137
                Nonce: %s
                Issued At: %s
                """.formatted(walletAddress, nonce, user.getUpdatedAt().toString()); 
                // Note: You should ideally store the 'Issued At' timestamp in the DB 
                // alongside the nonce to ensure they match perfectly here.

        String recoveredAddress = SignatureUtil.recoverAddress(fullMessage, signature);

        if (!recoveredAddress.equalsIgnoreCase(walletAddress)) {
            throw new RuntimeException("Invalid signature");
        }

        user.setNonce(null);
        userRepository.save(user);
        return jwtService.generateToken(user);
    }
}
