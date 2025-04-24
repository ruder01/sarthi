// src/pages/LoginPage.jsx
import axios from "axios";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { addUser } from "../redux/mindGuideSlice";
import { motion } from "framer-motion";
import { FaGoogle, FaFacebook } from "react-icons/fa";
import { IoEye, IoEyeOff } from "react-icons/io5";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const userInfo = useSelector((state) => state.mindGuide.userInfo);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn("Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        "/api/v1/user/login",
        { email, password },
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      dispatch(addUser(res.data));
      toast.success("Login successful");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
    setLoading(false);
  };

  useEffect(() => {
    const fetchProfile = async () => {
      const res = await axios.get("/api/v1/user/getUserProfile");
      dispatch(addUser(res.data));
    };
    fetchProfile();
  }, [dispatch]);

  useEffect(() => {
    if (userInfo) navigate("/");
  }, [userInfo, navigate]);

  return (
    <div className={`${darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-purple-100 via-white to-blue-100"} min-h-screen flex items-center justify-center px-4 transition-colors duration-500`}>
      <motion.form
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        onSubmit={handleSubmit}
        className={`${
          darkMode ? "bg-gray-800 text-white" : "bg-white/60 text-gray-800"
        } backdrop-blur-md shadow-xl rounded-2xl px-10 py-8 w-full max-w-md transition-colors duration-500`}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Welcome Back</h2>
          <button
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="text-sm bg-gray-200 dark:bg-gray-500 px-3 py-1 rounded-md"
          >
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <div className="space-y-4">
          <InputField label="Email" type="email" value={email} onChange={setEmail} />
          <div className="relative">
            <InputField
              label="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={setPassword}
            />
            <div
              className="absolute right-3 top-[38px] text-xl cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <IoEyeOff /> : <IoEye />}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-md font-medium transition duration-300"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </div>

        <div className="my-4 flex items-center gap-4">
          <hr className="flex-grow border-t" />
          <span className="text-xs">or</span>
          <hr className="flex-grow border-t" />
        </div>
        <p className="text-sm text-center">
          Don&apos;t have an account? {" "}
          <Link to="/register" className="text-blue-600 hover:underline">
            Register here
          </Link>
        </p>
      </motion.form>
    </div>
  );
};

const InputField = ({ label, type = "text", value, onChange }) => (
  <div>
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input
      required
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 text-black"
      placeholder={label}
    />
  </div>
);

export default LoginPage;
