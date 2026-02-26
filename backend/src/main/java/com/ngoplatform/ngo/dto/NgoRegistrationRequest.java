package com.ngoplatform.ngo.dto;

import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

@Data
public class NgoRegistrationRequest {

    // Basic Info
    private String ngoName;
    private String panNumber;
    private String registeredAddress;
    private String state;
    private String district;
    private String pinCode;
    private String contactEmail;
    private String contactPhone;

    // Registration
    private String registrationType;
    private String registrationNumber;
    private LocalDate incorporationDate;
    private MultipartFile registrationCertificate;

    // 80G
    private String eightyGNumber;
    private LocalDate eightyGValidityDate;
    private MultipartFile eightyGCertificate;

    // 12A
    private String twelveANumber;
    private MultipartFile twelveACertificate;
}