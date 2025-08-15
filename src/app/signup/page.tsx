"use client";
import React, { useState } from "react";
import { supabase } from "../supabase-client";

function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      console.log("error signing in", error);
    }
    alert("signed up");
    console.log(data);
  };

  return (
    <div>
      <form
        className="flex flex-col gap-2 p-4 border border-gray-300 rounded bg-zinc-300 text-black"
        onSubmit={(e) => {
          e.preventDefault();
          handleSignUp();
        }}
      >
        <input
          className="border border-black rounded p-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border border-black rounded p-2"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="bg-blue-500 text-white p-2" type="submit">
          Sign Up
        </button>
      </form>
    </div>
  );
}

export default page;
