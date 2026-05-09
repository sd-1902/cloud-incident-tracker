import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../components/firebase";
import { useNavigate } from "react-router-dom";
import { signupUser } from "../api/client";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  async function handleSignup(e) {
    e.preventDefault();

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      console.log("Created user:", user.uid);

      await signupUser({
        uid: user.uid,
        name: name,
        email: user.email,
        role: "operator"});
      
      // redirect after signup
      navigate("/");

    } catch (err) {
      console.error(err);
      alert("Signup failed");
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h1>Sign Up</h1>

      <form onSubmit={handleSignup}>
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br />
       
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />

        <button type="submit">Create Account</button>
      </form>
    </div>
  );
}