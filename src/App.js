// Routing
import {
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";

// Authentication
import { AuthContext } from './auth/AuthContext';
import { ProtectedRoute } from './auth/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import PlayerView from './pages/PlayerView';
import Friends from "./pages/Friends";
import JoinLobby from "./pages/JoinLobby";
import Lobby from "./pages/Lobby";
import SpectatorView from "./pages/SpectatorView";
import GameSummary from "./pages/GameSummary";

// References: 
// - https://reactrouter.com/en/main/routers/create-browser-router
// - https://www.youtube.com/watch?v=77pemM2hwbc
const router = createBrowserRouter([
  {
    path: "/",
    element: <ProtectedRoute><Home /></ProtectedRoute>, 
  },
  {
    path: "/home",
    element: <ProtectedRoute><Home /></ProtectedRoute>, 
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/player",
    element: <ProtectedRoute><PlayerView /></ProtectedRoute>,
  },
  {
    path: "/friends",
    element: <ProtectedRoute><Friends /></ProtectedRoute>,
  },
  {
    path: "/join-lobby",
    element: <ProtectedRoute><JoinLobby /></ProtectedRoute>,
  },
  {
    path: "/lobby/:lobbyCode",
    element: <ProtectedRoute><Lobby /></ProtectedRoute>,
  },
  {
    path: "/spectator",
    Component: SpectatorView,
  },
  {
    path: "/game-summary",
    Component: GameSummary,
  },
]);

function App() {  
  return (
    <AuthContext>
      <RouterProvider router={router} />
    </AuthContext>
  )
}

export default App;
