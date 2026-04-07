package com.ngoplatform.ngo.controller;

import com.ngoplatform.ngo.dto.CampaignRequest;
import com.ngoplatform.ngo.entity.Campaign;
import com.ngoplatform.ngo.service.CampaignService;
import com.ngoplatform.user.entity.User;
import com.sun.security.auth.UserPrincipal;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/campaigns")
@RequiredArgsConstructor
public class CampaignController {

    private final CampaignService campaignService;

    @PostMapping("/create")
    public ResponseEntity<Campaign> create(@AuthenticationPrincipal User user, @RequestBody CampaignRequest request) {
        return ResponseEntity.ok(campaignService.createCampaign(user.getId(), request));
    }
    
    @GetMapping("/my-campaigns")
    public ResponseEntity<List<Campaign>> getMyCampaigns(@AuthenticationPrincipal User user) {
        List<Campaign> campaigns = campaignService.getCampaignsByNgoUser(user.getId());
        return ResponseEntity.ok(campaigns);
    }	
    
    
}