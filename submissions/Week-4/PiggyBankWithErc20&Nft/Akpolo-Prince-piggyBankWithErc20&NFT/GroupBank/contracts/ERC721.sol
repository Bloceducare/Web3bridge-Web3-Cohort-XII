pragma solidity 0.8.28;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ourErc721 is ERC721, Ownable{

    uint private nft_id;

    constructor (string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {

        nft_id += 1;
        _mint(msg.sender, nft_id);






    }
function mint(address to, uint256 tokenId) external onlyOwner {
    _mint(to, tokenId);
}

}