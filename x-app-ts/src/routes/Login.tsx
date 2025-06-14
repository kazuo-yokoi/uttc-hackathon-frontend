import { useState, FormEvent } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { fireAuth } from "../firebase";
import { Link, useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();
  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(fireAuth, email, password);
      navigate("/");
    } catch (error: any) {
      console.log(error);
      setError(error.message);
    }
  };
  return (
    <div>
      <h1>ログイン</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form
        style={{ display: "flex", flexDirection: "column" }}
        onSubmit={submit}
      >
        <div>
          <label>Email: </label>
          <input
            type={"email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          ></input>
        </div>
        <div>
          <label>Password: </label>
          <input
            type={"text"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          ></input>
        </div>
        <button type={"submit"}>Submit</button>
        <div>
          ユーザ登録は<Link to="/signup">こちら</Link>から
        </div>
      </form>
    </div>
  );
};
export default Login;
