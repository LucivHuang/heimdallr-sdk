import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();
  return (
    <>
      <h1>登录页</h1>
      <button onClick={() => navigate("/")}>首页</button>
    </>
  );
}
