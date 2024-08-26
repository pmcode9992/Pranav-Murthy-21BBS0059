import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [msg, setMSG] = useState({});
  const [setup, setSetup] = useState(false);
  const [player, setPlayer] = useState(null);
  const [character, setCharacter] = useState(null);

  const [AChars, setAChars] = useState([]);
  const [BChars, setBChars] = useState([]);
  const [nextLoc, setnextLoc] = useState(null);
  const [prevLoc, setprevLoc] = useState(null);

  //True means A False means B
  const [turn, setTurn] = useState("A");
  const [board, setBoard] = useState([
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
  ]);
  const [place, setPlace] = useState(false);
  const [next, setNext] = useState("");
  const wsUri = "ws://127.0.0.1/";
  const websocket = new WebSocket(wsUri);
  useEffect(() => {
    websocket.onopen = (e) => {
      console.log("connected");
    };

    websocket.onmessage = (e) => {
      console.log("recieved" + e.data);
      const msg = JSON.parse(e.data);
      console.log(msg);
      setTurn(msg.chance);
      setBoard(msg.board);
      setSetup(msg.setup);
      setAChars(msg.A_Chars);
      setBChars(msg.B_Chars);
    };

    // const pingInterval = setInterval(() => {
    //   if (websocket.readyState === WebSocket.OPEN) {
    //     websocket.send("ping");
    //   }
    //   return () => {
    //     clearInterval(pingInterval);
    //     websocket.close();
    //   };
    // }, 5000);

    // websocket.onclose = (e) => {
    //   console.log("DISCONNECTED");
    //   // clearInterval(pingInterval);
    // };
  }, [wsUri]);

  const handleNextMove = () => {
    if (websocket.readyState === websocket.OPEN) {
      websocket.send(next);
    } else {
      console.error("reload page");
    }
  };
  const handleBoxClick = (row, col, val) => {
    if (!setup) {
      setnextLoc(`${row},${col}`);
    } else {
      if (prevLoc) {
        setnextLoc(`${row},${col}`);
        const msg = {
          character: player,
          position2: `${row},${col}`,
          position1: prevLoc,
        };
        websocket.send(JSON.stringify(msg));
        setPlayer(null);
        setnextLoc(null);
        setprevLoc(null);
      } else {
        setPlayer(val);
        setprevLoc(`${row},${col}`);
      }
    }
  };

  useEffect(() => {
    if (nextLoc && player) {
      setPlace(true);
    } else {
      setPlace(false);
    }
  }, [nextLoc, player]);

  const handlePlace = () => {
    if (!setup) {
      if (player && nextLoc) {
        const msg = {
          character: player,
          position1: nextLoc,
        };
        websocket.send(JSON.stringify(msg));
      }
    }
    setPlayer(null);
    setCharacter(null);
    setnextLoc(null);
    setprevLoc(null);
  };

  const handleSetupPlace = (val) => {
    setPlayer(val);
  };
  return (
    <div className="App">
      <div className="Board">
        {`Setup - ${setup} Player - ${player} PrevLoc - ${prevLoc} NextLoc - ${nextLoc} Place - ${place} turn - ${turn}`}
        {setup ? (
          turn === "A" ? (
            <h2>It is A's turn</h2>
          ) : (
            <h2>It is B's turn</h2>
          )
        ) : (
          <h2>Setup the game</h2>
        )}

        {board.map((row, rowInd) => (
          <div className="newRow" key={rowInd}>
            {rowInd === 0 && !setup ? <>A HERE ==&gt;</> : <></>}
            {rowInd === 4 && !setup ? <> B HERE ==&gt;</> : <></>}
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

        <>
          <div className="newRow">
            <div className="newCol">
              {AChars.map((val, index) => (
                <div
                  className="values"
                  key={index}
                  onClick={() => {
                    handleSetupPlace(val);
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
            {place  && !setup? (
              <button onClick={() => handlePlace()}>Place</button>
            ) : (
              <></>
            )}
            <div className="newCol">
              {BChars.map((val, index) => (
                <div
                  className="values"
                  key={index}
                  onClick={() => {
                    handleSetupPlace(val);
                  }}
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        </>
      </div>
    </div>
  );
}

export default App;
