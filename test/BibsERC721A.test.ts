import { expect } from "chai";
import { ethers } from "hardhat";
import { BibsERC20, BibsERC721A } from "../typechain-types/contracts";

describe("BibsERC721A", function () {
  let coin: BibsERC20;
  let token: BibsERC721A;

  const _team = [
    "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc",
  ];

  const _teamShares = [70, 20, 10];
  const merkleRoot =
    "0x1dfde04fd51b018c2d83a9273cba666580c79a9b5543fcbc8c3d9a469bae2b55";
  const proofOwner = [
    "0x96e8b17b5e17b5861adf5f6806a65cc54fa2ecdbf519b4898dfcf7851c2fa568",
    "0xefa651290ed1dfbd4e27bb6766a98aeb40198f07684f4682159135999fc36725",
  ];
  const proofListedInvestor = [
    "0x7ddf0c5320713853bb4e9d8b1ccfa0acbabe07bf95e4c8fe3154160e80fdace7",
    "0x69544beb25890c934579c67525db2c2f61ff18dc332f9d5412e8ec3282cbcc3b",
  ];
  const baseURI = "ipfs://QmXezwmuWWwuQDUFzWuMyfv63KWdbzsk517BCgWWhe9AXX/";
  const MAX_SUPPLY = 5000;
  const whitelistSalePrice = ethers.utils.parseEther("0.0015");
  const publicSalePrice = ethers.utils.parseEther("0.002");
  const whitelistLimitBalance = 3;

  beforeEach(async function () {
    [this.owner, this.investor, this.listedInvestor] =
      await ethers.getSigners(); // 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8 et 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc
    const BibsERC20 = await ethers.getContractFactory("BibsERC20");
    coin = await BibsERC20.deploy();
    const BibsERC721A = await ethers.getContractFactory("BibsERC721A");
    token = await BibsERC721A.deploy(_team, _teamShares, merkleRoot, baseURI);
    await token.deployed();
  });

  describe("Step and URI", function () {
    it("SetStep setStep() Changements de steps sellingStep()", async function () {
      let step = await token.sellingStep();
      expect(step).to.equal(0);
      await token.setStep(1);
      step = await token.sellingStep();
      expect(step).to.equal(1);
      await token.setStep(2);
      step = await token.sellingStep();
      expect(step).to.equal(2);
      await token.setStep(0);
      step = await token.sellingStep();
      expect(step).to.equal(0);
    });

    it("REVERT: setStep() Not Owner", async function () {
      await expect(token.connect(this.investor).setStep(1)).to.be.revertedWith(
        "Ownable: caller is not the owner"
      );
    });

    it("setBaseUri setBaseUri() Changements d'uri", async function () {
      let uri = await token.baseURI();
      expect(uri).to.equal(baseURI);
      await token.setBaseUri("toto");
      uri = await token.baseURI();
      expect(uri).to.equal("toto");
    });

    it("REVERT: setBaseUri() Not Owner", async function () {
      await expect(
        token.connect(this.investor).setBaseUri("toto")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("REVERT: tokenURI() NFT doesn't exist", async function () {
      await expect(token.connect(this.investor).tokenURI(0)).to.be.revertedWith(
        "NFT doesn't exist"
      );
      await expect(token.connect(this.investor).tokenURI(1)).to.be.revertedWith(
        "NFT doesn't exist"
      );
      await token.setStep(2);
      await token.connect(this.investor).publicSaleMint(2, {
        value: publicSalePrice.mul(2).toString(),
      });
      expect(await token.connect(this.investor).tokenURI(0)).to.equal(
        "ipfs://QmXezwmuWWwuQDUFzWuMyfv63KWdbzsk517BCgWWhe9AXX/0.json"
      );
      expect(await token.connect(this.investor).tokenURI(1)).to.equal(
        "ipfs://QmXezwmuWWwuQDUFzWuMyfv63KWdbzsk517BCgWWhe9AXX/1.json"
      );

      await token.setBaseUri("")
      expect(await token.connect(this.investor).tokenURI(0)).to.equal("");
    });
  });

  describe("WHITELIST", function () {
    it("WhitelistMint whitelistSaleMint() tests argents", async function () {
      await token.setStep(1);
      let balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(0);
      const balanceOwnerETHBefore = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceInvestorETHBefore = await ethers.provider.getBalance(
        this.investor.address
      );

      const mint = await token.whitelistSaleMint(1, proofOwner, {
        value: whitelistSalePrice,
      });
      await mint.wait(); // wait until the transaction is mined

      balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(1);
      const balanceOwnerETHAfter = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceInvestorETHAfter = await ethers.provider.getBalance(
        this.investor.address
      );
      expect(balanceOwnerETHBefore).to.be.gt(balanceOwnerETHAfter);
      expect(balanceInvestorETHBefore).to.be.lt(balanceInvestorETHAfter);
    });

    it("REVERT: whitelistSaleMint() Not active", async function () {
      await expect(
        token.whitelistSaleMint(1, proofOwner, { value: whitelistSalePrice })
      ).to.be.revertedWith("Whitelist sale not active");
    });

    it("REVERT: whitelistSaleMint() Quantity must be greater than 0", async function () {
      await token.setStep(1);
      await expect(token.whitelistSaleMint(0, proofOwner)).to.be.reverted; // MintZeroQuantity()
    });

    it("REVERT: whitelistSaleMint() merkle access Not whitelisted", async function () {
      await token.setStep(1);
      await expect(
        token
          .connect(this.investor)
          .whitelistSaleMint(1, proofOwner, { value: whitelistSalePrice })
      ).to.be.revertedWith("Not whitelisted");
    });

    it("REVERT: whitelistSaleMint() Limited number per wallet", async function () {
      await token.setStep(1);
      await token.whitelistSaleMint(3, proofOwner, {
        value: whitelistSalePrice.mul(3).toString(),
      });

      await expect(
        token.whitelistSaleMint(1, proofOwner, { value: whitelistSalePrice })
      ).to.be.revertedWith("Limited number per wallet");
    });

    it("REVERT: whitelistSaleMint() Not enough money", async function () {
      await token.setStep(1);
      await expect(
        token.whitelistSaleMint(1, proofOwner, {
          value: ethers.utils.parseEther("0.0000005"),
        })
      ).to.be.revertedWith("Not enough funds");
    });

    it("REVERT: setMerkleRoot() Not Owner", async function () {
      await expect(
        token
          .connect(this.investor)
          .setMerkleRoot(
            "0x83cf4855b2c3c8c4e206fcba016cc84f201cd5b8b480fb6878405db4065e94ea"
          )
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("PUBLIC SALE", function () {
    it("PublicSaleMint publicSaleMint() tests argents", async function () {
      await token.setStep(2);
      let balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(0);
      const balanceOwnerETHBefore = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceInvestorETHBefore = await ethers.provider.getBalance(
        this.investor.address
      );

      const mint = await token.publicSaleMint(3, {
        value: publicSalePrice.mul(3).toString(),
      });
      await mint.wait();

      balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(3);
      const balanceOwnerETHAfter = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceInvestorETHAfter = await ethers.provider.getBalance(
        this.investor.address
      );
      expect(balanceOwnerETHBefore).to.be.gt(balanceOwnerETHAfter);
      expect(balanceInvestorETHBefore).to.be.lt(balanceInvestorETHAfter);
    });

    it("REVERT: publicSaleMint() Not active", async function () {
      await expect(
        token.publicSaleMint(3, { value: publicSalePrice.mul(3).toString() })
      ).to.be.revertedWith("Public sale not active");
    });

    it("REVERT: publicSaleMint() Quantity must be greater than 0", async function () {
      await token.setStep(2);
      await expect(token.publicSaleMint(0)).to.be.reverted; // MintZeroQuantity()
    });

    it("REVERT: publicSaleMint() & gift() Sold out et tests de balances", async function () {
      await token.setStep(2);
      let currentIdNFT = await token.totalSupply();
      expect(currentIdNFT).to.equal(0);
      let balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(0);

      for (let i = 0; i < 50; i++) {
        await token.publicSaleMint(100, {
          value: publicSalePrice.mul(100).toString(),
        });
      }
      currentIdNFT = await token.totalSupply();
      expect(currentIdNFT).to.equal(5000);
      balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(5000);

      await expect(
        token
          .connect(this.listedInvestor)
          .publicSaleMint(1, { value: publicSalePrice.toString() })
      ).to.be.revertedWith("Sold out");

      await expect(token.gift(this.investor.address, 3)).to.be.revertedWith(
        "Sold out"
      );
    });

    it("REVERT: publicSaleMint() Not enough money", async function () {
      await token.setStep(2);
      await expect(
        token.publicSaleMint(3, {
          value: ethers.utils.parseEther("0.00000005"),
        })
      ).to.be.revertedWith("Not enough funds");
    });
  });

  // GIFT
  describe("GIFT", function () {
    it("Gift gift() tests argents", async function () {
      let balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(0);

      const mint = await token.gift(this.owner.address, 3);
      await mint.wait();

      balanceOwnerNFT = await token.balanceOf(this.owner.address);
      expect(balanceOwnerNFT).to.equal(3);
    });

    it("REVERT: gift() Not Owner", async function () {
      await expect(
        token.connect(this.investor).gift(this.investor.address, 10)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("Royalty & PaymentSplitter", function () {
    it("RoyaltyInfo() and setDefaultRoyalty()", async function () {
      let royalties = await token.royaltyInfo(0, ethers.utils.parseEther("1"));
      expect(royalties[0]).to.equal(token.address);
      expect(ethers.utils.formatEther(royalties[1])).to.equal("0.07");

      await token.setDefaultRoyalty(this.owner.address, 500);

      royalties = await token.royaltyInfo(0, ethers.utils.parseEther("1"));
      expect(royalties[0]).to.equal(this.owner.address);
      expect(ethers.utils.formatEther(royalties[1])).to.equal("0.05");
    });

    it("supportsInterface() ERC165 interface ID", async function () {
      expect(await token.supportsInterface("0xffffffff")).to.equal(false);
      expect(await token.supportsInterface("0x80ac58cd")).to.equal(true); // ERC721
      expect(await token.supportsInterface("0x01ffc9a7")).to.equal(true); // ERC165
      expect(await token.supportsInterface("0x5b5e139f")).to.equal(true); // ERC721Metadata
    });

    it("ReleaseAll PaymentSplitter", async function () {
      expect(await token.totalShares()).to.equal("100");
      expect(await token.shares(this.owner.address)).to.equal("70");
      expect(await token.shares(this.investor.address)).to.equal("20");
      expect(await token.shares(this.listedInvestor.address)).to.equal("10");
      expect(await token.payee(0)).to.equal(this.owner.address);
      expect(await token.payee(1)).to.equal(this.investor.address);
      expect(await token.payee(2)).to.equal(this.listedInvestor.address);

      await this.owner.sendTransaction({
        to: token.address,
        value: ethers.utils.parseEther("1"),
      });

      const balanceOwnerETHBefore = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceInvestorETHBefore = await ethers.provider.getBalance(
        this.investor.address
      );
      const balanceListedInvestorETHBefore = await ethers.provider.getBalance(
        this.listedInvestor.address
      );
      const balanceContractETHBefore = await ethers.provider.getBalance(
        token.address
      );

      await token.releaseAll();

      const balanceOwnerETHAfter = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceInvestorETHAfter = await ethers.provider.getBalance(
        this.investor.address
      );
      const balanceListedInvestorETHAfter = await ethers.provider.getBalance(
        this.listedInvestor.address
      );
      const balanceContractETHAfter = await ethers.provider.getBalance(
        token.address
      );
      expect(balanceOwnerETHBefore).to.be.lt(balanceOwnerETHAfter);
      expect(balanceInvestorETHBefore).to.be.lt(balanceInvestorETHAfter);
      expect(balanceListedInvestorETHBefore).to.be.lt(
        balanceListedInvestorETHAfter
      );
      expect(balanceContractETHBefore).to.be.gt(balanceContractETHAfter);
      expect(balanceContractETHAfter).to.equal(0);
    });

    it("ReleaseSpecificToken PaymentSplitter", async function () {
      expect(await token.totalShares()).to.equal("100");
      expect(await token.shares(this.owner.address)).to.equal("70");
      expect(await token.shares(this.investor.address)).to.equal("20");
      expect(await token.shares(this.listedInvestor.address)).to.equal("10");
      expect(await token.payee(0)).to.equal(this.owner.address);
      expect(await token.payee(1)).to.equal(this.investor.address);
      expect(await token.payee(2)).to.equal(this.listedInvestor.address);

      await coin.mint(token.address, ethers.utils.parseEther("10"));

      const balanceOwnerCoinBefore = await coin.balanceOf(this.owner.address);
      const balanceInvestorCoinBefore = await coin.balanceOf(
        this.investor.address
      );
      const balanceListedInvestorCoinBefore = await coin.balanceOf(
        this.listedInvestor.address
      );
      const balanceContractCoinBefore = await coin.balanceOf(token.address);

      await token.releaseSpecificToken(coin.address);

      const balanceOwnerCoinAfter = await coin.balanceOf(this.owner.address);
      const balanceInvestorCoinAfter = await coin.balanceOf(
        this.investor.address
      );
      const balanceListedInvestorCoinAfter = await coin.balanceOf(
        this.listedInvestor.address
      );
      const balanceContractCoinAfter = await coin.balanceOf(token.address);
      expect(balanceOwnerCoinBefore).to.be.lt(balanceOwnerCoinAfter);
      expect(balanceInvestorCoinBefore).to.be.lt(balanceInvestorCoinAfter);
      expect(balanceListedInvestorCoinBefore).to.be.lt(
        balanceListedInvestorCoinAfter
      );
      expect(balanceContractCoinBefore).to.be.gt(balanceContractCoinAfter);
      expect(balanceContractCoinAfter).to.equal(0);
    });
  });

  describe("Déroulement Complet", function () {
    it("Test collection", async function () {
      await token.setMerkleRoot(
        "0x1dfde04fd51b018c2d83a9273cba666580c79a9b5543fcbc8c3d9a469bae2b55"
      );
      await token.setBaseUri(
        "ipfs://QmYkpa28u51JFnCjrnoaMf1LfyNiB9n5oSp6ERRQCX5eKE/"
      );

      const balanceOwnerETHBefore = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceInvestorETHBefore = await ethers.provider.getBalance(
        this.investor.address
      );

      await token.setStep(1);
      let mint = await token.whitelistSaleMint(1, proofOwner, {
        value: whitelistSalePrice,
      });
      await mint.wait();
      mint = await token
        .connect(this.listedInvestor)
        .whitelistSaleMint(2, proofListedInvestor, {
          value: whitelistSalePrice.mul(2).toString(),
        });
      await mint.wait();

      await token.setStep(2);
      mint = await token.connect(this.listedInvestor).publicSaleMint(1, {
        value: publicSalePrice.toString(),
      });
      await mint.wait();
      mint = await token.connect(this.investor).publicSaleMint(2, {
        value: publicSalePrice.mul(2).toString(),
      });
      await mint.wait();
      mint = await token.publicSaleMint(1, {
        value: publicSalePrice.toString(),
      });
      await mint.wait();

      await token.setBaseUri(
        "ipfs://QmXezwmuWWwuQDUFzWuMyfv63KWdbzsk517BCgWWhe9AXX/"
      );

      const balanceOwnerETHAfter = await ethers.provider.getBalance(
        this.owner.address
      );
      const balanceInvestorETHAfter = await ethers.provider.getBalance(
        this.investor.address
      );
      expect(balanceOwnerETHBefore).to.be.gt(balanceOwnerETHAfter);
      expect(balanceInvestorETHBefore).to.be.lt(balanceInvestorETHAfter);
    });
  });

  // // ***********************************************************************
  //   it("Receive test d'impossibilité, Only if you mint", async function () {
  //     balanceOwnerETHBefore = await ethers.provider.getBalance(this.owner.address)
  //     balanceContractETHBefore = await ethers.provider.getBalance(token.address)

  //     await expect(
  //       this.owner.sendTransaction({
  //         to: token.address,
  //         value: ethers.utils.parseEther('10'),
  //       }),
  //     ).to.be.revertedWith('Only if you mint'),

  //     balanceOwnerETHAfter = await ethers.provider.getBalance(this.owner.address)
  //     balanceContractETHAfter = await ethers.provider.getBalance(token.address)
  //     expect(balanceOwnerETHBefore).to.equal(balanceOwnerETHAfter)
  //     expect(balanceContractETHAfter).to.equal(balanceContractETHAfter).to.equal(0)
  //   })
});
