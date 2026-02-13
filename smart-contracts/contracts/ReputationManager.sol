// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

interface IDonationManager {
    function hasDonated(uint campaignId, address user) external view returns(bool);
    function getCampaign(uint campaignId) external view returns(
        address ngo,
        uint targetAmount,
        uint raisedAmount,
        uint milestoneIndex,
        uint[3] memory milestoneBudget,
        bool[3] memory milestoneComplete,
        bool isActive,
        bool firstMilestonePaid,
        bool fundingClosed
    );
}

contract ReputationManager {
    address public admin;
    address public donationManager;

    mapping(address => uint) public ratingSum;      // total rating stars received
    mapping(address => uint) public totalRatings;   // number of ratings received
    mapping(uint => mapping(address => bool)) public hasRated; // per campaign rating flag

    event NGORated(uint campaignId, address ngo, address ratedBy, uint stars);
    event ReputationUpdated(address ngo, uint newAverage);
    
    constructor(address _donationManager) {
        admin = msg.sender;
        donationManager = _donationManager;
    }

    // Rate NGO after donating to campaign
    function rateNGO(uint campaignId, uint stars) public {
        require(stars >= 1 && stars <= 5, "Rating must be 1-5");
        require(
            IDonationManager(donationManager).hasDonated(campaignId, msg.sender),
            "Must donate before rating"
        );
        require(!hasRated[campaignId][msg.sender], "Already rated");

        // Get NGO address from the campaign stored in DonationManager
        (address ngo,,,,,,,,) = IDonationManager(donationManager).getCampaign(campaignId);

        ratingSum[ngo] += stars;
        totalRatings[ngo]++;

        hasRated[campaignId][msg.sender] = true;

        emit NGORated(campaignId, ngo, msg.sender, stars);
        emit ReputationUpdated(ngo, getReputationScore(ngo));
    }

    // Returns avg rating e.g., 4.5 (scaled as 450 → divide by 100 in frontend)
    function getReputationScore(address ngo) public view returns(uint) {
        if (totalRatings[ngo] == 0) return 0;
        return (ratingSum[ngo] * 100) / totalRatings[ngo]; 
        // Example: rating 4.5 => returns 450 → UI prints 4.5
    }

    // Optional admin reset (avoid abuse)
    function resetRatings(address ngo) public {
        require(msg.sender == admin, "Only admin");
        ratingSum[ngo] = 0;
        totalRatings[ngo] = 0;
    }
}
