package com.ngoplatform.ngo.controller;

import com.ngoplatform.common.enums.Role;
import com.ngoplatform.external.signzy.dto.PanVerificationRequest;
import com.ngoplatform.external.signzy.dto.PanVerificationResponse;
import com.ngoplatform.ngo.dto.ConfirmApplicationRequest;
import com.ngoplatform.ngo.dto.NgoDetailsResponse;
import com.ngoplatform.ngo.dto.NgoDonationResponse;
import com.ngoplatform.ngo.dto.NgoRegistrationRequest;
import com.ngoplatform.ngo.dto.NgoReputationResponse;
import com.ngoplatform.ngo.dto.StakeholderDto;
import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.ngo.repository.NgoProfileRepository;
import com.ngoplatform.ngo.service.NgoService;
import com.ngoplatform.user.entity.User;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/ngo")
@RequiredArgsConstructor
public class NgoController {

    private final NgoProfileRepository ngoProfileRepository;

    private final NgoService ngoService;

    // 1️⃣ NEW: Verify NGO Main PAN (Step 1)
    @PostMapping("/verify-pan")
    public ResponseEntity<?> verifyNgoPan(
    		@AuthenticationPrincipal User user,
    		@RequestBody PanVerificationRequest dto
    ) {
    	// 🛡️ BLOCK: If user is already a Donor
        if (user.getRole() == Role.DONOR) {
            return ResponseEntity.badRequest()
                    .body("This wallet is already registered as a DONOR. Use a different wallet for NGO.");
        }
        return ResponseEntity.ok(ngoService.verifyOnlyNgoPan(dto));
    }

    // 2️⃣ NEW: Verify Stakeholder PAN (Step 4)
    @PostMapping("/stakeholder/verify-pan")
    public ResponseEntity<PanVerificationResponse> verifyStakeholderPan(
    		@RequestBody PanVerificationRequest dto
    ) {
        return ResponseEntity.ok(ngoService.verifyOnlyStakeholderPan(dto));
    }

 // 3️⃣ Save NGO Draft (Step 3 - Files & Basic Info)
    @PostMapping(value = "/register")
    public ResponseEntity<String> registerNgo(
            @AuthenticationPrincipal User user,
            @RequestBody NgoRegistrationRequest request
    ) throws Exception {
        String newToken = ngoService.registerNgo(user, request);
        return ResponseEntity.ok(newToken);
    }
    
    // 4️⃣ Add Stakeholder to DB (Step 4 - After UI Verification)
    @PostMapping("/stakeholder")
    public ResponseEntity<String> addStakeholder(
            @AuthenticationPrincipal User user,
            @RequestBody StakeholderDto dto
    ) {
        ngoService.addStakeholder(user, dto);
        return ResponseEntity.ok("Stakeholder added successfully");
    }
    
    @GetMapping("/my-draft")
    public ResponseEntity<NgoProfile> getMyDraft(@AuthenticationPrincipal User user) {
        return ngoProfileRepository.findByUser_Id(user.getId())
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    @PostMapping("/final-submit")
    public String finalizeNgo(
            @AuthenticationPrincipal User user,
            @RequestParam("termsAccepted") boolean termsAccepted,
            HttpServletRequest request
    ) throws Exception {
    	System.out.println("Request came at final-submit controller");

        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        return ngoService.finalizeApplication(
                user,
                termsAccepted,
                ipAddress,
                userAgent
        );
    }
    
    
    @PostMapping("/confirm-application")
    public String confirmApplication(
            @AuthenticationPrincipal User user,
            @RequestBody ConfirmApplicationRequest request
    ) throws Exception {
    	System.out.println("Request came at confirm-application controller");
        ngoService.confirmApplication(user, request.getTransactionHash());

        return "Application confirmed successfully";
    }
    
    @GetMapping("/details")
    public ResponseEntity<NgoDetailsResponse> getNgoDetails(@AuthenticationPrincipal User user) throws Exception {
        // This ensures we get the most up-to-date PAN and CIDs
        return ResponseEntity.ok(ngoService.getNgoDetails(user));
    }
    
    @GetMapping("/donations/history")
    public ResponseEntity<NgoDonationResponse> getDonationLedger(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ngoService.getDonationHistoryForNgo(user.getId()));
    }

    @GetMapping("/reputation/summary")
    public ResponseEntity<NgoReputationResponse> getReputationData(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ngoService.getReputationSummary(user.getId()));
    }
    
    @GetMapping("/dashboard/stats")
    public ResponseEntity<Map<String, Object>> getDashboardStats(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(ngoService.getNgoDashboardStats(user.getId()));
    }
}