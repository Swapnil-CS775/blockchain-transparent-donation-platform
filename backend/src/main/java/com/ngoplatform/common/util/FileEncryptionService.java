package com.ngoplatform.common.util;

import com.ngoplatform.config.CryptoProperties;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.SecretKeySpec;

@Service
@RequiredArgsConstructor
public class FileEncryptionService {

    private final CryptoProperties properties;

    private SecretKeySpec getKey() {
        return new SecretKeySpec(properties.getSecret().getBytes(), "AES");
    }

    public byte[] encrypt(byte[] fileBytes) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.ENCRYPT_MODE, getKey());
            return cipher.doFinal(fileBytes);
        } catch (Exception e) {
            throw new RuntimeException("File encryption failed");
        }
    }

    public byte[] decrypt(byte[] encryptedBytes) {
        try {
            Cipher cipher = Cipher.getInstance("AES");
            cipher.init(Cipher.DECRYPT_MODE, getKey());
            return cipher.doFinal(encryptedBytes);
        } catch (Exception e) {
            throw new RuntimeException("File decryption failed");
        }
    }
}