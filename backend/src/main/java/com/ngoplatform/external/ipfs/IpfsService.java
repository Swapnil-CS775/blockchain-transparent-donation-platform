package com.ngoplatform.external.ipfs;

import lombok.RequiredArgsConstructor;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.ipfs.api.IPFS;
import io.ipfs.multihash.Multihash;
import jakarta.annotation.PostConstruct;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class IpfsService {
	@Value("${ipfs.node.address}")
    private String ipfsAddress; // Injects the value from properties
	
	private final ObjectMapper objectMapper;

    private IPFS ipfs;
    @PostConstruct
    public void init() {
        // Initializes the IPFS client with the injected address
        this.ipfs = new IPFS(ipfsAddress);
    }

    private final RestTemplate restTemplate;
    private final IpfsProperties properties;

    public String uploadFile(byte[] fileBytes) {

        String url = properties.getApiUrl() + "/api/v0/add";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(fileBytes) {
            @Override
            public String getFilename() {
                return "encrypted_file";
            }
        });

        HttpEntity<MultiValueMap<String, Object>> request =
                new HttpEntity<>(body, headers);

        ResponseEntity<Map> response =
                restTemplate.postForEntity(url, request, Map.class);

        return (String) response.getBody().get("Hash");
    }
    
    public String uploadJsonMetadata(Object metadata) throws Exception {
        // 1. Convert Object (MasterMetadata) to JSON Byte Array
        byte[] jsonBytes = objectMapper.writeValueAsBytes(metadata);
        
        // 2. Reuse your existing upload logic to pin it
        return uploadFile(jsonBytes);
    }
    
    // Inside IpfsService.java
    public byte[] getFileBytes(String cid) throws Exception {
        if (cid == null || cid.isEmpty()) return null;
        
        // Using the IPFS 'cat' command to get file content
        return ipfs.cat(Multihash.fromBase58(cid)); 
    }
}