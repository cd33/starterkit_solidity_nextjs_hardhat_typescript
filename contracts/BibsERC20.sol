// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Bibs ERC20
/// @author cd33
contract BibsERC20 is ERC20, Ownable {
    constructor() ERC20("BibsERC20", "BIBS") {
        _mint(msg.sender, 1e24);
    }

    function mint(address _to, uint256 _amount) external onlyOwner {
        _mint(_to, _amount);
    }
}
