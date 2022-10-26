import { ethers, network } from "hardhat";
import { verify } from "../utils/verify";
const whitelist = require("./whitelist.json");
const { MerkleTree } = require("merkletreejs");

async function main() {
  // const BibsERC20 = await ethers.getContractFactory("BibsERC20")
  // const bibsERC20 = await BibsERC20.deploy()
  // await bibsERC20.deployed()
  // console.log("Deployed Smart Contract at address", bibsERC20.address)

  const team = [
    "XXX",
    "XXX",
    "XXX"
  ];
  const teamShare = ["50", "30", "20"];
  const baseUri = "ipfs://XXX/";

  let tab: any[] = [];
  whitelist.map((token: any) => {
    tab.push(token.address);
  });
  const leaves = tab.map((address) => ethers.utils.keccak256(address));
  const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
    sortPairs: true,
  }); // Attention sortPairs et non sort (crossmint)
  const root = tree.getHexRoot();

  const BibsERC721A = await ethers.getContractFactory("BibsERC721A");
  const bibsERC721A = await BibsERC721A.deploy(team, teamShare, root, baseUri);
  await bibsERC721A.deployed();
  console.log("Deployed Smart Contract at address", bibsERC721A.address);

  if (network.name === "goerli") {
    // console.log("Verifying the Smart Contract ERC20...")
    // await bibsERC20.deployTransaction.wait(6) // Attendre 6 block après le déploiment
    // await verify(bibsERC20.address, [])

    console.log("Verifying the Smart Contract ERC721A...");
    await bibsERC721A.deployTransaction.wait(6); // Attendre 6 block après le déploiment
    await verify(bibsERC721A.address, [team, teamShare, root, baseUri]);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
