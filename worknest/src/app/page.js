import React from "react";

export default function HomePage() {
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
        <form className="w-full space-y-4">
          <input
            type="text"
            placeholder="Username"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
