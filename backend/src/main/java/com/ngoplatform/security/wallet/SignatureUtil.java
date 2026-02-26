package com.ngoplatform.security.wallet;

import org.web3j.crypto.Keys;
import org.web3j.crypto.Sign;
import org.web3j.utils.Numeric;

import java.math.BigInteger;
import java.nio.charset.StandardCharsets;

public class SignatureUtil {
    public static String recoverAddress(String message, String signatureHex) {
        try {
            // Remove '0x' prefix if present
            String cleanSignature = signatureHex.startsWith("0x") ? signatureHex.substring(2) : signatureHex;
            byte[] signatureBytes = Numeric.hexStringToByteArray(cleanSignature);

            // Handle V, R, S components
            byte v = signatureBytes[64];
            if (v < 27) v += 27; // Ensure V is in the correct Ethereum range

            byte[] r = new byte[32];
            byte[] s = new byte[32];
            System.arraycopy(signatureBytes, 0, r, 0, 32);
            System.arraycopy(signatureBytes, 32, s, 0, 32);

            Sign.SignatureData signatureData = new Sign.SignatureData(v, r, s);

            // USE THIS WEB3J HELPER: It handles the prefix and hashing for you!
            BigInteger publicKey = Sign.signedPrefixedMessageToKey(message.getBytes(StandardCharsets.UTF_8), signatureData);

            return "0x" + Keys.getAddress(publicKey);
        } catch (Exception e) {
            throw new RuntimeException("Could not recover address from signature", e);
        }
    }
}