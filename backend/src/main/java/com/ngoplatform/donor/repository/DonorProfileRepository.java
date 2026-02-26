package com.ngoplatform.donor.repository;

import com.ngoplatform.donor.entity.DonorProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DonorProfileRepository extends JpaRepository<DonorProfile, UUID> {
}