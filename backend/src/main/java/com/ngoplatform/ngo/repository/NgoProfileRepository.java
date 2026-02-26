package com.ngoplatform.ngo.repository;

import com.ngoplatform.ngo.entity.NgoProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface NgoProfileRepository extends JpaRepository<NgoProfile, UUID> {
	Optional<NgoProfile> findByUser_WalletAddress(String walletAddress);
	Optional<NgoProfile> findByUser_Id(UUID userId);
}