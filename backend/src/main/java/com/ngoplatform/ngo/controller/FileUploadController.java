package com.ngoplatform.ngo.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.ngoplatform.common.util.FileEncryptionService;
import com.ngoplatform.external.ipfs.IpfsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileUploadController {
    private final FileEncryptionService fileEncryptionService;
    private final IpfsService ipfsService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) throws Exception {
        byte[] encryptedBytes = fileEncryptionService.encrypt(file.getBytes());
        String cid = ipfsService.uploadFile(encryptedBytes);
        return ResponseEntity.ok(cid);
    }
}

