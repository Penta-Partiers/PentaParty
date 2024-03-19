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
]);

function App() {  
  return (
    <AuthContext>
      <RouterProvider router={router} />
    </AuthContext>
  )
}

export default App;
