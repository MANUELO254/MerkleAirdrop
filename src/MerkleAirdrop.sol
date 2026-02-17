//SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {MerkleProof} from "@openzeppelin/contracts/utils/cryptography/MerkleProof.sol";

contract Airdrop {
    using SafeERC20 for IERC20;

    event Claim(address, uint256);

    error Airdrop__InvalidClaim();
    error Airdrop__AlreadyClaimed();

    bytes32 private immutable i_merkleRoot;
    IERC20 private immutable i_airdropToken;

    mapping(address => bool) s_hasClaimed;

    constructor(bytes32 merkleRoot, IERC20 airdropToken) {
        i_merkleRoot = merkleRoot;
        i_airdropToken = airdropToken;
    }

    function claim(address _account, uint256 _amount, bytes32[] calldata merkleProof) external {
        bytes32 leaf = keccak256(bytes.concat(keccak256(abi.encode(_account, _amount))));
        if (s_hasClaimed[_account]) {
            revert Airdrop__AlreadyClaimed();
        }
        if (MerkleProof.verify(merkleProof, i_merkleRoot, leaf)) {
            revert Airdrop__InvalidClaim();
        }

        s_hasClaimed[_account] = true;

        emit Claim(_account, _amount);

        i_airdropToken.safeTransfer(_account, _amount);
    }

    function getAirdropToken() public view returns (IERC20) {
        return i_airdropToken;
    }

    function getMerkleRoot() public view returns (bytes32) {
        return i_merkleRoot;
    }
}
