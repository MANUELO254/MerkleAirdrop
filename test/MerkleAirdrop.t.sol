// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import {Test} from "forge-std/Test.sol";
import {MerkleAirdrop} from "src/MerkleAirdrop.sol";
import {BagelToken} from "src/BagelToken.sol";
import {console} from "forge-std/console.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract TestMerkleAirdrop is Test {
    MerkleAirdrop public airdrop;
    BagelToken public token;
    bytes32 public ROOT = 0x86d09f653ad806350913b00967ccd82a9774941cb2732bae88b188c55df330d5;
    uint256 public AMOUNT_TO_CLAIM = 25 * 1e18;
    uint256 public AMOUNT_TO_SEND = AMOUNT_TO_CLAIM * 4;
    bytes32 proofOne = 0xd333253c1fca73d001c7ae7dd4aa0ac2b44f2edf384421a3d4337edc424447c3;
    bytes32 proofTwo = 0x0fb85f7b6df160de3a55fbbc3757e1166f70d574c0b5520e22040ad2b88d7a5d;
    bytes32[] public PROOF = [proofOne, proofTwo];
    address public gasPayer;
    address public user;
    uint256 public userPrivKey;

    function setUp() external {
        token = new BagelToken();
        airdrop = new MerkleAirdrop(ROOT, token);
        token.mint(address(airdrop), AMOUNT_TO_SEND);

        (user, userPrivKey) = makeAddrAndKey("user");
        gasPayer = makeAddr("gasPayer");

        console.log("User address:", user); // temporary
    }

    function testUsersCanClaim() public {
        uint256 startingBalance = token.balanceOf(user);

        bytes32 digest = airdrop.getMessageHash(user, AMOUNT_TO_CLAIM);

        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPrivKey, digest);

        // IMPORTANT: Must claim with the amount that was signed and included in the Merkle leaf
        airdrop.claim(user, AMOUNT_TO_CLAIM, PROOF, v, r, s);

        uint256 endingBalance = token.balanceOf(user);
        console.log("Ending balance:", endingBalance);

        assertEq(
            endingBalance - startingBalance, AMOUNT_TO_CLAIM, "User should have received exactly the claimed amount"
        );
    }
}
