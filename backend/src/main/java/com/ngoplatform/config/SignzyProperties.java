package com.ngoplatform.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "signzy")
public class SignzyProperties {

    private String baseUrl;
    private String apiKey;
    private String clientId;
    private String clientSecret;
}