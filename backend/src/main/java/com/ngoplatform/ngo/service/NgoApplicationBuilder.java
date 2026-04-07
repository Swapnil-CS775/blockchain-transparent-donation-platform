package com.ngoplatform.ngo.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.ngo.entity.NgoStakeholder;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class NgoApplicationBuilder {

    private final ObjectMapper mapper;

    public NgoApplicationBuilder() {
        // Initialize a specialized ObjectMapper for IPFS JSON generation
        this.mapper = new ObjectMapper();
        
        // Register the module to handle Java 8 Date/Time types like LocalDateTime
        this.mapper.registerModule(new JavaTimeModule());
        
        // Ensure dates are written as ISO-8601 strings rather than numeric timestamps
        this.mapper.configure(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS, false);
    }

    /**
     * Builds a comprehensive JSON representation of the NGO application for IPFS storage.
     */
    public byte[] buildApplicationJson(
            NgoProfile profile,
            List<NgoStakeholder> stakeholders
    ) throws Exception {

        Map<String, Object> root = new HashMap<>();

        // Basic Info
        root.put("ngoName", profile.getNgoName());
        root.put("encryptedPan", profile.getEncryptedPan());
        root.put("registeredAddress", profile.getRegisteredAddress());
        root.put("registrationNumber", profile.getRegistrationNumber());
        root.put("registrationCertificateCid", profile.getRegistrationCertificateCid());

        // Tax Exemption Details
        root.put("eightyGNumber", profile.getEightyGNumber());
        root.put("eightyGCertificateCid", profile.getEightyGCertificateCid());

        root.put("twelveANumber", profile.getTwelveANumber());
        root.put("twelveACertificateCid", profile.getTwelveACertificateCid());

        // Stakeholder & Legal Details
        root.put("stakeholders", stakeholders);
        root.put("termsAccepted", profile.getTermsAccepted());
        root.put("termsAcceptedAt", profile.getTermsAcceptedAt()); // Now safely handled by JavaTimeModule
        root.put("termsVersion", profile.getTermsVersion());

        // Convert the map to a byte array for IPFS upload
        return mapper.writeValueAsBytes(root);
    }
}