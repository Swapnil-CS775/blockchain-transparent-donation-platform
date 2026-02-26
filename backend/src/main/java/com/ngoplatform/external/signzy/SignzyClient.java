package com.ngoplatform.external.signzy;

import com.ngoplatform.config.SignzyProperties;
import com.ngoplatform.external.signzy.dto.PanVerificationResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component
@RequiredArgsConstructor
public class SignzyClient {

    private final SignzyProperties properties;
    private final RestTemplate restTemplate = new RestTemplate();

    public PanVerificationResponse verifyPan(String panNumber, String name) {

        String url = properties.getBaseUrl() + "/pan/verify"; // adjust endpoint as per sandbox

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("x-api-key", properties.getApiKey());

        String body = """
                {
                    "panNumber": "%s",
                    "name": "%s"
                }
                """.formatted(panNumber, name);

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        ResponseEntity<PanVerificationResponse> response =
                restTemplate.exchange(url, HttpMethod.POST, request, PanVerificationResponse.class);

        return response.getBody();
    }
}