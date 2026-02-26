package com.ngoplatform.external.signzy.dto;

import lombok.Data;

@Data
public class PanVerificationResponse {

    private boolean valid;
    private String panNumber;
    private String fullName;
    private String status;
}