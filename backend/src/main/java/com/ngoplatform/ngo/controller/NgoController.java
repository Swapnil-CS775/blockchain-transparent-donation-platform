package com.ngoplatform.ngo.controller;

import com.ngoplatform.ngo.dto.ConfirmApplicationRequest;
import com.ngoplatform.ngo.dto.NgoRegistrationRequest;
import com.ngoplatform.ngo.dto.StakeholderDto;
import com.ngoplatform.ngo.service.NgoService;
import com.ngoplatform.user.entity.User;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class NgoController {

    private final NgoService ngoService;

    @PostMapping(value = "/ngo/register", consumes = "multipart/form-data")
    public String registerNgo(
            @AuthenticationPrincipal User user,
            @ModelAttribute NgoRegistrationRequest request
    ) throws Exception {

        ngoService.registerNgo(user, request);
        return "NGO draft saved successfully";
    }
    
    @PostMapping("/ngo/stakeholder")
    public String addStakeholder(
            @AuthenticationPrincipal User user,
            @RequestBody StakeholderDto dto
    ) {
        ngoService.addStakeholder(user, dto);
        return "Stakeholder added successfully";
    }
    
    @PostMapping("/ngo/final-submit")
    public String finalizeNgo(
            @AuthenticationPrincipal User user,
            @RequestParam("termsAccepted") boolean termsAccepted,
            HttpServletRequest request
    ) throws Exception {

        String ipAddress = request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");

        return ngoService.finalizeApplication(
                user,
                termsAccepted,
                ipAddress,
                userAgent
        );
    }
    
    @PostMapping("/ngo/confirm-application")
    public String confirmApplication(
            @AuthenticationPrincipal User user,
            @RequestBody ConfirmApplicationRequest request
    ) throws Exception {

        ngoService.confirmApplication(user, request.getTransactionHash());

        return "Application confirmed successfully";
    }
}