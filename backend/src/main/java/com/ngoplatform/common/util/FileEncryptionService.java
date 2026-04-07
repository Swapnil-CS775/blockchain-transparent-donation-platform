package com.ngoplatform.common.util;

import com.ngoplatform.config.EncryptProperties;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

@Service
@RequiredArgsConstructor
public class FileEncryptionService {

    private final EncryptProperties encryptProperties;
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;

    private SecretKeySpec getKey() {
        return new SecretKeySpec(encryptProperties.getSecret().getBytes(StandardCharsets.UTF_8), "AES");
    }

    public byte[] encrypt(byte[] fileBytes) {
        try {
            byte[] iv = new byte[IV_LENGTH];
            new SecureRandom().nextBytes(iv); // Unique IV for every file

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, getKey(), new GCMParameterSpec(TAG_LENGTH, iv));
            byte[] encrypted = cipher.doFinal(fileBytes);

            // Prepend IV to the file so we can decrypt it later
            return ByteBuffer.allocate(iv.length + encrypted.length)
                    .put(iv)
                    .put(encrypted)
                    .array();
        } catch (Exception e) {
            throw new RuntimeException("File encryption failed", e);
        }
    }

    public byte[] decrypt(byte[] encryptedBytes) {
        try {
            ByteBuffer buffer = ByteBuffer.wrap(encryptedBytes);
            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv); // Extract the IV from the start
            
            byte[] cipherText = new byte[buffer.remaining()];
            buffer.get(cipherText);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, getKey(), new GCMParameterSpec(TAG_LENGTH, iv));
            return cipher.doFinal(cipherText);
        } catch (Exception e) {
            throw new RuntimeException("File decryption failed", e);
        }
    }
}