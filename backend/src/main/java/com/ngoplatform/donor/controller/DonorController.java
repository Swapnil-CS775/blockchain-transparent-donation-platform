package com.ngoplatform.donor.controller;

import com.ngoplatform.donor.dto.DonorRegistrationDto;
import com.ngoplatform.donor.service.DonorService;
import com.ngoplatform.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class DonorController {

    private final DonorService donorService;

    @PostMapping("/donor")
    public ResponseEntity<String> registerDonor(
            @AuthenticationPrincipal User user,
            @RequestBody DonorRegistrationDto dto) {

        donorService.registerDonor(user, dto);

        return ResponseEntity.ok("Donor profile created successfully");
    }
}