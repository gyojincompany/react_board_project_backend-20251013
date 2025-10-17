import { useNavigate } from "react-router-dom";
import api from "../api/axiosConfig";

function PostView({ post, user, setEditing }) {
  //props->post->상세보기 화면에서 보여줄 글 객체
  const isAuthor = user && user === post.author.username;
  const navigate = useNavigate();

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      //확인->true, 취소->false
      return;
    }
    try {
      await api.delete(`/api/board/${post.id}`);
      alert("게시글 삭제 성공!");
      navigate("/board");
    } catch (err) {
      console.error(err);
      if (err.response.status === 403) {
        alert("삭제 권한이 없습니다.");
      } else {
        alert("삭제 실패!");
      }
    }
  };

  //날짜 format 함수 -> 날짜와 시간 출력
  const FormatDate = (dateString) => {
    //console.log("댓글입력날짜형식:" + dateString);
    return new Date(dateString).toLocaleString();
  };

  return (
    <>
      <h2>{post.title}</h2>
      <p className="author">작성자 : {post.author.username}</p>
      <p className="author">작성일 : {FormatDate(post.createDate)}</p>

      <div className="content">{post.content}</div>

      <div className="button-group">
        <button className="list-button" onClick={() => navigate("/board")}>
          글목록
        </button>

        {/* 로그인한 유저 본인이 쓴글만 삭제 수정 가능 */}
        {isAuthor && (
          <>
            <button className="edit-button" onClick={() => setEditing(true)}>
              수정
            </button>
            <button className="delete-button" onClick={handleDelete}>
              삭제
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default PostView;
