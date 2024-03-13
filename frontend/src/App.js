import Home from './pages/Home';
import Login from './pages/Login';

function App() {
  // Temporary value for testing
  const loggedIn = true;

  if (!loggedIn) {
    return <Login />
  }

  return (
    <div>
      <Home />
    </div>
  );
}

export default App;
