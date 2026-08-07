import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
const pk = generatePrivateKey();
console.log("DEPLOYER_KEY=" + pk);
console.log("ADDRESS=" + privateKeyToAccount(pk).address);
