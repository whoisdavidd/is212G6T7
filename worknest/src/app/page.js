"use client";
import React, { useState } from "react";




export default function HomePage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://13.228.70.27:5002/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        // Handle successful login (e.g., save a token or redirect)
        console.log("Login successful:", data);
        sessionStorage.setItem("role", data.data.role);
        sessionStorage.setItem("staff_id", data.data.staff_id);
        sessionStorage.setItem("department", data.data.department);
        if(data.data.role === "1"){
          window.location.href = "/Manager";  // Redirect to HR page
        }else if (data.data.role == 2) {
          window.location.href = "/Staff";  // Redirect to Staff page
        }else{
          window.location.href = "/dashboard";  // Redirect to HR page
        }
      }
    } catch (error) {
      console.error("Error during login:", error);
      setErrorMessage("An error occurred. Please try again.");
    }
  };

  return (
    <div className="relative h-screen flex items-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url("/background.svg")' }}
      ></div>

      <div className="absolute top-1/3 left-1/3 transform -translate-x-1/2 -translate-y-1/2 text-center font-extrabold text-[90px] leading-[22px] text-[#21005d] w-[463.8px] h-[119.3px]">
        WorkNest
      </div>

      <div className="relative z-10 w-auto max-w-md ml-auto mr-16 flex flex-col justify-center p-8 bg-white bg-opacity-90 shadow-lg rounded-lg">
        <h1 className="text-4xl font-bold text-center mb-6">Welcome Back</h1>
        {errorMessage && (
          <p className="text-red-500 text-center mb-4">{errorMessage}</p>
        )}
        <form className="w-full space-y-4" onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700" onClick = {handleLogin}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
