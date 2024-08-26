const board = [
  ["NA", "NA", "NA", "NA", "NA"],
  ["NA", "NA", "NA", "NA", "NA"],
  ["NA", "NA", "NA", "NA", "NA"],
  ["NA", "NA", "NA", "NA", "NA"],
  ["NA", "NA", "NA", "NA", "NA"],
];
let setup = false;
let chance = true;
let p1 = ["pawn", "hero1", "hero1"];

Deno.serve({
  port: 80,
  handler: async (request) => {
    if (request.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(request);

      socket.onopen = () => {
        console.log("CONNECTED");
        chance = !chance;
        socket.send(setup + "**" + board + "**" + chance);
        
      };

      socket.onmessage = (event) => {
        //Get move

        console.log(`RECEIVED: ${event.data}`);

        if (event.data != "ping") {
          if (!setup) {
            //Setup part
            const [character, position] = event.data.split(" ");
            const [x, y] = position.split(",");

            //check constraints
            if (x <= 4 && x >= 0 && y <= 4 && y >= 0) {
              if (
                (character[0] == "A" && x == 0) ||
                (character[0] == "B" && x == 4)
              ) {
                board[x][y] = character;
                chance = !chance;
                socket.send(setup + "**" + board + "**" + chance);
                
              }

              //check setup
              if (board[0].includes("NA") || board[4].includes("NA")) {
                setup = false;
              } else {
                setup = true;
              }
            }
          } else {
            // Game part
            const [character, position1, position2] = event.data.split(" ");
            //check chance

            if (chance && character[0] === 'A' || !chance && character[0] === 'B') {
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
                board[x1][y1] = "NA";
                board[x2][y2] = character;
                chance = !chance;
                socket.send(setup + "**" + board + "**" + chance);
                
              }
            }
          }
        }
        // socket.send("pong");
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
