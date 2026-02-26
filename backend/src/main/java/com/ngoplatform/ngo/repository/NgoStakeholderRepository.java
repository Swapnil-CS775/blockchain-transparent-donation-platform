package com.ngoplatform.ngo.repository;

import com.ngoplatform.ngo.entity.NgoStakeholder;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface NgoStakeholderRepository extends JpaRepository<NgoStakeholder, UUID> {

    List<NgoStakeholder> findByNgoProfile_Id(UUID ngoProfileId);
}