package com.ngoplatform.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@ConfigurationProperties(prefix = "encryption")
public class EncryptProperties {
	private String secret;
}
