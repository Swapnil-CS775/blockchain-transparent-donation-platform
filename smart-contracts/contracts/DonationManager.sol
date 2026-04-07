// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

//new update
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface INGORegistry {
    function isVarifiedNGO(address ngo) external view returns (bool);
}

contract DonationManager {
    address public admin;
    address public ngoRegistry;
    address public reputationContract;

    //new update
    IERC20 public usdtToken;

    constructor(address _ngoRegistry,address _usdtAddress) {
        admin = msg.sender;
        ngoRegistry = _ngoRegistry;
        //new update
        usdtToken = IERC20(_usdtAddress);
    }

    // ************* EVENTS **************
    event CampaignCreated(uint campaignId, address ngo, uint target);
    event DonationReceived(uint campaignId, address donor, uint amount);
    event TargetReached(uint campaignId, uint targetAmount);
    event FirstMilestoneReleased(uint campaignId, uint amount);
    event ProofSubmitted(uint campaignId, uint milestoneIndex, string ipfsHash);
    event MilestoneApproved(uint campaignId, uint milestoneIndex, uint amount);
    event CampaignCompleted(uint campaignId);
    event SurplusWithdrawn(uint campaignId, uint amount);

    // ************* STRUCT **************
    struct Campaign {
        address ngo;
        uint targetAmount;
        uint raisedAmount;
        uint totalPaid;
        uint milestoneIndex;
        uint[3] milestoneBudget;
        bool[3] milestoneComplete;
        bool isActive;
        bool firstMilestonePaid;
        bool fundingClosed;
    }

    mapping(uint => Campaign) public campaigns;
    mapping(uint => mapping(uint => string)) public milestoneProof;
    mapping(uint => mapping(address => uint)) public donorAmounts;
    mapping(uint=>mapping(address=>bool)) public hasDonated;
    mapping(uint => uint) public campaignBalance;

    uint public campaignCount;

    // ************* CREATE CAMPAIGN **************
    function createCampaign(
        uint targetAmount,
        uint m1,
        uint m2,
        uint m3
    ) public {
        require(
            INGORegistry(ngoRegistry).isVarifiedNGO(msg.sender),
            "NGO is NOT verified"
        );
        require(targetAmount > 0, "Target must be > 0");
        require(targetAmount == (m1 + m2 + m3), "Milestones must total target");

        Campaign storage c = campaigns[campaignCount];

        c.ngo = msg.sender;
        c.targetAmount = targetAmount;
        c.raisedAmount = 0;
        c.milestoneIndex = 0;
        c.totalPaid=0;
        c.milestoneBudget = [m1, m2, m3];
        c.isActive = true;
        c.firstMilestonePaid = false;
        c.fundingClosed = false;

        emit CampaignCreated(campaignCount, msg.sender, targetAmount);

        campaignCount++;
    }

    // ************* DONATE **************
    function donate(uint campaignId,uint amount) public payable {
        Campaign storage c = campaigns[campaignId];

        require(c.isActive, "Campaign closed");
        require(amount > 0, "Amount must be > 0");
        require(!c.fundingClosed, "Funding already completed");

        require(
            usdtToken.transferFrom(msg.sender, address(this), amount),
            "USDT transfer failed"
        );
        campaignBalance[campaignId] += amount;
        uint remaining = c.targetAmount - c.raisedAmount;

        if (remaining > 0) {
            if (amount <= remaining) {
                c.raisedAmount += amount;
            } else {
                c.raisedAmount = c.targetAmount;
                c.fundingClosed = true;
                emit TargetReached(campaignId, c.targetAmount);
            }
        }

        // store full contributed amount for reference
        donorAmounts[campaignId][msg.sender] += amount;
        hasDonated[campaignId][msg.sender] = true;

        emit DonationReceived(campaignId, msg.sender, amount);

        //Auto release first milestone
        if (!c.firstMilestonePaid && c.raisedAmount >= c.milestoneBudget[0]) {
            require(
                campaignBalance[campaignId] >= c.milestoneBudget[0],
                "Not enough campaign funds"
            );

            campaignBalance[campaignId] -= c.milestoneBudget[0];

            require(
                usdtToken.transfer(c.ngo, c.milestoneBudget[0]),
                "Milestone transfer failed"
            );

            c.firstMilestonePaid = true;

            emit FirstMilestoneReleased(
                campaignId,
                c.milestoneBudget[0]
            );
        }
    }

    // ************* SUBMIT PROOF **************
    function submitProof(uint campaignId, string memory ipfsHash) public {
        Campaign storage c = campaigns[campaignId];

        require(msg.sender == c.ngo, "Only NGO");
        require(c.isActive, "Campaign closed");
        require(c.milestoneIndex <=2,"All milestones already completed");
        require(!c.milestoneComplete[c.milestoneIndex],"Already submitted/verified");
        require(
                (c.milestoneIndex == 0 && c.firstMilestonePaid) ||
                (c.milestoneIndex > 0 && c.milestoneComplete[c.milestoneIndex-1]),
                "Milestone funds not released yet"
            );

        milestoneProof[campaignId][c.milestoneIndex] = ipfsHash;
        c.milestoneComplete[c.milestoneIndex] = true; // mark submitted

        emit ProofSubmitted(campaignId, c.milestoneIndex, ipfsHash);
    }   

    // ************* VERIFY & RELEASE **************
function verifyMilestone(uint campaignId) public {
    Campaign storage c = campaigns[campaignId];

    require(msg.sender == admin, "Admin only");
    require(c.isActive, "Campaign closed");
    require(c.milestoneIndex <=2, "All done");
    require(c.milestoneComplete[c.milestoneIndex],"Proof not submitted");

    // If milestoneIndex == 0, first payment is already done automatically.
    if(c.milestoneIndex < 2) {
        uint nextAmount = c.milestoneBudget[c.milestoneIndex + 1];

        // *** CHECK If enough ETH is collected ***
        require(
            campaignBalance[campaignId] >= nextAmount,
            "Not enough funds for this campaign"
        );

        campaignBalance[campaignId] -= nextAmount;

        c.totalPaid += nextAmount;
        require(usdtToken.transfer(c.ngo, nextAmount), "Transfer failed");
        emit MilestoneApproved(campaignId, c.milestoneIndex, nextAmount);
    } else {
        // Last milestone – no new funds sent here
        emit MilestoneApproved(campaignId, c.milestoneIndex, 0);
    }

    c.milestoneIndex++;

    // If milestone 2 done
    if (c.milestoneIndex == 3) {
        c.isActive = false;
        emit CampaignCompleted(campaignId);
    }
}


    // ************* WITHDRAW SURPLUS **************
    function withdrawSurplus(uint campaignId) public {
        Campaign storage c = campaigns[campaignId];

        require(msg.sender == admin, "Admin only");
        require(!c.isActive, "Campaign not finished"); // Wait until milestones done

        uint surplus = campaignBalance[campaignId];
        require(surplus > 0, "No surplus");

        campaignBalance[campaignId] = 0;

        require(usdtToken.transfer(admin, surplus), "Withdrawal failed");

        emit SurplusWithdrawn(campaignId, surplus);
    }

    function setReputationContract(address _rep) public {
        require(msg.sender == admin, "Only admin");
        reputationContract = _rep;
    }
    
    function getCampaign(uint id) public view returns(
        address ngo,
        uint targetAmount,
        uint raisedAmount,
        uint milestoneIndex,
        uint[3] memory milestoneBudget,
        bool[3] memory milestoneComplete,
        bool isActive,
        bool firstMilestonePaid,
        bool fundingClosed
    ){
        Campaign storage c = campaigns[id];
        return (
            c.ngo,
            c.targetAmount,
            c.raisedAmount,
            c.milestoneIndex,
            c.milestoneBudget,
            c.milestoneComplete,
            c.isActive,
            c.firstMilestonePaid,
            c.fundingClosed
        );
    }

}
