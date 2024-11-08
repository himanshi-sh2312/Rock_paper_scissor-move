import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";
import { Aptos, AptosConfig } from "@aptos-labs/ts-sdk";
import {  Network } from "aptos";
import { useState } from "react";

const moduleAddress =
  "0x610ea90387f24c61fa507060dfb272a901ef420411473ab344cc45d72904e3bb";
const moduleName = "RockPaperScissors_01";
const client = new Aptos(new AptosConfig({ network: Network.TESTNET }));

const GameWrapper1 = () => {
  return (
    <div className="">
      <div>Connect Icon</div>
      <div className="h-screen flex justify-center align-middle">
        <h1 className="text-4xl font-semibold my-auto">
          Please connect your wallet to continue
        </h1>
      </div>
    </div>
  );
};

const GameWrapper2 = ({
  gameState,
  onToggleGame,
  onMoveSelection,
  result,
  computerSelection,
  transactionInProgress,
}: {
  gameState: boolean;
  onToggleGame: () => void;
  onMoveSelection: (move: string) => void;
  result: string;
  computerSelection: string;
  transactionInProgress: boolean;
}) => {
  return (
    <div>
      {/* <div>
        Connect Wallet
      </div> */}
      <div className="h-screen flex justify-center align-middle">
        <div className="my-auto w-4/5">
          <div className="flex justify-center">
            <button
              className="bg-green-500 mx-auto px-6 py-2 rounded-xl text-white my-2"
              onClick={onToggleGame}
            >
              {!gameState ? "Start Game" : "Stop Game"}
            </button>
          </div>
          <div className=" p-5">
            <div className="flex gap-2">
              {/* Card Component */}
              <div className="bg-white w-1/2 rounded-2xl p-5">
                <div>
                  <div className="bg-gray-300 mx-auto px-6 py-4 rounded-xl text-black font-semibold text-xl text-center my-2">
                    Select Your Move
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="bg-red-300 mx-auto px-8 py-4 text-xl rounded-xl my-2"
                    onClick={() => onMoveSelection("Clear")}
                  >
                    Clear
                  </button>
                  {["Rock", "Paper", "Scissors"].map((move) => (
                    <button
                      key={move}
                      className="bg-red-300 mx-auto px-8 py-4 text-xl rounded-xl my-2"
                      onClick={() => onMoveSelection(move)}
                      disabled={transactionInProgress || !gameState}
                    >
                      {move}
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-white w-1/2 rounded-2xl p-5">
                <div>
                  <div className="bg-gray-300 mx-auto px-6 py-4 rounded-xl text-black font-semibold text-xl text-center my-2">
                    Computer Move
                  </div>
                </div>
                <div className="flex gap-2">
                  {["Rock", "Paper", "Scissors"].map((move) => (
                    <button
                      key={move}
                      className="bg-red-300 mx-auto px-8 py-4 text-xl rounded-xl my-2"
                      onClick={() => onMoveSelection(move)}
                      disabled={transactionInProgress || !gameState}
                    >
                      {move === computerSelection ? move : ""}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="">
            <div className="bg-green-500 w-3/5 mx-auto px-6 py-4 rounded-xl text-black font-semibold text-4xl text-center my-2">
              {result || "Game Result"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  const { account, connected, signAndSubmitTransaction } = useWallet();
  const [gameState, setGameState] = useState(false);
  const [result, setResult] = useState("");
  const [computerSelection, setComputerSelection] = useState("");
  const [transactionInProgress, setTransactionInProgress] = useState(false);

  const toggleGameState = async () => {
    if (!account) return;
    setGameState(!gameState);

    const payload: InputTransactionData = {
      data: {
        function: `${moduleAddress}::${moduleName}::createGame`,
        functionArguments: [],
      },
    };
    await handleTransaction(payload);
    setResult("");
    setComputerSelection("");
  };
  const handleMoveSelection = async (move: string) => {
    if (move === "Clear") {
      setComputerSelection("");
      setResult("");
      return;
    }
    const payload: InputTransactionData = {
      data: {
        function: `${moduleAddress}::${moduleName}::duel`,
        functionArguments: [move],
      },
    };
    await handleTransaction(payload);
  };

  const handleTransaction = async (
    payload: InputTransactionData,
   
  ) => {
    if (!account) return;
    setTransactionInProgress(true);
    try {
      const res = await signAndSubmitTransaction(payload);
      console.log(res);
      const resultData = await client.getAccountResource({
        accountAddress: account?.address,
        resourceType: `${moduleAddress}::${moduleName}::DuelResult`,
      });
      const gameResult = resultData.duel_result.toString();
      if (gameResult === "Win") {
        setResult("You won!");
      } else if (gameResult === "Lose") {
        setResult("You lost!");
      } else {
        setResult(gameResult);
      }
      setComputerSelection(resultData.computer_selection.toString());
    } catch (error) {
      console.error("Transaction failed:", error);
    } finally {
      setTransactionInProgress(false);
    }
  };

  return (
    <>
      <div className="w-screen h-screen flex flex-col justify-center align-middle bg-neutral-100">
        <div className="absolute right-4 top-4 items-end">
          <WalletSelector />
        </div>
        {connected ? (
          <GameWrapper2
            gameState={gameState}
            onToggleGame={toggleGameState}
            onMoveSelection={handleMoveSelection}
            result={result}
            computerSelection={computerSelection}
            transactionInProgress={transactionInProgress}
          />
        ) : (
          <GameWrapper1 />
        )}
      </div>
    </>
  );
}

export default App;
