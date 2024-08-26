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
              (character[0] == "A" && x == 0) ||
              (character[0] == "B" && x == 4)
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
            const [x1, y1] = position1.split(",");
            const [x2, y2] = position2.split(",");
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
              // if (validateMove(character, x1, x2, y1, y2, board)) {
                msg.board[x1][y1] = "NA";
                if (msg.board[x2][y2][0] === "A") {
                  msg.A_Chars.push(msg.board[x2][y2]);
                }
                if (msg.board[x2][y2][0] === "B") {
                  msg.B_Chars.push(msg.board[x2][y2]);
                }
                msg.board[x2][y2] = character;
                msg.chance = msg.chance == "A" ? "B" : "A";
                socket.send(msg);
              // }
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
