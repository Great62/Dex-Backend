pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Avax is ERC20 {
    constructor() ERC20("Avalanche coin", "AVAX") {}

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
