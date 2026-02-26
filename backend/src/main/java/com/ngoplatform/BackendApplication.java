package com.ngoplatform;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

import com.ngoplatform.config.CryptoProperties;
import com.ngoplatform.config.JwtProperties;
import com.ngoplatform.config.SignzyProperties;
import com.ngoplatform.external.ipfs.IpfsProperties;

@EnableConfigurationProperties({JwtProperties.class,
	SignzyProperties.class,
	CryptoProperties.class,
	IpfsProperties.class
	})
@SpringBootApplication
public class BackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackendApplication.class, args);
	}

}
