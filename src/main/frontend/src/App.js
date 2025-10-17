import { Route, Routes } from "react-router-dom";
import "./App.css";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import Board from "./pages/Board";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import BoardWrite from "./pages/BoardWrite";
import BoardDetail from "./pages/BoardDetail";
import { useEffect, useState } from "react";
import api from "./api/axiosConfig";

function App() {
  const [user, setUser] = useState(null); //로그인 성공->현재 로그인한 유저의 이름

  const checkUser = async () => {
    try {
      const res = await api.get("api/auth/me");
      setUser(res.data.username);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    checkUser();
  }, []);

  const handleLogout = async () => {
    await api.post("/api/auth/logout");
    setUser(null); //로그아웃 후에 user값을 다시 null으로 저장
  };

  return (
    <div className="App">
      <Navbar onLogout={handleLogout} user={user} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login onLogin={setUser} />} />
        <Route path="/board" element={<Board user={user} />} />
        <Route path="/board/write" element={<BoardWrite user={user} />} />
        <Route path="/board/:id" element={<BoardDetail user={user} />} />
      </Routes>
    </div>
  );
}

export default App;
