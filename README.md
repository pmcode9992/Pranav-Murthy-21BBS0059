# HeroChess

___

HeroChess is an exciting multiplayer game that utilizes WebSockets for real-time communication between the frontend and backend. The frontend is built with React, and the backend is powered by Node.js, with the server running on Deno.

## Prerequisites

Before you can run the project, ensure you have the following installed:

- **Node.js**: Download and install Node.js from [Node.js official website](https://nodejs.org/).
- **Deno**: Download and install Deno from [Deno official website](https://deno.land/).

## Installation and Running the Application

### 1. Setup the Client

1. Navigate to the client directory:
   ```bash
   cd client/herochess
   ```

2. Install the necessary packages:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

### 2. Setup the Server

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Run the server using Deno:
   ```bash
   deno run --allow-net=0.0.0.0:80 --allow-read=../client/herochess/public/index.html main.js
   ```

## How to Play

Once both the client and server are running:

- Open your browser and navigate to `http://localhost:3000` to start playing HeroChess.

---

You can customize this template further based on your project's needs.
