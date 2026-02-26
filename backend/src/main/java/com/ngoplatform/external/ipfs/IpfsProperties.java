package com.ngoplatform.external.ipfs;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "ipfs")
public class IpfsProperties {

    private String apiUrl;
    private String gatewayUrl;
}