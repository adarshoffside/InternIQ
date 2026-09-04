# InternIQ Fixed Build

The frontend files in this package are the exact files supplied by you. Only the backend Gemini response pipeline and backend package list were repaired.

## Setup

1. Copy `backend/.env.example` to `backend/.env`.
2. Add your Gemini and Tavily keys.
3. Open a terminal inside `backend`.
4. Run `npm.cmd install`.
5. Run `node server.js`.
6. Open `frontend/index.html` using Live Server.

The backend terminal should show the server URL and selected Gemini model. If an API fails, the website now displays the real useful error instead of only a generic message.
