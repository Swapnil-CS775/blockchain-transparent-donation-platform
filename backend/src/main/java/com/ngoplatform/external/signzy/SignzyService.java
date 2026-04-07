package com.ngoplatform.external.signzy;

import com.ngoplatform.external.signzy.dto.PanVerificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class SignzyService {

    private final SignzyClient client;

    @Value("${signzy.enabled:true}")
    private boolean signzyEnabled;

    public PanVerificationResponse verifyPan(String panNumber, String name) {

        if (!signzyEnabled) {
            // MOCK RESPONSE
            PanVerificationResponse mock = new PanVerificationResponse();
            mock.setValid(true);
            mock.setPanNumber(panNumber);
            mock.setFullName(name);
            mock.setStatus("MOCK_VERIFIED");
            System.out.println("returned from mock");
            return mock;
        }
        System.out.println("from mock");
        PanVerificationResponse response = client.verifyPan(panNumber, name);

        if (response == null || !response.isValid()) {
            throw new RuntimeException("Invalid PAN details");
        }

        return response;
    }
}