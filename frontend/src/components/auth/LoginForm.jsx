import React, { useState } from "react";
import Input from "../common/Input";
import PasswordInput from "../common/PasswordInput";
import Button from "../common/Button";
import SocialButton from "../common/SocialButton";

export default function LoginForm({ onSubmit, onSwitch, loading }) {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ usernameOrEmail: account, password });
  };
  return (
    <form className="form" onSubmit={handleSubmit}>
      <Input
        label="Account"
        name="account"
        value={account}
        onChange={setAccount}
        placeholder="Your name or email"
      />
      <PasswordInput
        label="Password"
        name="password"
        value={password}
        onChange={setPassword}
        placeholder="Your password"
      />
      <Button type="submit" full disabled={loading}>
        Login
      </Button>
      <div className="alt">
        Don’t you have an account? <a onClick={onSwitch}>Register</a>
      </div>
      <div className="or">or login with</div>
      <div className="socials">
        <SocialButton provider="Google" />
        <SocialButton provider="Facebook" />
      </div>
    </form>
  );
}
