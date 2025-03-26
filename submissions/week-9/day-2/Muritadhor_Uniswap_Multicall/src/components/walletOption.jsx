import * as React from "react";
import { useConnect } from "wagmi";

export function WalletOptions() {
    const { connectors, connect } = useConnect();
    const [isModalOpen, setIsModalOpen] = React.useState(false);

    return (
        <div>
            {/* Connect Wallet Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="bg-[#415A77] hover:bg-[#778DA9] text-[#E0E1DD] font-medium py-2 px-4 rounded-full transition-colors duration-200"
            >
                Connect Wallet
            </button>

            {/* Wallet Options Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                    <div className="bg-[#E0E1DD] rounded-lg p-6 w-96">
                        <h2 className="text-xl font-bold text-[#415A77] mb-4">Choose a Wallet</h2>
                        <div className="space-y-2">
                            {connectors.map((connector) => (
                                <button
                                    key={connector.uid}
                                    onClick={() => {
                                        connect({ connector });
                                        setIsModalOpen(false);
                                    }}
                                    className="flex items-center space-x-3 w-full text-left px-4 py-2 text-[#415A77] hover:bg-[#778DA9] hover:text-[#E0E1DD] rounded-lg transition-colors duration-200"
                                >
                                    <img src={connector.icon} alt={connector.name} className="w-6 h-6" />
                                    <span>{connector.name}</span>
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="mt-4 w-full px-4 py-2 bg-[#415A77] text-[#E0E1DD] rounded-lg hover:bg-[#778DA9] transition-colors duration-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}