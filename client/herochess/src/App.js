import "./App.css";
import { useEffect, useState, useRef } from "react";

function App() {
  const [setup, setSetup] = useState(false);
  const [player, setPlayer] = useState(null);
  const [AChars, setAChars] = useState([]);
  const [BChars, setBChars] = useState([]);
  const [nextLoc, setNextLoc] = useState(null);
  const [prevLoc, setPrevLoc] = useState(null);
  const [turn, setTurn] = useState("A");
  const [board, setBoard] = useState([
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
  ]);
  const [place, setPlace] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    wsRef.current = new WebSocket("ws://127.0.0.1/");
    const websocket = wsRef.current;

    websocket.onopen = () => {
      console.log("Connected");
    };

    websocket.onmessage = (e) => {
      console.log("Received:", e.data);
      if (e.data === "A" || e.data === "B") {
        alert(`${e.data} WINS!!!!`);
        setBoard([["", `${e.data} WINS!!!`]]);
      } else {
        const msg = JSON.parse(e.data);
        setTurn(msg.chance);
        setBoard(msg.board);
        setSetup(msg.setup);
        setAChars(msg.A_Chars);
        setBChars(msg.B_Chars);
      }
    };

    websocket.onclose = () => {
      console.log("WebSocket Disconnected");
    };

    return () => {
      websocket.close();
    };
  }, []);

  const handleBoxClick = (row, col, val) => {
    if (!setup) {
      setNextLoc(`${row},${col}`);
    } else {
      if (prevLoc) {
        setNextLoc(`${row},${col}`);
        const msg = {
          character: player,
          position2: `${row},${col}`,
          position1: prevLoc,
        };
        // Ensure the message is sent as a JSON string
        wsRef.current.send(JSON.stringify(msg));
        setPlayer(null);
        setNextLoc(null);
        setPrevLoc(null);
      } else {
        setPlayer(val);
        setPrevLoc(`${row},${col}`);
      }
    }
  };
  
  const handlePlace = () => {
    if (!setup && player && nextLoc) {
      const msg = {
        character: player,
        position1: nextLoc,
      };
      // Ensure the message is sent as a JSON string
      wsRef.current.send(JSON.stringify(msg));
    }
    setPlayer(null);
    setNextLoc(null);
    setPrevLoc(null);
  };
  

  useEffect(() => {
    setPlace(!!nextLoc && !!player);
  }, [nextLoc, player]);

  const handleSetupPlace = (val) => {
    setPlayer(val);
  };

  const instructions = {
    P: "Pawn moves 1 step (Left, Right, Front, Back) and CANNOT KILL OPPONENT PAWNS",
    H1: "Hero 1 moves 1 step (Left, Right, Front, Back) and CAN KILL OPPONENT PAWNS",
    H2: "Hero 2 moves 1 step diagonally and CAN KILL OPPONENT PAWNS",
  };

  return (
    <div className="App">
      <div className="Board">
        {player && setup && (
          <div>
            {player[2] === "P" ? instructions.P : player[3] === "1" ? instructions.H1 : instructions.H2}
          </div>
        )}
        {setup ? (
          turn === "A" ? <h2>It is A's turn</h2> : <h2>It is B's turn</h2>
        ) : (
          <h2>Setup the game</h2>
        )}

        {board.map((row, rowInd) => (
          <div className="newRow" key={rowInd}>
            {rowInd === 0 && !setup && <>A HERE ==&gt;</>}
            {rowInd === 4 && !setup && <> B HERE ==&gt;</>}
            {row.map((val, colInd) => (
              <div
                className="values"
                key={colInd}
                onClick={() => handleBoxClick(rowInd, colInd, val)}
              >
                {val}
              </div>
            ))}
          </div>
        ))}

        <div className="newRow">
          <div className="newCol">
            {AChars.map((val, index) => (
              <div
                className="values"
                key={index}
                onClick={() => handleSetupPlace(val)}
              >
                {val}
              </div>
            ))}
          </div>
          {place && !setup && (
            <button onClick={handlePlace}>Place</button>
          )}
          <div className="newCol">
            {BChars.map((val, index) => (
              <div
                className="values"
                key={index}
                onClick={() => handleSetupPlace(val)}
              >
                {val}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;