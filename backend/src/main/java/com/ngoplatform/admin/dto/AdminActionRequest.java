package com.ngoplatform.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminActionRequest {
    private boolean approve;
    private String reason;
    private String transactionHash;
}