package com.ngoplatform.common.enums;

public enum MilestoneStatus {
	LOCKED,      // Goal not yet reached; funds are not available
    PENDING,     // Funds are raised, NGO can now start working/submit proof
    SUBMITTED,   // NGO has uploaded proof (image/desc) and is awaiting Admin review
    APPROVED,    // Admin verified the proof; funds are ready for release
    RELEASED,    // Smart contract has successfully transferred the money to NGO
    REJECTED
}
