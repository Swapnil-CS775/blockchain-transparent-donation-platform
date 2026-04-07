package com.ngoplatform.donor.controller;

import com.ngoplatform.common.enums.CampaignStatus;
import com.ngoplatform.donor.dto.DonationRequestDTO;
import com.ngoplatform.donor.dto.DonorCampaignExploreDTO;
import com.ngoplatform.donor.dto.DonorHistoryDTO;
import com.ngoplatform.donor.dto.DonorRegistrationDto;
import com.ngoplatform.donor.dto.DonorStatsDTO;
import com.ngoplatform.donor.dto.NgoFullDetailDTO;
import com.ngoplatform.donor.dto.NgoSummaryDTO;
import com.ngoplatform.donor.dto.RatingRequestDTO;
import com.ngoplatform.donor.entity.BlockchainTransaction;
import com.ngoplatform.donor.repository.DonorProfileRepository;
import com.ngoplatform.donor.repository.LedgerRepository;
import com.ngoplatform.donor.service.DonorService;
import com.ngoplatform.external.signzy.dto.PanVerificationRequest;
import com.ngoplatform.external.signzy.dto.PanVerificationResponse;
import com.ngoplatform.user.entity.User;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;

import java.util.List;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile/donor")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;
    private final DonorProfileRepository donorProfileRepository;
    private final LedgerRepository ledgerRepository;
    
 // NEW: Separate API for the "Verify" button in your React form
    @PostMapping("/verify-pan")
    public ResponseEntity<?> verifyOnly(
    		@AuthenticationPrincipal User user,
            @RequestBody PanVerificationRequest dto) {
    	if (donorProfileRepository.existsByUser(user)) {
    	    return ResponseEntity.badRequest()
    	            .body("Donor profile already exists");
    	}

    	System.out.println(">>> VERIFY PAN CONTROLLER HIT <<<");
    	PanVerificationResponse response = donorService.onlyVerifyPan(dto);
    	return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    @PreAuthorize("hasRole('GUEST')")
    public ResponseEntity<String> registerDonor(
            @AuthenticationPrincipal User user,
            @RequestBody DonorRegistrationDto dto,
            HttpServletRequest request) {

    	String ip = request.getRemoteAddr();
    	String userAgent = request.getHeader("User-Agent");
        String newToken = donorService.registerDonor(user, dto,ip,userAgent);
        return ResponseEntity.ok(newToken);
    }
    
    @GetMapping("/explore/ngos")
    public ResponseEntity<List<NgoSummaryDTO>> getExploreNgos(
            @RequestParam(required = false, defaultValue = "reputationDesc") String sort) {
        return ResponseEntity.ok(donorService.getVerifiedNgosForExplore(sort));
    }
    
    @GetMapping("/ngo/{id}")
    public ResponseEntity<NgoFullDetailDTO> getNgoProfile(@PathVariable UUID id) {
        return ResponseEntity.ok(donorService.getNgoFullProfile(id));
    }
    
    @PostMapping("/donation/sync")
    public ResponseEntity<?> registerDonation(@RequestBody DonationRequestDTO request) {
    	donorService.processDonation(request);
        return ResponseEntity.ok("Donation synchronized successfully");
    }
    
    @GetMapping("/explore/campaigns")
    public ResponseEntity<List<DonorCampaignExploreDTO>> exploreCampaigns(@RequestParam CampaignStatus status) {
        return ResponseEntity.ok(donorService.getCampaignsByStatus(status));
    }
    
    @GetMapping("/donations/history")
    public ResponseEntity<List<DonorHistoryDTO>> getMyDonationHistory(
            @AuthenticationPrincipal User user) {
        List<DonorHistoryDTO> history = donorService.getDonorHistory(user.getId());
        return ResponseEntity.ok(history);
    }
    
    @GetMapping("/stats/summary")
    public ResponseEntity<DonorStatsDTO> getDonorImpactSummary(
            @AuthenticationPrincipal User user) {
        DonorStatsDTO stats = donorService.getDonorStats(user.getId());
        return ResponseEntity.ok(stats);
    }
    
 // Ensure this matches the frontend path: /api/profile/donor/donations/${data.id}/rate
    @PostMapping("/donations/{donationId}/rate")
    public ResponseEntity<?> rateDonation(
            @PathVariable("donationId") UUID donationId, // ✨ Named PathVariable for safety
            @RequestBody RatingRequestDTO ratingDto) {  // ✨ Ensure this DTO exists
        
        System.out.println(">>> [DEBUG] Receiving rating for Donation: " + donationId);
        donorService.saveDonationRating(donationId, ratingDto);
        return ResponseEntity.ok("Rating saved successfully");
    }
    
    @GetMapping("/ledger")
    public ResponseEntity<List<BlockchainTransaction>> getBlockchainLedger() {
        // We call the repository directly for the ledger to keep it fast
        List<BlockchainTransaction> ledger = ledgerRepository.findAllByOrderByTimestampDesc();
        return ResponseEntity.ok(ledger);
    }
    
}