package com.ngoplatform.blockchain.contract;

import io.reactivex.Flowable;
import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.concurrent.Callable;
import org.web3j.abi.EventEncoder;
import org.web3j.abi.TypeReference;
import org.web3j.abi.datatypes.Address;
import org.web3j.abi.datatypes.Bool;
import org.web3j.abi.datatypes.Event;
import org.web3j.abi.datatypes.Function;
import org.web3j.abi.datatypes.Type;
import org.web3j.abi.datatypes.Utf8String;
import org.web3j.crypto.Credentials;
import org.web3j.protocol.Web3j;
import org.web3j.protocol.core.DefaultBlockParameter;
import org.web3j.protocol.core.RemoteCall;
import org.web3j.protocol.core.RemoteFunctionCall;
import org.web3j.protocol.core.methods.request.EthFilter;
import org.web3j.protocol.core.methods.response.BaseEventResponse;
import org.web3j.protocol.core.methods.response.Log;
import org.web3j.protocol.core.methods.response.TransactionReceipt;
import org.web3j.tuples.generated.Tuple3;
import org.web3j.tx.Contract;
import org.web3j.tx.TransactionManager;
import org.web3j.tx.gas.ContractGasProvider;

/**
 * <p>Auto generated code.
 * <p><strong>Do not modify!</strong>
 * <p>Please use the <a href="https://docs.web3j.io/command_line.html">web3j command line tools</a>,
 * or the org.web3j.codegen.SolidityFunctionWrapperGenerator in the 
 * <a href="https://github.com/web3j/web3j/tree/master/codegen">codegen module</a> to update.
 *
 * <p>Generated with web3j version 4.10.3.
 */
@SuppressWarnings("rawtypes")
public class NGORegistration extends Contract {
    public static final String BINARY = "6080604052348015600f57600080fd5b50336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506001600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555061146e806100b76000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80639000b3d6116100715780639000b3d6146101765780639ce85dff14610192578063b0c15713146101b2578063b9209e33146101e2578063ca2dfd0a14610212578063f851a4401461022e576100a9565b8063087c7110146100ae5780632d2c682f146100de57806333105218146100fa57806343ab317c1461012a578063522940e71461015a575b600080fd5b6100c860048036038101906100c39190610c39565b61024c565b6040516100d59190610c81565b60405180910390f35b6100f860048036038101906100f39190610c39565b6102a2565b005b610114600480360381019061010f9190610c39565b6104fc565b6040516101219190610c81565b60405180910390f35b610144600480360381019061013f9190610c39565b61051c565b6040516101519190610d2c565b60405180910390f35b610174600480360381019061016f9190610e83565b6105bc565b005b610190600480360381019061018b9190610c39565b610796565b005b61019a6108c2565b6040516101a993929190610ecc565b60405180910390f35b6101cc60048036038101906101c79190610c39565b610a37565b6040516101d99190610c81565b60405180910390f35b6101fc60048036038101906101f79190610c39565b610a57565b6040516102099190610c81565b60405180910390f35b61022c60048036038101906102279190610c39565b610a77565b005b610236610ba3565b6040516102439190610f19565b60405180910390f35b6000600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff169050919050565b600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1661032e576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161032590610f80565b60405180910390fd5b600160008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff166103ba576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103b190610fec565b60405180910390fd5b600260008273ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1615610447576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161043e90611058565b60405180910390fd5b6001600260008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055503373ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f78a953f3f0d92abc078a34e5d4fedf8708e788e1b29300b3d6170e97f88a13fc60405160405180910390a350565b60046020528060005260406000206000915054906101000a900460ff1681565b6003602052806000526040600020600091509050805461053b906110a7565b80601f0160208091040260200160405190810160405280929190818152602001828054610567906110a7565b80156105b45780601f10610589576101008083540402835291602001916105b4565b820191906000526020600020905b81548152906001019060200180831161059757829003601f168201915b505050505081565b600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff1615610649576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161064090611124565b60405180910390fd5b60018060003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055506000600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff02191690831515021790555080600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020908161074491906112fa565b503373ffffffffffffffffffffffffffffffffffffffff167f87e196a8a1808969619bf8db48aac53ead5c35e0cec6c11d84a3b2634dc5a7a98260405161078b9190610d2c565b60405180910390a250565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610824576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161081b90611418565b60405180910390fd5b6001600460008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508073ffffffffffffffffffffffffffffffffffffffff167f6d05492139c5ea989514a5d2150c028041e5c087e2a39967f67dc7d2655adb8160405160405180910390a250565b6000806060600160003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16600260003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060009054906101000a900460ff16600360003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000208080546109ac906110a7565b80601f01602080910402602001604051908101604052809291908181526020018280546109d8906110a7565b8015610a255780601f106109fa57610100808354040283529160200191610a25565b820191906000526020600020905b815481529060010190602001808311610a0857829003601f168201915b50505050509050925092509250909192565b60016020528060005260406000206000915054906101000a900460ff1681565b60026020528060005260406000206000915054906101000a900460ff1681565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff1614610b05576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610afc90611418565b60405180910390fd5b6000600460008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060006101000a81548160ff0219169083151502179055508073ffffffffffffffffffffffffffffffffffffffff167f44a3cd4eb5cc5748f6169df057b1cb2ae4c383e87cd94663c430e095d4cba42460405160405180910390a250565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b6000604051905090565b600080fd5b600080fd5b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000610c0682610bdb565b9050919050565b610c1681610bfb565b8114610c2157600080fd5b50565b600081359050610c3381610c0d565b92915050565b600060208284031215610c4f57610c4e610bd1565b5b6000610c5d84828501610c24565b91505092915050565b60008115159050919050565b610c7b81610c66565b82525050565b6000602082019050610c966000830184610c72565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b83811015610cd6578082015181840152602081019050610cbb565b60008484015250505050565b6000601f19601f8301169050919050565b6000610cfe82610c9c565b610d088185610ca7565b9350610d18818560208601610cb8565b610d2181610ce2565b840191505092915050565b60006020820190508181036000830152610d468184610cf3565b905092915050565b600080fd5b600080fd5b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b610d9082610ce2565b810181811067ffffffffffffffff82111715610daf57610dae610d58565b5b80604052505050565b6000610dc2610bc7565b9050610dce8282610d87565b919050565b600067ffffffffffffffff821115610dee57610ded610d58565b5b610df782610ce2565b9050602081019050919050565b82818337600083830152505050565b6000610e26610e2184610dd3565b610db8565b905082815260208101848484011115610e4257610e41610d53565b5b610e4d848285610e04565b509392505050565b600082601f830112610e6a57610e69610d4e565b5b8135610e7a848260208601610e13565b91505092915050565b600060208284031215610e9957610e98610bd1565b5b600082013567ffffffffffffffff811115610eb757610eb6610bd6565b5b610ec384828501610e55565b91505092915050565b6000606082019050610ee16000830186610c72565b610eee6020830185610c72565b8181036040830152610f008184610cf3565b9050949350505050565b610f1381610bfb565b82525050565b6000602082019050610f2e6000830184610f0a565b92915050565b7f4e6f7420616c6c6f776564000000000000000000000000000000000000000000600082015250565b6000610f6a600b83610ca7565b9150610f7582610f34565b602082019050919050565b60006020820190508181036000830152610f9981610f5d565b9050919050565b7f4e6f74206170706c696564000000000000000000000000000000000000000000600082015250565b6000610fd6600b83610ca7565b9150610fe182610fa0565b602082019050919050565b6000602082019050818103600083015261100581610fc9565b9050919050565b7f416c726561647920766572696669656400000000000000000000000000000000600082015250565b6000611042601083610ca7565b915061104d8261100c565b602082019050919050565b6000602082019050818103600083015261107181611035565b9050919050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602260045260246000fd5b600060028204905060018216806110bf57607f821691505b6020821081036110d2576110d1611078565b5b50919050565b7f416c7265616479206170706c696564206265666f726500000000000000000000600082015250565b600061110e601683610ca7565b9150611119826110d8565b602082019050919050565b6000602082019050818103600083015261113d81611101565b9050919050565b60008190508160005260206000209050919050565b60006020601f8301049050919050565b600082821b905092915050565b6000600883026111a67fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff82611169565b6111b08683611169565b95508019841693508086168417925050509392505050565b6000819050919050565b6000819050919050565b60006111f76111f26111ed846111c8565b6111d2565b6111c8565b9050919050565b6000819050919050565b611211836111dc565b61122561121d826111fe565b848454611176565b825550505050565b600090565b61123a61122d565b611245818484611208565b505050565b5b818110156112695761125e600082611232565b60018101905061124b565b5050565b601f8211156112ae5761127f81611144565b61128884611159565b81016020851015611297578190505b6112ab6112a385611159565b83018261124a565b50505b505050565b600082821c905092915050565b60006112d1600019846008026112b3565b1980831691505092915050565b60006112ea83836112c0565b9150826002028217905092915050565b61130382610c9c565b67ffffffffffffffff81111561131c5761131b610d58565b5b61132682546110a7565b61133182828561126d565b600060209050601f8311600181146113645760008415611352578287015190505b61135c85826112de565b8655506113c4565b601f19841661137286611144565b60005b8281101561139a57848901518255600182019150602085019450602081019050611375565b868310156113b757848901516113b3601f8916826112c0565b8355505b6001600288020188555050505b505050505050565b7f4f6e6c792061646d696e00000000000000000000000000000000000000000000600082015250565b6000611402600a83610ca7565b915061140d826113cc565b602082019050919050565b60006020820190508181036000830152611431816113f5565b905091905056fea2646970667358221220648ed35e90aa00e98fe6f5c033961daf77a27449ddb521915e53fa187df63ece64736f6c634300081c0033";

    public static final String FUNC_ADDVERIFIER = "addVerifier";

    public static final String FUNC_ADMIN = "admin";

    public static final String FUNC_APPLYASNGO = "applyAsNGO";

    public static final String FUNC_DOCHASH = "docHash";

    public static final String FUNC_ISAPPLIED = "isApplied";

    public static final String FUNC_ISVARIFIEDNGO = "isVarifiedNGO";

    public static final String FUNC_ISVERIFIED = "isVerified";

    public static final String FUNC_ISVERIFIER = "isVerifier";

    public static final String FUNC_MYSTATUS = "myStatus";

    public static final String FUNC_REMOVEVERIFIER = "removeVerifier";

    public static final String FUNC_VERIFYNGO = "verifyNGO";

    public static final Event APPLIED_EVENT = new Event("Applied", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Utf8String>() {}));
    ;

    public static final Event VERIFIED_EVENT = new Event("Verified", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}, new TypeReference<Address>(true) {}));
    ;

    public static final Event VERIFIERADDED_EVENT = new Event("VerifierAdded", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}));
    ;

    public static final Event VERIFIERREMOVED_EVENT = new Event("VerifierRemoved", 
            Arrays.<TypeReference<?>>asList(new TypeReference<Address>(true) {}));
    ;

    @Deprecated
    protected NGORegistration(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    protected NGORegistration(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, credentials, contractGasProvider);
    }

    @Deprecated
    protected NGORegistration(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        super(BINARY, contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    protected NGORegistration(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        super(BINARY, contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static List<AppliedEventResponse> getAppliedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(APPLIED_EVENT, transactionReceipt);
        ArrayList<AppliedEventResponse> responses = new ArrayList<AppliedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            AppliedEventResponse typedResponse = new AppliedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.ngo = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.ipfsHash = (String) eventValues.getNonIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public static AppliedEventResponse getAppliedEventFromLog(Log log) {
        Contract.EventValuesWithLog eventValues = staticExtractEventParametersWithLog(APPLIED_EVENT, log);
        AppliedEventResponse typedResponse = new AppliedEventResponse();
        typedResponse.log = log;
        typedResponse.ngo = (String) eventValues.getIndexedValues().get(0).getValue();
        typedResponse.ipfsHash = (String) eventValues.getNonIndexedValues().get(0).getValue();
        return typedResponse;
    }

    public Flowable<AppliedEventResponse> appliedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(log -> getAppliedEventFromLog(log));
    }

    public Flowable<AppliedEventResponse> appliedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(APPLIED_EVENT));
        return appliedEventFlowable(filter);
    }

    public static List<VerifiedEventResponse> getVerifiedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(VERIFIED_EVENT, transactionReceipt);
        ArrayList<VerifiedEventResponse> responses = new ArrayList<VerifiedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            VerifiedEventResponse typedResponse = new VerifiedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.ngo = (String) eventValues.getIndexedValues().get(0).getValue();
            typedResponse.verifier = (String) eventValues.getIndexedValues().get(1).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public static VerifiedEventResponse getVerifiedEventFromLog(Log log) {
        Contract.EventValuesWithLog eventValues = staticExtractEventParametersWithLog(VERIFIED_EVENT, log);
        VerifiedEventResponse typedResponse = new VerifiedEventResponse();
        typedResponse.log = log;
        typedResponse.ngo = (String) eventValues.getIndexedValues().get(0).getValue();
        typedResponse.verifier = (String) eventValues.getIndexedValues().get(1).getValue();
        return typedResponse;
    }

    public Flowable<VerifiedEventResponse> verifiedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(log -> getVerifiedEventFromLog(log));
    }

    public Flowable<VerifiedEventResponse> verifiedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(VERIFIED_EVENT));
        return verifiedEventFlowable(filter);
    }

    public static List<VerifierAddedEventResponse> getVerifierAddedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(VERIFIERADDED_EVENT, transactionReceipt);
        ArrayList<VerifierAddedEventResponse> responses = new ArrayList<VerifierAddedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            VerifierAddedEventResponse typedResponse = new VerifierAddedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.newVerifier = (String) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public static VerifierAddedEventResponse getVerifierAddedEventFromLog(Log log) {
        Contract.EventValuesWithLog eventValues = staticExtractEventParametersWithLog(VERIFIERADDED_EVENT, log);
        VerifierAddedEventResponse typedResponse = new VerifierAddedEventResponse();
        typedResponse.log = log;
        typedResponse.newVerifier = (String) eventValues.getIndexedValues().get(0).getValue();
        return typedResponse;
    }

    public Flowable<VerifierAddedEventResponse> verifierAddedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(log -> getVerifierAddedEventFromLog(log));
    }

    public Flowable<VerifierAddedEventResponse> verifierAddedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(VERIFIERADDED_EVENT));
        return verifierAddedEventFlowable(filter);
    }

    public static List<VerifierRemovedEventResponse> getVerifierRemovedEvents(TransactionReceipt transactionReceipt) {
        List<Contract.EventValuesWithLog> valueList = staticExtractEventParametersWithLog(VERIFIERREMOVED_EVENT, transactionReceipt);
        ArrayList<VerifierRemovedEventResponse> responses = new ArrayList<VerifierRemovedEventResponse>(valueList.size());
        for (Contract.EventValuesWithLog eventValues : valueList) {
            VerifierRemovedEventResponse typedResponse = new VerifierRemovedEventResponse();
            typedResponse.log = eventValues.getLog();
            typedResponse.removedVerifier = (String) eventValues.getIndexedValues().get(0).getValue();
            responses.add(typedResponse);
        }
        return responses;
    }

    public static VerifierRemovedEventResponse getVerifierRemovedEventFromLog(Log log) {
        Contract.EventValuesWithLog eventValues = staticExtractEventParametersWithLog(VERIFIERREMOVED_EVENT, log);
        VerifierRemovedEventResponse typedResponse = new VerifierRemovedEventResponse();
        typedResponse.log = log;
        typedResponse.removedVerifier = (String) eventValues.getIndexedValues().get(0).getValue();
        return typedResponse;
    }

    public Flowable<VerifierRemovedEventResponse> verifierRemovedEventFlowable(EthFilter filter) {
        return web3j.ethLogFlowable(filter).map(log -> getVerifierRemovedEventFromLog(log));
    }

    public Flowable<VerifierRemovedEventResponse> verifierRemovedEventFlowable(DefaultBlockParameter startBlock, DefaultBlockParameter endBlock) {
        EthFilter filter = new EthFilter(startBlock, endBlock, getContractAddress());
        filter.addSingleTopic(EventEncoder.encode(VERIFIERREMOVED_EVENT));
        return verifierRemovedEventFlowable(filter);
    }

    public RemoteFunctionCall<TransactionReceipt> addVerifier(String verifier) {
        final Function function = new Function(
                FUNC_ADDVERIFIER, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, verifier)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<String> admin() {
        final Function function = new Function(FUNC_ADMIN, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Address>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteFunctionCall<TransactionReceipt> applyAsNGO(String ipfsHash) {
        final Function function = new Function(
                FUNC_APPLYASNGO, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Utf8String(ipfsHash)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<String> docHash(String param0) {
        final Function function = new Function(FUNC_DOCHASH, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Utf8String>() {}));
        return executeRemoteCallSingleValueReturn(function, String.class);
    }

    public RemoteFunctionCall<Boolean> isApplied(String param0) {
        final Function function = new Function(FUNC_ISAPPLIED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteFunctionCall<Boolean> isVarifiedNGO(String ngo) {
        final Function function = new Function(FUNC_ISVARIFIEDNGO, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, ngo)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteFunctionCall<Boolean> isVerified(String param0) {
        final Function function = new Function(FUNC_ISVERIFIED, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteFunctionCall<Boolean> isVerifier(String param0) {
        final Function function = new Function(FUNC_ISVERIFIER, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, param0)), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}));
        return executeRemoteCallSingleValueReturn(function, Boolean.class);
    }

    public RemoteFunctionCall<Tuple3<Boolean, Boolean, String>> myStatus() {
        final Function function = new Function(FUNC_MYSTATUS, 
                Arrays.<Type>asList(), 
                Arrays.<TypeReference<?>>asList(new TypeReference<Bool>() {}, new TypeReference<Bool>() {}, new TypeReference<Utf8String>() {}));
        return new RemoteFunctionCall<Tuple3<Boolean, Boolean, String>>(function,
                new Callable<Tuple3<Boolean, Boolean, String>>() {
                    @Override
                    public Tuple3<Boolean, Boolean, String> call() throws Exception {
                        List<Type> results = executeCallMultipleValueReturn(function);
                        return new Tuple3<Boolean, Boolean, String>(
                                (Boolean) results.get(0).getValue(), 
                                (Boolean) results.get(1).getValue(), 
                                (String) results.get(2).getValue());
                    }
                });
    }

    public RemoteFunctionCall<TransactionReceipt> removeVerifier(String verifier) {
        final Function function = new Function(
                FUNC_REMOVEVERIFIER, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, verifier)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    public RemoteFunctionCall<TransactionReceipt> verifyNGO(String ngoAddress) {
        final Function function = new Function(
                FUNC_VERIFYNGO, 
                Arrays.<Type>asList(new org.web3j.abi.datatypes.Address(160, ngoAddress)), 
                Collections.<TypeReference<?>>emptyList());
        return executeRemoteCallTransaction(function);
    }

    @Deprecated
    public static NGORegistration load(String contractAddress, Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return new NGORegistration(contractAddress, web3j, credentials, gasPrice, gasLimit);
    }

    @Deprecated
    public static NGORegistration load(String contractAddress, Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return new NGORegistration(contractAddress, web3j, transactionManager, gasPrice, gasLimit);
    }

    public static NGORegistration load(String contractAddress, Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return new NGORegistration(contractAddress, web3j, credentials, contractGasProvider);
    }

    public static NGORegistration load(String contractAddress, Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return new NGORegistration(contractAddress, web3j, transactionManager, contractGasProvider);
    }

    public static RemoteCall<NGORegistration> deploy(Web3j web3j, Credentials credentials, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(NGORegistration.class, web3j, credentials, contractGasProvider, BINARY, "");
    }

    public static RemoteCall<NGORegistration> deploy(Web3j web3j, TransactionManager transactionManager, ContractGasProvider contractGasProvider) {
        return deployRemoteCall(NGORegistration.class, web3j, transactionManager, contractGasProvider, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<NGORegistration> deploy(Web3j web3j, Credentials credentials, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(NGORegistration.class, web3j, credentials, gasPrice, gasLimit, BINARY, "");
    }

    @Deprecated
    public static RemoteCall<NGORegistration> deploy(Web3j web3j, TransactionManager transactionManager, BigInteger gasPrice, BigInteger gasLimit) {
        return deployRemoteCall(NGORegistration.class, web3j, transactionManager, gasPrice, gasLimit, BINARY, "");
    }

    public static class AppliedEventResponse extends BaseEventResponse {
        public String ngo;

        public String ipfsHash;
    }

    public static class VerifiedEventResponse extends BaseEventResponse {
        public String ngo;

        public String verifier;
    }

    public static class VerifierAddedEventResponse extends BaseEventResponse {
        public String newVerifier;
    }

    public static class VerifierRemovedEventResponse extends BaseEventResponse {
        public String removedVerifier;
    }
}
