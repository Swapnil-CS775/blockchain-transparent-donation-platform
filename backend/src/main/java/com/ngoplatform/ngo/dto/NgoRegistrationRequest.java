package com.ngoplatform.ngo.dto;

import lombok.Data;

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

    // 80G
    private String eightyGNumber;
    private LocalDate eightyGValidityDate;

    // 12A
    private String twelveANumber;
    
    private String registrationCertificateCid;
    private String eightyGCertificateCid;
    private String twelveACertificateCid;
}