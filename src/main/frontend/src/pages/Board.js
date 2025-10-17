import { useEffect, useState } from "react";
import "./Board.css";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";

function Board({ user }) {
  const [posts, setPosts] = useState([]); //게시판 리스트에 출력할 글들 배열
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0); //현재 페이지 번호
  const [totalPages, setTotalPages] = useState(0); //모든 페이지 갯수
  const [totalItems, setTotalItems] = useState(0); //모든 글의 갯수
  const navigate = useNavigate();

  //게시판 페이징된 글 리스트 요청
  const loadPosts = async (page = 0) => {
    try {
      setLoading(true);
      const res = await api.get(`/api/board?page=${page}&size=10`); //모든 게시글 가져오기 요청
      setPosts(res.data.posts); //posts->전체 게시글->게시글의 배열
      setCurrentPage(res.data.currentPage); //현재 페이지 번호
      setTotalPages(res.data.totalPages); //전체 페이지 수
      setTotalItems(res.data.totalItems); //모든 글의 갯수
    } catch (err) {
      console.error(err);
      setError("게시글을 불러오는 데 실패하였습니다.");
      setPosts([]); //게시글들의 배열을 다시 초기화
    } finally {
      setLoading(false);
    }
  };

  const handleWrite = () => {
    //로그인한 유저만 글쓰기 허용
    if (!user) {
      //참이면 로그인하지 않은 경우
      alert("로그인 후 글 작성 가능합니다.");
      return;
    }
    navigate("/board/write");
  };

  useEffect(() => {
    loadPosts(currentPage);
  }, [currentPage]);

  //페이지 번호 그룹 배열 반환 함수(10개까지만 표시)
  //ex) 총 페이지 수 : 157 -> 총 16 페이지 필요 -> [0 1 2 3 4 5 6 7 8 9]
  // ▶ -> [10 11 12 13 14 15]
  const getPageNumbers = () => {
    const startPage = Math.floor(currentPage / 10) * 10;
    //0 1 2 3 4 -> 5 6 7 8 9 --> Math.floor(currentPage / 5) * 5;
    const endPage = startPage + 10 > totalPages ? totalPages : startPage + 10;
    //마지막 페이지 번호가 계산된 endPage 값보다 작을 경우 마지막 페이지를
    //endPage 값으로 변경하여 마지막 페이지 까지만 페이지 그룹이 출력되도록 수정
    const pages = [];
    for (let i = startPage; i < endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  //날짜 format 함수->날짜만 출력
  const formatDate = (dateString) => {
    return dateString.substring(0, 10);
  };

  return (
    <div className="container">
      <h2>게시판</h2>
      {loading && <p>게시판 글 리스트 로딩 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table className="board-table">
        <thead>
          <tr>
            <th>번호</th>
            <th>제목</th>
            <th>글쓴이</th>
            <th>작성일</th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
            posts
              .slice() //얕은 복사
              .map((p, index) => (
                <tr key={p.id}>
                  <td>{totalItems - (index + 10 * currentPage)}</td>
                  <td
                    className="click-title"
                    onClick={() => navigate(`/board/${p.id}`)}
                  >
                    {p.title}
                  </td>
                  <td>{p.author.username}</td>
                  <td>{formatDate(p.createDate)}</td>
                </tr>
              ))
          ) : (
            <tr>
              <td colSpan="4">게시물이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
      {/* 페이지 번호와 이동 화살표 출력 */}
      <div className="pagination">
        {/* 첫번째 페이지로 이동  */}
        <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0}>
          ◀◀
        </button>
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 0}
        >
          ◀
        </button>

        {/* 페이지 번호 그룹 10개씩 출력 */}
        {getPageNumbers().map((num) => (
          <button
            className={num === currentPage ? "active" : ""}
            key={num}
            onClick={() => setCurrentPage(num)}
          >
            {num + 1}
          </button>
        ))}

        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
        >
          ▶
        </button>
        {/* 마지막 페이지로 이동 */}
        <button
          onClick={() => setCurrentPage(totalPages - 1)}
          disabled={currentPage === totalPages - 1 || totalPages === 0}
        >
          ▶▶
        </button>
      </div>

      <div className="write-button-container">
        <button onClick={handleWrite} className="write-button">
          글쓰기
        </button>
      </div>
    </div>
  );
}

export default Board;
