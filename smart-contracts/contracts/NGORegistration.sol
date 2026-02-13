// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract NGORegistration {
    // --- State Variables ---
    address public admin;

    // NGO address => applied?
    mapping(address => bool) public isApplied;

    // NGO address => verified?
    mapping(address => bool) public isVerified;

    // NGO address => document hash stored in IPFS
    mapping(address => string) public docHash;

    // List of approved verifiers (admin included automatically)
    mapping(address => bool) public isVerifier;

    // --- Events for frontend listening ---
    event Applied(address indexed ngo, string ipfsHash);
    event Verified(address indexed ngo, address indexed verifier);
    event VerifierAdded(address indexed newVerifier);
    event VerifierRemoved(address indexed removedVerifier);

    // --- Constructor ---
    constructor() {
        admin = msg.sender;
        isVerifier[msg.sender] = true; // Admin is first verifier
    }

    //NGO applies by submitting IPFS hash
    function applyAsNGO(string memory ipfsHash) public {
        require(!isApplied[msg.sender], "Already applied before");

        isApplied[msg.sender] = true;
        isVerified[msg.sender] = false;
        docHash[msg.sender] = ipfsHash;   // Store only IPFS hash

        emit Applied(msg.sender, ipfsHash);
    }

    //ADMIN adds new verifier
    function addVerifier(address verifier) public {
        require(msg.sender == admin, "Only admin");
        isVerifier[verifier] = true;

        emit VerifierAdded(verifier);
    }

    //ADMIN removes verifier
    function removeVerifier(address verifier) public {
        require(msg.sender == admin, "Only admin");
        isVerifier[verifier] = false;

        emit VerifierRemoved(verifier);
    }

    //VERIFY NGO — allowed by admin OR verifier
    function verifyNGO(address ngoAddress) public {
        require(isVerifier[msg.sender], "Not allowed");
        require(isApplied[ngoAddress], "Not applied");
        require(!isVerified[ngoAddress], "Already verified");

        isVerified[ngoAddress] = true;

        emit Verified(ngoAddress, msg.sender);
    }

    //Check your status (for NGO UI dashboard)
    function myStatus() public view returns(bool applied, bool verified, string memory ipfs){
        return (isApplied[msg.sender], isVerified[msg.sender], docHash[msg.sender]);
    }

    function isVarifiedNGO(address ngo) external view returns(bool) {
        return isVerified[ngo];
    }

}
