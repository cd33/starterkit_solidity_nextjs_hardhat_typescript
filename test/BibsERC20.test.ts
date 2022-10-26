import { expect } from "chai";
import { ethers } from "hardhat";
import { BibsERC20 } from "../typechain-types/contracts/BibsERC20";

describe("BibsERC20", function () {
  let token: BibsERC20;

  before(async function () {
    [this.owner, this.investor, this.toto] = await ethers.getSigners();
    const BibsERC20 = await ethers.getContractFactory("BibsERC20");
    token = await BibsERC20.deploy();
  });

  describe("Deploy Verification", function () {
    it("Should get balance of owner", async function () {
      expect((await token.balanceOf(this.owner.address)).toString()).to.equal(
        ethers.utils.parseUnits((1e6).toString())
      );
    });
  });

  describe("Mint", function () {
    it("Should mint X tokens if owner of the smart contract", async function () {
      let tx = await token.mint(
        this.owner.address,
        ethers.utils.parseUnits((1e6).toString())
      );
      await tx.wait();
      expect((await token.balanceOf(this.owner.address)).toString()).to.equal(
        ethers.utils.parseUnits((2e6).toString())
      );
    });

    it("Should NOT mint X tokens if NOT owner of the smart contract", async function () {
      await expect(
        token
          .connect(this.investor)
          .mint(
            this.investor.address,
            ethers.utils.parseUnits((1e6).toString())
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
