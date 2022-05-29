pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Klo is ERC20 {
    constructor() ERC20("Kalao token", "KLO") {}

    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
