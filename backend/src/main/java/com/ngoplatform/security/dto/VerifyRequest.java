package com.ngoplatform.security.dto;

import lombok.Data;

@Data
public class VerifyRequest {
    private String walletAddress;
    private String signature;
}