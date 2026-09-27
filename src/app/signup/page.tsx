"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("Creating account…");
    const { error } = await authClient.signUp.email({ email, password, name });
    setMsg(error ? `Error: ${error.message}` : "Account created. Next: become a vendor via KYC.");
  }

  return (
    <div>
      <h1>Sign up</h1>
      <form onSubmit={submit}>
        <label htmlFor="name">Name</label>
        <input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <label htmlFor="email">Email</label>
        <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <label htmlFor="password">Password (8+ chars)</label>
        <input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
        <p><button className="btn btn-primary" type="submit">Create account</button></p>
      </form>
      <p>{msg}</p>
    </div>
  );
}
