const board = [
  ["NA", "NA", "NA", "NA", "NA"],
  ["NA", "NA", "NA", "NA", "NA"],
  ["NA", "NA", "NA", "NA", "NA"],
  ["NA", "NA", "NA", "NA", "NA"],
  ["NA", "NA", "NA", "NA", "NA"],
];

let A = ["A:P1", "A:P2", "A:P3", "A:H1", "A:H2"];
let B = ["B:P1", "B:P2", "B:P3", "B:H1", "B:H2"];
let chance = "A";
let msg = {
  setup: !(A.length && B.length),
  chance: chance,
  board: board,
  A_Chars: A,
  B_Chars: B,
};

const validateMove = (character, x1, x2, y1, y2, board) => {
  console.log(character, x1, x2, y1, y2, board);
  if (character[2] === "P") {
    if ((x2 == x1 + 1 || x2 == x1 - 1) && y1 == y2 && board[x2][y2] === "NA") {
      return true;
    }
    if ((y2 == y1 + 1 || y2 == y1 - 1) && x1 == x2 && board[x2][y2] === "NA") {
      return true;
    }
    console.log("rejected");
    return false;
  } else if (character[2] === "H" && character[3] === "1") {
    if ((x2 == x1 + 2 || x2 == x1 - 2) && y1 == y2) {
      return true;
    }
    if ((y2 == y1 + 2 || y2 == y1 - 2) && x1 == x2) {
      return true;
    }
    console.log("rejected");
    return false;
  } else {
    if (
      (x2 == x1 + 2 && y2 == y1 + 2) ||
      (x2 == x1 - 2 && y2 == y1 + 2) ||
      (x2 == x1 + 2 && y2 == y1 - 2) ||
      (x2 == x1 - 2 && y2 == y1 - 2)
    ) {
      return true;
    }
    console.log("rejected");
    return false;
  }
};

Deno.serve({
  port: 80,
  handler: async (request) => {
    if (request.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(request);
      socket.onopen = () => {
        console.log("CONNECTED");
        socket.send(JSON.stringify(msg));
      };
      socket.onmessage = (event) => {
        //Get move
        console.log(`RECEIVED: ${event.data}`);
        const req = JSON.parse(event.data);
        if (!msg.setup) {
          //Setup part
          const position = req.position1;
          const character = req.character;
          const [x, y] = position.split(",");

          //check constraints

          if (x <= 4 && x >= 0 && y <= 4 && y >= 0) {
            if (
              ((character[0] == "A" && x == 0) ||
              (character[0] == "B" && x == 4)) && 
              board[x][y] === "NA"
            ) {
              msg.board[x][y] = character;

              let index = msg.A_Chars.indexOf(character);
              if (index != -1) {
                msg.A_Chars.splice(index, 1);
              }

              index = msg.B_Chars.indexOf(character);
              if (index != -1) {
                msg.B_Chars.splice(index, 1);
              }
            }
            //check setup
            if (board[0].includes("NA") || board[4].includes("NA")) {
              msg.setup = false;
            } else {
              msg.setup = true;
            }
            socket.send(JSON.stringify(msg));
          }
          socket.send(JSON.stringify(msg));
        
        } else {
          // Game part
          const req = JSON.parse(event.data);
          const [character, position1, position2] = [
            req.character,
            req.position1,
            req.position2,
          ];
          //check chance
          if (
            (msg.chance === "A" && character[0] === "A") ||
            (msg.chance === "B" && character[0] === "B")
          ) {
            const [x1, y1] = [
              parseInt(position1.split(",")[0]),
              parseInt(position1.split(",")[1]),
            ];
            const [x2, y2] = [
              parseInt(position2.split(",")[0]),
              parseInt(position2.split(",")[1]),
            ];
            //check board constraints
            if (
              x1 <= 4 &&
              x1 >= 0 &&
              y1 <= 4 &&
              y1 >= 0 &&
              x2 <= 4 &&
              x2 >= 0 &&
              y2 <= 4 &&
              y2 >= 0
            ) {
              //game rules
              if (validateMove(character, x1, x2, y1, y2, msg.board)) {
                msg.board[x1][y1] = "NA";
                if (msg.board[x2][y2][0] === "A") {
                  msg.A_Chars.push(msg.board[x2][y2]);
                }
                if (msg.board[x2][y2][0] === "B") {
                  msg.B_Chars.push(msg.board[x2][y2]);
                }
                msg.board[x2][y2] = character;
                msg.chance = msg.chance === "A" ? "B" : "A";
                
                if (msg.A_Chars.length === 5) {
                  socket.send("B");
                } else if (msg.B_Chars.length === 5) {
                  socket.send("A");
                } else {
                  socket.send(JSON.stringify(msg)); // Ensure this is stringified
                }
              }
              
            }
          }
        }
      };

      socket.onclose = () => console.log("DISCONNECTED");
      socket.onerror = (error) => console.error("ERROR:", error);

      return response;
    } else {
      const file = await Deno.open("../client/herochess/public/index.html", {
        read: true,
      });
      return new Response(file.readable);
    }
  },
});