package com.ngoplatform.blockchain;

import com.ngoplatform.blockchain.contract.NGORegistration;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.web3j.protocol.Web3j;
import org.web3j.tx.ClientTransactionManager;

@Service
@RequiredArgsConstructor
public class NgoRegistrationContractService {

    private final Web3j web3j;

    @Value("${blockchain.contract-address}")
    private String contractAddress;

    public NGORegistration loadContract(String userWalletAddress) {

        return NGORegistration.load(
                contractAddress,
                web3j,
                new ClientTransactionManager(web3j, userWalletAddress),
                NGORegistration.GAS_PRICE,
                NGORegistration.GAS_LIMIT
        );
    }
}