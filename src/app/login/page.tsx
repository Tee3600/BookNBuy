"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Signing in…");
    const { error } = await authClient.signIn.email({ email, password });
    setMsg(error ? `Error: ${error.message}` : "Signed in. (Requires local Postgres running.)");
  }

  return (
    <div>
      <h1>Log in</h1>
      <form onSubmit={submit}>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password</label>
        <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        <p><button className="btn btn-primary" type="submit">Log in</button></p>
      </form>
      <p>{msg}</p>
    </div>
  );
}
