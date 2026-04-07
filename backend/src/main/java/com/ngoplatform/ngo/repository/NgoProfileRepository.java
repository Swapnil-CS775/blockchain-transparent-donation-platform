package com.ngoplatform.ngo.repository;

import com.ngoplatform.common.enums.OnboardingStatus;
import com.ngoplatform.ngo.entity.NgoProfile;
import com.ngoplatform.user.entity.User;

import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface NgoProfileRepository extends JpaRepository<NgoProfile, UUID> {
	Optional<NgoProfile> findByUser_WalletAddress(String walletAddress);
	Optional<NgoProfile> findByUser_Id(UUID userId);
	boolean existsByUser(User user);
	List<NgoProfile> findByOnboardingStatus(OnboardingStatus status);
	List<NgoProfile> findByOnboardingStatus(OnboardingStatus status, Sort sort);
}