/* eslint-disable no-undef */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/Auth";
import vnnicLogo from "../assets/vnnic-logo-f.png";

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, data } = useAuth();
  const VITE_HOST_BACKEND = import.meta.env.VITE_HOST_BACKEND;

  useEffect(() => {
    if (data) {
      navigate("/");
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch(`http://${VITE_HOST_BACKEND}/user/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error("Login failed");
      }

      const data = await response.json();

      if (data.token) {
        login(data);
        console.log("Login successful");
        navigate("/");
      } else {
        throw new Error("Token not received");
      }
    } catch (err) {
      setError("Login failed. Please try again.");
      console.error("Login error:", err);
    }
  };

  return (
    <>
      <div className="bg-gray-100 content-center items-center flex justify-center pt-2">
        <div>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://www.vnnic.vn/"
          >
            <img src={vnnicLogo} alt="logo-vi" className="h-18" />
          </a>
        </div>
      </div>
      <div className="flex items-center justify-center min-h-screen bg-gray-100 pb-20 ">
        <div className="w-full max-w-lg  ">
          <form
            onSubmit={handleLogin}
            className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <h2 className="text-4xl font-bold mb-8 text-center ">Login</h2>
            {error && (
              <p className="text-red-500 text-xs italic mb-4">{error}</p>
            )}
            <div className="mb-10">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="shadow appearance-none border rounded w-full h-12 py-2 px-3  text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="mb-10">
              <label
                className="block text-gray-700 text-lg font-bold mb-2"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="shadow appearance-none border rounded w-full h-12 py-2 px-3  text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center ">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block font-semibold text-md text-gray-900"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="text-md font-semibold text-blue-500 hover:text-blue-800"
              >
                Forgot password?
              </a>
            </div>
            <div className="flex items-center justify-between">
              <button
                className="bg-orange-500 hover:bg-orange-700 text-xl text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
                type="submit"
              >
                Login
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default LoginForm;
