const hre = require("hardhat");

async function main() {
  const [admin] = await hre.ethers.getSigners();
  console.log("Deploying with admin:", admin.address);

  // 0 MockUSDT
  const MockUSDT = await hre.ethers.getContractFactory("MockUSDT");
  const mockUSDT = await MockUSDT.deploy(); 
  await mockUSDT.waitForDeployment();
  const usdtAddr = await mockUSDT.getAddress();
  console.log("MockUSDT Deployed at:", usdtAddr);

  // 1️⃣ NGORegistration
  const NGORegistration = await hre.ethers.getContractFactory("NGORegistration");
  const ngoRegistry = await NGORegistration.deploy();
  await ngoRegistry.waitForDeployment();
  const ngoAddr = await ngoRegistry.getAddress();

  console.log("NGORegistration:", ngoAddr);

  // 2️⃣ DonationManager
  const DonationManager = await hre.ethers.getContractFactory("DonationManager");
  const donationManager = await DonationManager.deploy(ngoAddr,usdtAddr);
  await donationManager.waitForDeployment();
  const dmAddr = await donationManager.getAddress();

  console.log("DonationManager:", dmAddr);

  // 3️⃣ ReputationManager
  const ReputationManager = await hre.ethers.getContractFactory("ReputationManager");
  const reputationManager = await ReputationManager.deploy(dmAddr);
  await reputationManager.waitForDeployment();
  const rmAddr = await reputationManager.getAddress();

  console.log("ReputationManager:", rmAddr);

  // 🔗 4️⃣ POST-DEPLOY WIRING (CRITICAL)
  const tx = await donationManager.setReputationContract(rmAddr);
  await tx.wait();

  console.log("Reputation contract linked to DonationManager");

  console.log("\n=== FINAL DEPLOYMENT SUMMARY ===");
  console.log("MockUSDT (USDT):", usdtAddr);
  console.log("NGORegistration:", ngoAddr);
  console.log("DonationManager:", dmAddr);
  console.log("ReputationManager:", rmAddr);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
