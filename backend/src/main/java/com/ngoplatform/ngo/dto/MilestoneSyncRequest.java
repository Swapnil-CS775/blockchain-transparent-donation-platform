package com.ngoplatform.ngo.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MilestoneSyncRequest {
    
    // This matches 'milestoneId' from your React payload
    private UUID milestoneId;      

    // This matches 'masterCid' from your React payload
    private String masterCid;      

    // This matches 'transactionHash' from your React payload
    private String transactionHash; 
    
    private String description;
}