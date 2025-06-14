import { fireAuth } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
  const navigate = useNavigate();
  const handleSubmit = () => {
    signOut(fireAuth);
    navigate("/login");
  };
  return (
    <div>
      <h1>ホームページ</h1>
      <button onClick={handleSubmit}>ログアウト</button>
    </div>
  );
};
export default Home;
