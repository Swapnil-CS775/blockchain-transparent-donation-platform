package com.ngoplatform.external.ipfs;

import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ipfs")
@RequiredArgsConstructor
public class IpfsController {

    private final IpfsService ipfsService;

    // Endpoint 1: api.post('/ipfs/upload', data)
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadBinary(@RequestParam("file") MultipartFile file) {
        try {
            String cid = ipfsService.uploadFile(file.getBytes());
            return ResponseEntity.ok(Map.of("cid", cid));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    // Endpoint 2: api.post('/ipfs/upload-json', masterMetadata)
    @PostMapping("/upload-json")
    public ResponseEntity<Map<String, String>> uploadMetadata(@RequestBody Object metadata) {
        try {
            // Convert the metadata object to JSON bytes and upload
            String cid = ipfsService.uploadJsonMetadata(metadata);
            return ResponseEntity.ok(Map.of("cid", cid));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}