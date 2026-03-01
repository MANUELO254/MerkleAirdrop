// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {MerkleAirdrop} from "src/MerkleAirdrop.sol";
import {BagelToken} from "src/BagelToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Deploy is Script {
    bytes32 public ROOT = 0x86d09f653ad806350913b00967ccd82a9774941cb2732bae88b188c55df330d5;
    uint256 public AMOUNT_TO_SEND = 25 * 1e18 * 4;

    function run() external {
        vm.startBroadcast();
        BagelToken token = new BagelToken();
        MerkleAirdrop airdrop = new MerkleAirdrop(ROOT, token);
        token.mint(address(airdrop), AMOUNT_TO_SEND);
        vm.stopBroadcast();
    }
}
