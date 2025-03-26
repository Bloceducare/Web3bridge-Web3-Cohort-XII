import { WalletOptions } from "./walletOption";
import { Profile } from "./profile";
import { useAccount } from "wagmi";

export const Header = () => {
    const { isConnected } = useAccount();

    return (
        <header className="flex items-center justify-between py-4 px-6 bg-[#E0E1DD] text-[#415A77] shadow-lg">
            {/* Project Name (Centered) */}
            <h1 className="text-3xl font-bold text-[#415A77] absolute left-1/2 transform -translate-x-1/2">
                Uniswap V2 Pair Checker
            </h1>

            {/* Wallet Connection Section (Top Right) */}
            <div className="ml-auto">
                {isConnected ? <Profile /> : <WalletOptions />}
            </div>
        </header>
    );
};