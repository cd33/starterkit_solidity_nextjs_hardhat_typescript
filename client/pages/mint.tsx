import type { NextPage } from "next";
import Head from "next/head";
import { useCallback, useEffect, useState } from "react";
import useEthersProvider from "../context/useEthersProvider";
import { ethers } from "ethers";
import Contract721 from "../../artifacts/contracts/BibsERC721A.sol/BibsERC721A.json";
import { toast } from "react-toastify";
import Counter from "../components/Counter";
import { Blocks } from "react-loader-spinner";
import Hide from "../components/Hide";

const { MerkleTree } = require("merkletreejs");
const tokens = require("../context/whitelist.json");

const Home: NextPage = () => {
  const { account, provider, owner, recipient, contract721Address } =
    useEthersProvider();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [sellingStep, setSellingStep] = useState<number | null>(null);
  const [whitelistSalePrice, setWhitelistSalePrice] = useState<number>(0);
  const [publicSalePrice, setPublicSalePrice] = useState<number>(0);
  const [maxSup, setMaxSup] = useState<number | null>(null);
  const [currentTotalSupply, setCurrentTotalSupply] = useState<number | null>(
    null
  );

  const [counterNFT, setCounterNFT] = useState<number>(1);
  const [counterStep, setCounterStep] = useState<number>(0);
  const [basketETH, setBasketETH] = useState<number>(0);
  const [giftAddress, setGiftAddress] = useState<string>("");
  const [giftCounter, setGiftCounter] = useState<number>(1);
  const [newMerkleRoot, setNewMerkleRoot] = useState<string>("");
  const [newBaseUri, setNewBaseUri] = useState<string>("");
  const [releaseToken, setReleaseToken] = useState<string>("");

  const getDatas = useCallback(async () => {
    setIsLoading(true);
    if (provider && account && contract721Address != "") {
      try {
        const contract = new ethers.Contract(
          contract721Address,
          Contract721.abi,
          provider
        );
        const step = await contract.sellingStep();
        setSellingStep(step);
        const whitelistSalePrice = await contract.whitelistSalePrice();
        setWhitelistSalePrice(parseInt(whitelistSalePrice));
        const publicSalePrice = await contract.publicSalePrice();
        setPublicSalePrice(parseInt(publicSalePrice));
        const maxSup = await contract.MAX_SUPPLY();
        setMaxSup(maxSup);
        const totalSupply = await contract.totalSupply();
        setCurrentTotalSupply(totalSupply);
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log(error);
      }
    }
  }, [account, provider, contract721Address]);

  useEffect(() => {
    if (account) {
      getDatas();
    }
  }, [account, getDatas]);

  useEffect(() => {
    if (sellingStep === 1) {
      setBasketETH(counterNFT * whitelistSalePrice);
    }
    if (sellingStep === 2) {
      setBasketETH(counterNFT * publicSalePrice);
    }
    if (sellingStep === 0) {
      setBasketETH(0);
    }
  }, [sellingStep, counterNFT, whitelistSalePrice, publicSalePrice]);

  const handleMint = (_amount: number) => {
    if (account && provider) {
      if (sellingStep === 1) {
        whitelistSaleMint(_amount);
      } else if (sellingStep === 2) {
        publicSaleMint(_amount);
      } else {
        toast.error("The mint has not started", {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: false,
          draggable: false,
          theme: "dark",
        });
        return;
      }
    } else {
      toast.error("Connect Your Wallet", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: false,
        draggable: false,
        theme: "dark",
      });
    }
  };

  // EVENTS
  useEffect(() => {
    if (provider && contract721Address != "") {
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        provider
      );
      contract.on("Transfer", async () => {
        setCurrentTotalSupply(await contract.totalSupply());
      });
    }
  }, [provider, contract721Address]);

  async function setStep(_step: number) {
    if (provider) {
      setIsLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        const transaction = await contract.setStep(_step, { from: account });
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error("Error setStep, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        } else {
          console.log(String(error));
          toast.error("Error setStep, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        }
        setIsLoading(false);
      }
    }
  }

  async function setBaseUri(_baseUri: string) {
    if (provider) {
      setIsLoading(true);

      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: account,
        };
        const transaction = await contract.setBaseUri(_baseUri, overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error("Error setBaseUri, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        } else {
          console.log(String(error));
          toast.error("Error setBaseUri, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        }
        setIsLoading(false);
      }
    }
  }

  async function whitelistSaleMint(_amount: number) {
    if (account && provider && basketETH) {
      setIsLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      let tab: any[] = [];
      tokens.map((token: any) => tab.push(token.address));
      const leaves = tab.map((address) => ethers.utils.keccak256(address));
      const tree = new MerkleTree(leaves, ethers.utils.keccak256, {
        sortPairs: true, // Attention sortPairs et non sort (crossmint)
      });
      const leaf = ethers.utils.keccak256(account);
      const proof = tree.getHexProof(leaf);

      try {
        let overrides = {
          from: account,
          value: basketETH,
        };
        const transaction = await contract.whitelistSaleMint(
          _amount,
          proof,
          overrides
        );
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error(
            "Error whitelistSaleMint, more informations on the console",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "dark",
            }
          );
        } else {
          console.log(String(error));
          toast.error(
            "Error whitelistSaleMint, more informations on the console",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "dark",
            }
          );
        }
        setIsLoading(false);
      }
    }
  }

  async function publicSaleMint(_amount: number) {
    if (provider && basketETH) {
      setIsLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: account,
          value: basketETH,
        };
        const transaction = await contract.publicSaleMint(_amount, overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error(
            "Error publicSaleMint, more informations on the console",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "dark",
            }
          );
        } else {
          console.log(String(error));
          toast.error(
            "Error publicSaleMint, more informations on the console",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "dark",
            }
          );
        }
        setIsLoading(false);
      }
    }
  }

  async function gift(_to: string, _amount: number) {
    if (provider) {
      setIsLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: account,
        };
        const transaction = await contract.gift(_to, _amount, overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error("Error gift, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        } else {
          console.log(String(error));
          toast.error("Error gift, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        }
        setIsLoading(false);
      }
    }
  }

  async function setMerkleRoot(_merkleRoot: string) {
    if (provider) {
      setIsLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: account,
        };
        const transaction = await contract.setMerkleRoot(
          _merkleRoot,
          overrides
        );
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error("Error setMerkleRoot, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        } else {
          console.log(String(error));
          toast.error("Error setMerkleRoot, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        }
        setIsLoading(false);
      }
    }
  }

  async function releaseAll() {
    if (provider) {
      setIsLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: account,
        };
        const transaction = await contract.releaseAll(overrides);
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error("Error releaseAll, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        } else {
          console.log(String(error));
          toast.error("Error releaseAll, more informations on the console", {
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: false,
            theme: "dark",
          });
        }
        setIsLoading(false);
      }
    }
  }

  async function releaseSpecificToken(_token: string) {
    if (provider) {
      setIsLoading(true);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(
        contract721Address,
        Contract721.abi,
        signer
      );

      try {
        let overrides = {
          from: account,
          //   gasLimit: 20000000,
        };
        const transaction = await contract.releaseSpecificToken(
          _token,
          overrides
        );
        await transaction.wait();
        setIsLoading(false);
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(error.message);
          toast.error(
            "Error releaseSpecificToken, more informations on the console",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "dark",
            }
          );
        } else {
          console.log(String(error));
          toast.error(
            "Error releaseSpecificToken, more informations on the console",
            {
              position: "top-center",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: false,
              draggable: false,
              theme: "dark",
            }
          );
        }
        setIsLoading(false);
      }
    }
  }

  return (
    <div className="home">
      <Head>
        <title>Mint Carlito</title>
        <meta name="CarlitoMint" content="Carlito Mint" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!account || !provider ? <Hide /> : ""}
      {isLoading ? (
        <Blocks
          visible={true}
          height="30"
          width="30"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperClass="blocks-wrapper"
        />
      ) : (
        <>
          {sellingStep === 1 || sellingStep === 2 ? (
            <>
              <p>How many NFTs do you want ?</p>

              <Counter
                counter={counterNFT}
                setCounter={setCounterNFT}
                start={1}
                limit={sellingStep === 1 ? 3 : 255}
              />

              <div
                style={{
                  display: "flex",
                  flexDirection: "row",
                  marginBottom: "5vh",
                  marginTop: "5vh",
                }}
              >
                <p style={{ alignSelf: "center", marginRight: "2vw" }}>
                  Price : {ethers.utils.formatEther(basketETH.toString())} ETH
                </p>
                <button
                  onClick={() => handleMint(counterNFT)}
                  disabled={isLoading ? true : false}
                >
                  {isLoading ? "Loading..." : "MINT"}
                </button>
              </div>
              {currentTotalSupply && (
                <p style={{ marginBottom: "5vh" }}>
                  NFTs minted : {currentTotalSupply.toString()}/{maxSup}
                </p>
              )}
            </>
          ) : (
            <p>La vente n&apos;a pas encore débuté</p>
          )}
        </>
      )}

      {account && owner === account && (
        <>
          <p style={{ marginTop: "10vh" }}>ADMIN</p>
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginTop: "5vh",
              marginBottom: "10vh",
            }}
          >
            <p
              color="green"
              style={{ alignSelf: "center", marginRight: "2vw" }}
            >
              Actuel : {sellingStep}
            </p>

            <Counter
              counter={counterStep}
              setCounter={setCounterStep}
              start={0}
              limit={2}
            />

            <button
              style={{ marginLeft: "2vw" }}
              onClick={() => setStep(counterStep)}
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Loading..." : "SETSTEP"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: "10vh",
              zIndex: 1,
            }}
          >
            <input
              placeholder="Address"
              onChange={(e) => setGiftAddress(e.target.value)}
              style={{ marginRight: "2vw" }}
            />

            <Counter
              counter={giftCounter}
              setCounter={setGiftCounter}
              start={1}
              limit={5000}
            />

            <button
              style={{ marginLeft: "2vw" }}
              onClick={() => gift(giftAddress, giftCounter)}
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Loading..." : "GIFT"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              zIndex: 1,
              marginBottom: "10vh",
            }}
          >
            <input
              placeholder="Merkle Root"
              onChange={(e) => setNewMerkleRoot(e.target.value)}
            />

            <button
              style={{ marginLeft: "2vw" }}
              onClick={() => setMerkleRoot(newMerkleRoot)}
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Loading..." : "SETMERKLEROOT"}
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: "10vh",
            }}
          >
            <input
              placeholder="Base URI"
              onChange={(e) => setNewBaseUri(e.target.value)}
            />

            <button
              style={{ marginLeft: "2vw" }}
              onClick={() => setBaseUri(newBaseUri)}
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Loading..." : "SET BASE URI"}
            </button>
          </div>

          <button
            style={{
              // marginLeft: '2vw',
              // padding: 10,
              marginBottom: "10vh",
            }}
            onClick={() => releaseAll()}
            disabled={isLoading ? true : false}
          >
            {isLoading ? "Loading..." : "RELEASE ALL MONEY"}
          </button>

          <div
            style={{
              display: "flex",
              flexDirection: "row",
              marginBottom: "10vh",
            }}
          >
            <input
              placeholder="Token Contract Address"
              onChange={(e) => setReleaseToken(e.target.value)}
            />

            <button
              style={{ marginLeft: "2vw", padding: 10 }}
              onClick={() => releaseSpecificToken(releaseToken)}
              disabled={isLoading ? true : false}
            >
              {isLoading ? "Loading..." : "RELEASE SPECIFIC TOKEN"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
