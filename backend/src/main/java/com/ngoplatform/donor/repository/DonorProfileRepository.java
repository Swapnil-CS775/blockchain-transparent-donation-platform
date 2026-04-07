package com.ngoplatform.donor.repository;

import com.ngoplatform.donor.entity.DonorProfile;
import com.ngoplatform.user.entity.User;

import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface DonorProfileRepository extends JpaRepository<DonorProfile, UUID> {
	boolean existsByUser(User user);
	Optional<DonorProfile> findByUser_WalletAddress(String walletAddress);
	Optional<DonorProfile> findByUser_Id(UUID userId);
	Long countByTotalDonatedGreaterThan(BigDecimal totalDonated);
}