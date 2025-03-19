import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const SunshineTokenModule = buildModule("SunshineTokenModule", (m) => {
    const name = "SunshineToken";
    const symbol = "SUN";
    const decimals = 18;
    const initialSupply = 1000000; 

    const sunshineToken = m.contract("SunshineToken", [name, symbol, decimals, initialSupply]);

    return { sunshineToken };
});

export default SunshineTokenModule;
