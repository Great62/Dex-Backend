pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Dai is ERC20 {
    constructor() ERC20("Dai stablecoin", "DAI") {}

    function faucet(address to, uint256 amount) public {
        _mint(to, amount);
    }
}
