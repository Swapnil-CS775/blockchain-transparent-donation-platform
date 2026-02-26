package com.ngoplatform.blockchain;

import com.ngoplatform.blockchain.contract.NGORegistration;
import com.ngoplatform.ngo.repository.NgoProfileRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameterName;


@ConditionalOnProperty(
	    name = "blockchain.enabled",
	    havingValue = "true",
	    matchIfMissing = false
	)
@Service
@RequiredArgsConstructor
public class EventListenerService {

    private final Web3j web3j;
    private final NgoProfileRepository ngoRepository;
    private final NgoRegistrationContractService contractService;

    @PostConstruct
    public void startListening() {

        NGORegistration contract =
                contractService.loadContract("0x0000000000000000000000000000000000000000");

        contract.appliedEventFlowable(
                DefaultBlockParameterName.LATEST,
                DefaultBlockParameterName.LATEST
        ).subscribe(event -> {

            String ngoAddress = event.ngo;
            String ipfsHash = event.ipfsHash;

            System.out.println("NGO Applied: " + ngoAddress);

            // Update DB status = APPLIED
            ngoRepository.findByUser_WalletAddress(ngoAddress.toLowerCase())
                    .ifPresent(profile -> {
                        profile.setOnboardingStatus(
                                com.ngoplatform.common.enums.OnboardingStatus.SUBMITTED
                        );
                        ngoRepository.save(profile);
                    });
        });

        contract.verifiedEventFlowable(
                DefaultBlockParameterName.LATEST,
                DefaultBlockParameterName.LATEST
        ).subscribe(event -> {

            String ngoAddress = event.ngo;

            System.out.println("NGO Verified: " + ngoAddress);

            ngoRepository.findByUser_WalletAddress(ngoAddress.toLowerCase())
                    .ifPresent(profile -> {
                        profile.getUser().setIsVerified(true);
                        profile.getUser().setAccountStatus(
                                com.ngoplatform.common.enums.AccountStatus.ACTIVE
                        );
                        ngoRepository.save(profile);
                    });
        });
    }
}