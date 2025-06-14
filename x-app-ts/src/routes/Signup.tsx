import { useState, FormEvent } from "react";
import { fireAuth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const SignUp: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await createUserWithEmailAndPassword(fireAuth, email, password);
      navigate("/");
    } catch (error: any) {
      console.error(error);
      setError(error.message);
    }
  };

  return (
    <div>
      <h1>ユーザ登録</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={submit}
      >
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SignUp;
