//SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Script} from "forge-std/Script.sol";
import {DevOpsTools} from "foundry-devops/src/DevOpsTools.sol";
import {MerkleAirdrop} from "src/MerkleAirdrop.sol";

contract ClaimAirdrop is Script {
    error ClaimAirdrop__InvalidSignatureLength();

address CLAIMING_ADDRESS = 0x9fDBBe3bB33882c4289189BC301017078430a934;
uint256 CLAIMING_AMOUNT = 25 * 1e18;
bytes32 PROOF_ONE = 0xd333253c1fca73d001c7ae7dd4aa0ac2b44f2edf384421a3d4337edc424447c3;
bytes32 PROOF_TWO = 0x0fb85f7b6df160de3a55fbbc3757e1166f70d574c0b5520e22040ad2b88d7a5d;

bytes private SIGNATURE = hex"c2b4fa119d0203fa708cf39a995a2fe8b22d4b2009806d6ab77202e1756bf4a67379558237b42945ce510466f829fb6417df5730a937d7114084df69d0f168a41b";
    // FIX 1: Correct array initialization syntax
    bytes32[] proof = [PROOF_ONE, PROOF_TWO];

    // FIX 2: Removed shadowing `airdrop` param name (renamed to `airdropAddress`)
    function claimAirdrop(address airdropAddress) public {
        // FIX 3: Call splitSignature to obtain v, r, s before using them
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(SIGNATURE);
        vm.startBroadcast();
        // FIX 4: Correct cast syntax — MerkleAirdrop(addr).method() not MerkleAirdrop(addr.method())
        MerkleAirdrop(airdropAddress).claim(CLAIMING_ADDRESS, CLAIMING_AMOUNT, proof, v, r, s);
        vm.stopBroadcast();
    }

    function splitSignature(bytes memory signature) public pure returns (bytes32 r, bytes32 s, uint8 v) {
        // FIX 5: Typo `lenght` → `length`, and condition flipped to != 65
        if (signature.length != 65) {
            revert ClaimAirdrop__InvalidSignatureLength();
        }

        assembly {
            r := mload(add(signature, 32))
            s := mload(add(signature, 64))
            v := byte(0, mload(add(signature, 96)))
        }
    }

    function run() external {
        address mostRecentlyDeployed = DevOpsTools.get_most_recent_deployment(
            "MerkleAirdrop",
            // FIX 6: Use actual block.chainid opcode, not a string literal
            block.chainid
        );
        claimAirdrop(mostRecentlyDeployed);
    }
}
