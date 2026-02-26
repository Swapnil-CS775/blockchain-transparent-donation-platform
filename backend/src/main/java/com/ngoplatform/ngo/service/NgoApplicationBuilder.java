package com.ngoplatform.ngo.service;

import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.ngo.entity.NgoStakeholder;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class NgoApplicationBuilder {

    private final ObjectMapper objectMapper;

    public byte[] buildApplicationJson(
            NgoProfile profile,
            List<NgoStakeholder> stakeholders
    ) throws Exception {

        Map<String, Object> root = new HashMap<>();

        root.put("ngoName", profile.getNgoName());
        root.put("encryptedPan", profile.getEncryptedPan());
        root.put("registeredAddress", profile.getRegisteredAddress());
        root.put("registrationNumber", profile.getRegistrationNumber());
        root.put("registrationCertificateCid", profile.getRegistrationCertificateCid());

        root.put("eightyGNumber", profile.getEightyGNumber());
        root.put("eightyGCertificateCid", profile.getEightyGCertificateCid());

        root.put("twelveANumber", profile.getTwelveANumber());
        root.put("twelveACertificateCid", profile.getTwelveACertificateCid());

        root.put("stakeholders", stakeholders);
        root.put("termsAccepted", profile.getTermsAccepted());
        root.put("termsAcceptedAt", profile.getTermsAcceptedAt());
        root.put("termsVersion", profile.getTermsVersion());

        return objectMapper.writeValueAsBytes(root);
    }
}