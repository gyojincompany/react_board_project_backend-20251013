import { useNavigate } from "react-router-dom";
import "./Signup.css";
import { useState } from "react";
//import axios from "axios";
import api from "../api/axiosConfig";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      //로그인 요청(폼 데이터 방식)
      await api.post(
        "/api/auth/login",
        new URLSearchParams({ username, password })
        //폼 데이터 전송 방식일때는 반드시 URLSerarchParams로 전송
      );

      //현재 로그인한 사용자 정보 가져오기
      const res = await api.get("api/auth/me"); //현재 로그인한 아이디
      onLogin(res.data.username);
      //App에서 전달된 props인 onLogin 값으로 로그인한 유저의 username 전달

      //로그인 성공 메시지
      alert("로그인 성공!");

      //홈으로 이동
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      alert("로그인 실패!");
    }
  };

  return (
    <div className="form-container">
      <h2>회원로그인</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="아이디"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
}

export default Login;
