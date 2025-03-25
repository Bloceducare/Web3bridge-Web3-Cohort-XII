// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract Swap {
    using SafeERC20 for IERC20;
    address public tokenX;
    address public tokenY;

    event Swapped(
        address indexed _tokenX,
        address indexed _tokenY,
        uint256 amountX,
        uint256 amountY
    );

    error invalidAmount();
    error insufficientBalance();
    error noLiquidity();
    error invalidSwap();
    error invalidAddress();
    error swapFailed();

    constructor(address _tokenX, address _tokenY) {
        tokenX = _tokenX;
        tokenY = _tokenY;
    }

    function swap(uint256 amountX, uint256 amountY, address to) public {
        if (amountX == 0 || amountY == 0) revert invalidAmount();
        if (to == tokenX || to == tokenY || to == address(0))
            revert invalidAddress();
        if (IERC20(tokenX).balanceOf(to) < amountX)
            revert insufficientBalance();
        if (IERC20(tokenY).balanceOf(to) < amountY)
            revert insufficientBalance();
        if (amountX != 0 && IERC20(tokenY).balanceOf(address(this)) < 1)
            revert noLiquidity();
        if (amountY != 0 && IERC20(tokenX).balanceOf(address(this)) < 1)
            revert noLiquidity();

        uint256 balanceX = IERC20(tokenX).balanceOf(address(this));
        uint256 balanceY = IERC20(tokenY).balanceOf(address(this));

        uint256 xy = balanceX * balanceY;

        if (amountX != 0) {
            IERC20(tokenX).safeTransferFrom(msg.sender, address(this), amountX);
            uint256 _balanceX = balanceX + amountX;
            uint256 _balanceY = xy / (_balanceX * 1e18);
            uint256 amountOutY = _balanceY - balanceY;
            if (xy > _balanceX * _balanceY) revert swapFailed();
            IERC20(tokenY).safeTransfer(to, amountOutY);
            emit Swapped(tokenX, tokenX, amountX, amountOutY);
        }
        if (amountY != 0) {
            IERC20(tokenY).safeTransferFrom(msg.sender, address(this), amountY);
            uint256 _balanceY = balanceY + amountX;
            uint256 _balanceX = xy / (_balanceY * 1e18);
            uint256 amountOutX = _balanceX - balanceX;
            if (xy > _balanceY * _balanceY) revert swapFailed();
            IERC20(tokenX).safeTransfer(to, amountOutX);
            emit Swapped(tokenY, tokenX, amountY, amountOutX);
        }
    }
}
