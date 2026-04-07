package com.ngoplatform.admin.controller;

import com.ngoplatform.admin.service.AdminService;
import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.admin.dto.AdminActionRequest;
import com.ngoplatform.admin.dto.MilestoneResponseDTO;
import com.ngoplatform.ngo.dto.NgoDetailsResponse;
import com.ngoplatform.ngo.entity.CampaignMilestone;
import com.ngoplatform.user.entity.User; // Assuming your User entity package
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    // --- SHARED SERVICES (Accessible by both SUPER_ADMIN and VERIFIER) ---

    @GetMapping("/ngos")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'VERIFIER')")
    public ResponseEntity<List<NgoDetailsResponse>> getNgosByStatus(@RequestParam OnboardingStatus status) {
    	return ResponseEntity.ok(adminService.getNGOPendingAction(status));
    }

    @PostMapping("/ngos/{ngoId}/verify")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'VERIFIER')")
    public ResponseEntity<String> verifyNgo(@PathVariable UUID ngoId, @RequestBody AdminActionRequest request) {
        adminService.processNgoVerification(ngoId, request);
        return ResponseEntity.ok("NGO Verification Processed");
    }

    @GetMapping("/milestones/pending")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'VERIFIER')")
    public ResponseEntity<List<MilestoneResponseDTO>> getPendingMilestones() {
        return ResponseEntity.ok(adminService.getPendingMilestones());
    }

    @PostMapping("/milestones/{milestoneId}/verify")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'VERIFIER')")
    public ResponseEntity<String> verifyMilestone(@PathVariable UUID milestoneId, @RequestBody AdminActionRequest request) {
        adminService.processMilestoneVerification(milestoneId, request);
        return ResponseEntity.ok("Milestone Verification Processed");
    }

    // --- VERIFIER MANAGEMENT (SUPER_ADMIN ONLY) ---

    /**
     * Fetch all users with ROLE_VERIFIER [cite: 2026-03-06]
     */
    @GetMapping("/verifiers")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<User>> getAllVerifiers() {
        return ResponseEntity.ok(adminService.getAllVerifiers());
    }

    /**
     * Add a new verifier by wallet address [cite: 2026-03-06]
     */
    @PostMapping("/verifiers/add")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> addVerifier(@RequestParam String walletAddress, @RequestParam String txHash) {
        adminService.addVerifier(walletAddress,txHash);
        return ResponseEntity.ok("Verifier added successfully");
    }

    /**
     * Remove a verifier (Change role back to GUEST/DONOR) [cite: 2026-03-06]
     */
    @DeleteMapping("/verifiers/{userId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<String> removeVerifier(@PathVariable UUID userId,@RequestParam String txHash) {
    	
        adminService.removeVerifier(userId,txHash);
        return ResponseEntity.ok("Verifier removed successfully");
    }
}