package com.ngoplatform.external.signzy.dto;

import lombok.Data;

@Data
public class PanVerificationRequest {

    private String panNumber;
    private String name;
}