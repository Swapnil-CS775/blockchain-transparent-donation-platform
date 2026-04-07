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

        // 1. Fetch or Create with Defaults
        User user = userRepository.findByWalletAddress(normalizedAddress)
                .orElseGet(() -> {
                    User newUser = new User();
                    newUser.setWalletAddress(normalizedAddress);
                    newUser.setAccountStatus(AccountStatus.ACTIVE);
                    newUser.setIsVerified(false);
                    newUser.setTokenVersion(1);
                    // Assign a default role so JwtService doesn't crash
                    newUser.setRole(com.ngoplatform.common.enums.Role.GUEST); 
                    return newUser;
                });

        String nonce = generateRandomNonce();
        String timestamp = Instant.now().toString();

        String message = """
                ngoplatform.com wants you to sign in with your Ethereum account:
                %s

                Sign in to NGO Platform.

                URI: https://ngoplatform.com
                Version: 1
                Chain ID: 137
                Nonce: %s
                Issued At: %s
                """.formatted(walletAddress, nonce, timestamp);

        user.setNonce(message); 
        // 2. Save and FLUSH to ensure ID is generated immediately
        userRepository.saveAndFlush(user); 

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

        // We retrieve the EXACT message that was signed
        String signedMessage = user.getNonce(); 
        if (signedMessage == null) throw new RuntimeException("Nonce expired");

        // Use your existing SignatureUtil
        String recoveredAddress = SignatureUtil.recoverAddress(signedMessage, signature);

        if (!recoveredAddress.equalsIgnoreCase(walletAddress)) {
            throw new RuntimeException("Invalid signature");
        }

        user.setNonce(null);
        userRepository.save(user);
        return jwtService.generateToken(user);
    }
}
