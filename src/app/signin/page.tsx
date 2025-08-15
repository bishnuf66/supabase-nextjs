"use client";
import React, { useState } from "react";
import { supabase } from "../supabase-client";

function page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      console.log("error signing in", error);
    }
    alert("signed in");
    console.log(data);
  };

  return (
    <div>
      <form
        className="flex flex-col gap-2 p-4 border border-gray-300 rounded bg-zinc-300 text-black"
        onSubmit={(e) => {
          e.preventDefault();
          handleSignIn();
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

        <button type="submit">Sign In</button>
      </form>
    </div>
  );
}

export default page;
