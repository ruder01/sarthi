import React, { useEffect, useState } from "react";

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    avatar: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [theme, setTheme] = useState("light");

  useEffect(() => {
    const storedTheme = localStorage.getItem("theme");
    setTheme(storedTheme || "light");
  }, []);

  useEffect(() => {
    document.documentElement.className = theme;
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form data:", formData);
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        theme === "dark" ? "bg-gray-900 text-white" : "bg-gradient-to-br from-white to-blue-50 text-black"
      }`}
    >
      <div className={`rounded-xl shadow-xl w-full max-w-md p-8 transition-all duration-300 ${
        theme === "dark" ? "bg-gray-800" : "bg-white"
      }`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Create Account</h2>
          <button
            onClick={toggleTheme}
            className={`px-3 py-1 rounded ${
              theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-200 text-black"
            }`}
          >
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            className="w-full p-3 rounded border outline-none dark:bg-gray-700 bg-gray-100 placeholder-gray-500 dark:placeholder-white dark:text-white"
            onChange={handleChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="w-full p-3 rounded border outline-none dark:bg-gray-700 bg-gray-100 placeholder-gray-500 dark:placeholder-white dark:text-white"
            onChange={handleChange}
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              className="w-full p-3 rounded border outline-none dark:bg-gray-700 bg-gray-100 placeholder-gray-500 dark:placeholder-white dark:text-white"
              onChange={handleChange}
              required
            />
            <span
              className="absolute right-3 top-3 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              👁️
            </span>
          </div>
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            className="w-full p-3 rounded border outline-none dark:bg-gray-700 bg-gray-100 placeholder-gray-500 dark:placeholder-white dark:text-white"
            onChange={handleChange}
            required
          />
          <input
            type="file"
            name="avatar"
            className="w-full p-3 rounded border bg-gray-100 dark:bg-gray-700 dark:text-white"
            onChange={handleChange}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-6 text-sm">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Login here
          </a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
