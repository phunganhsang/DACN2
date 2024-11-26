/* eslint-disable react/prop-types */
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import Body from "./components/Body";
import Footer from "./components/Footer";
import LoginForm from "./components/LoginForm";
import { AuthProvider, useAuth } from "./store/Auth";

function PrivateRoute({ children }) {
  const { data } = useAuth();
  return data ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <div className="bg-domain bg-cover bg-center min-h-screen">
      <Router>
        <AuthProvider>
          <Routes>
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Header />
                  <Body />
                  <Footer />
                </PrivateRoute>
              }
            />
            <Route path="/login" element={<LoginForm />} />
          </Routes>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
