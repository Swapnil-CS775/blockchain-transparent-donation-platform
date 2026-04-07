package com.ngoplatform.common.enums;

public enum CampaignStatus {
	DRAFT,       // Campaign created but not yet pushed to blockchain
    ACTIVE,      // Currently accepting donations
    FUNDED,      // Target reached; moving through milestone phases
    COMPLETED,   // All milestones released and campaign finished
    HALTED
}
