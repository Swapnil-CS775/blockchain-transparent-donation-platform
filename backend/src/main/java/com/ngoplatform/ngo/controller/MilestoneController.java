package com.ngoplatform.ngo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.ngoplatform.ngo.dto.MilestoneSyncRequest;
import com.ngoplatform.ngo.service.CampaignService;
import com.ngoplatform.user.entity.User;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/milestones")
@RequiredArgsConstructor
public class MilestoneController {

    private final CampaignService campaignService;

    // Matches frontend: api.post('/milestones/submit-proof-sync', payload)
    @PostMapping("/submit-proof-sync")
    public ResponseEntity<String> syncMilestoneProof(
            @AuthenticationPrincipal User user, 
            @RequestBody MilestoneSyncRequest request) {
        
        campaignService.syncMilestoneProof(user.getId(), request);
        return ResponseEntity.ok("Blockchain proof synced with database.");
    }
}