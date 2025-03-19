import { useAccount, useDisconnect, useSwitchChain } from "wagmi";
import { useState } from "react";

export const Profile = () => {
    const { address, connector } = useAccount();
    const { disconnect } = useDisconnect();
    const { chains, switchChain } = useSwitchChain();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isChainModalOpen, setIsChainModalOpen] = useState(false);

    const truncateAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const copyAddress = () => {
        navigator.clipboard.writeText(address || "");
        alert("Address copied to clipboard!");
    };

    return (
        <div className="relative">
            {/* Profile Pill */}
            <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 bg-[#415A77] hover:bg-[#778DA9] text-[#E0E1DD] rounded-full py-2 px-4 transition-colors duration-200"
            >
                <img src={connector?.icon} alt={connector?.name} className="w-5 h-5" />
                <span className="font-medium">{truncateAddress(address || "")}</span>
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#E0E1DD] rounded-lg shadow-lg z-10">
                    <button
                        onClick={copyAddress}
                        className="block w-full text-left px-4 py-2 text-[#415A77] hover:bg-[#778DA9] hover:text-[#E0E1DD] rounded-t-lg"
                    >
                        Copy Address
                    </button>
                    <button
                        onClick={() => setIsChainModalOpen(true)}
                        className="block w-full text-left px-4 py-2 text-[#415A77] hover:bg-[#778DA9] hover:text-[#E0E1DD]"
                    >
                        Switch Chain
                    </button>
                    <button
                        onClick={() => disconnect()}
                        className="block w-full text-left px-4 py-2 text-[#415A77] hover:bg-[#778DA9] hover:text-[#E0E1DD] rounded-b-lg"
                    >
                        Disconnect
                    </button>
                </div>
            )}

            {/* Chain Switch Modal */}
            {isChainModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-[#E0E1DD] rounded-lg p-6 w-96">
                        <h2 className="text-xl font-bold text-[#415A77] mb-4">Switch Chain</h2>
                        <div className="space-y-2">
                            {chains.map((chain) => (
                                <button
                                    key={chain.id}
                                    onClick={() => {
                                        switchChain({ chain });
                                        setIsChainModalOpen(false);
                                    }}
                                    className="block w-full text-left px-4 py-2 text-[#415A77] hover:bg-[#778DA9] hover:text-[#E0E1DD] rounded-lg"
                                >
                                    {chain.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsChainModalOpen(false)}
                            className="mt-4 w-full px-4 py-2 bg-[#415A77] text-[#E0E1DD] rounded-lg hover:bg-[#778DA9] transition-colors duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};