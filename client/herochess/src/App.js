import "./App.css";
import { useEffect, useState } from "react";

function App() {
  const [setup, setSetup] = useState(false);
  const [player, setPlayer] = useState('')
  const [character, setCharacter] = useState('')
  //True means A False means B
  const [turn, setTurn] = useState(true);
  const [board, setBoard] = useState([
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
    ["NA", "NA", "NA", "NA", "NA"],
  ]);
  const [next, setNext] = useState("");
  const wsUri = "ws://127.0.0.1/";
  const websocket = new WebSocket(wsUri);
  useEffect(() => {
    websocket.onopen = (e) => {
      console.log("connected");
    };

    websocket.onmessage = (e) => {
      console.log("recieved" + e.data);
      const [stp, vals, trn] = e.data.split("**");

      if (trn === "false") {
        setTurn(false);
      } else {
        setTurn(true);
      }

      if (stp === "false") {
        setSetup(false);
      } else {
        setSetup(true);
      }

      const matrix = [];
      const arr = vals.split(",");
      for (let i = 0; i < 5; i++) {
        matrix.push(arr.slice(i * 5, i * 5 + 5));
      }
      setBoard(matrix);
    };

    const pingInterval = setInterval(() => {
      if (websocket.readyState === WebSocket.OPEN) {
        websocket.send("ping");
      }
      return () => {
        clearInterval(pingInterval);
        websocket.close();
      };
    }, 5000);

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
  const handleBoxClick = (row, col) =>{
    alert(row + " " + col)
  }

  return (
    <div className="App">
      <div className="Board">
        {String(setup)}
        {setup ? (
          turn ? (
            <h2>It is A's turn</h2>
          ) : (
            <h2>It is B's turn</h2>
          )
        ) : (
          <h2>Setup the game</h2>
        )}

        {board.map((row, rowInd) => (
          <div className="newRow" key={row}>
            {row.map((val, colInd) => (
              <div className="values" key={colInd} onClick={()=>handleBoxClick(rowInd, colInd)}>
                {val}
              </div>
            ))}
          </div>
        ))}

        {!setup ? <div className="setup">
          <div className="flexrow">
          
          <input type="radio" value="A" id="player" name="player" onChange={(e)=>{setPlayer(e.target.value)}}/>
          <label>A</label> <br />
          <input type="radio" value="B" id="player" name="player" onChange={(e)=>{setPlayer(e.target.value)}}/>
          <label>B</label> <br />
          <br />
          </div>
          <div className="flexrow">
          <input type="radio" value="P" id="character" name="character" onChange={(e)=>{setCharacter(e.target.value)}}/>
          <label>P</label> <br />
          <input type="radio" value="H1" id="character" name="character" onChange={(e)=>{setCharacter(e.target.value)}}/>
          <label>H1</label> <br />
          <input type="radio" value="H2" id="character" name="character" onChange={(e)=>{setCharacter(e.target.value)}}/>
          <label>H2</label> <br />
          <br />
          </div>
          <h5>{player}  {character}</h5>
        </div> : <h5>Setup has been completed</h5>}

        <textarea onChange={(e) => setNext(e.target.value)} />
        <button onClick={handleNextMove}> Submit</button>
      </div>
    </div>
  );
}

export default App;
