import { Routes, Route } from "react-router-dom";
import { routes } from "./router/routes.jsx";
import PrivateRoute from "./router/PrivateRoute";
import { useInitializeAuth } from "./hooks/useAuth";

function App() {
  useInitializeAuth();

  return (
    <Routes>
      {routes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={
            route.protected ? (
              <PrivateRoute>{route.element}</PrivateRoute>
            ) : (
              route.element
            )
          }
        />
      ))}
    </Routes>
  );
}

export default App;
