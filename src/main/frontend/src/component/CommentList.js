import api from "../api/axiosConfig";
import { useState } from "react";

function CommentList({ comments, user, loadComments }) {
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");

  //댓글 삭제 이벤트 함수
  const handleCommentDelete = async (commentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) {
      //확인->true, 취소->false
      return;
    }
    try {
      await api.delete(`/api/comments/${commentId}`);
      alert("댓글 삭제 성공!");
      loadComments(); //갱신된 댓글 리스트를 다시 로딩
    } catch (err) {
      console.error(err);
      alert("댓글 삭제 권한이 없거나 삭제할 수 없는 댓글입니다.");
    }
  };

  //댓글 수정 이벤트 함수->백엔드 수정 요청
  const handleCommentUpdate = async (commentId) => {
    try {
      await api.put(`/api/comments/${commentId}`, {
        content: editingCommentContent,
      });
      setEditingCommentId(null);
      setEditingCommentContent("");
      loadComments(); //댓글 리스트 갱신
    } catch (err) {
      alert("댓글 수정 실패!");
    }
  };

  //댓글 수정 여부 확인
  const handleCommentEdit = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
    //EditingCommentContent->수정할 내용으로 저장
  };

  //날짜 format 함수 -> 날짜와 시간 출력
  const commentFormatDate = (dateString) => {
    //console.log("댓글입력날짜형식:" + dateString);
    return new Date(dateString).toLocaleString();
  };

  return (
    <ul className="comment-list">
      {comments.length === 0 && (
        <p style={{ color: "blue" }}>아직 등록된 댓글이 없습니다.</p>
      )}
      {comments.map((c) => (
        <li key={c.id} className="comment-item">
          <div className="comment-header">
            <span className="comment-author">{c.author?.username}</span>
            <span className="comment-date">
              {commentFormatDate(c.createDate)}
            </span>
          </div>

          {editingCommentId === c.id ? (
            /* 댓글 수정 섹션 시작! */
            <>
              <textarea
                value={editingCommentContent}
                onChange={(e) => setEditingCommentContent(e.target.value)}
              />
              <div className="comment-savegroup">
                <button
                  className="comment-save"
                  onClick={() => handleCommentUpdate(c.id)}
                >
                  저장
                </button>
                <button
                  className="comment-cancel"
                  onClick={() => setEditingCommentId(null)}
                >
                  취소
                </button>
              </div>
            </> /* 댓글 수정 섹션 끝! */
          ) : (
            /* 댓글 읽기 섹션 시작! */
            <>
              <div className="comment-content">{c.content}</div>

              <div className="button-group">
                {/* 로그인한 유저 본인이 쓴 댓글만 삭제 수정 가능 */}
                {user === c.author?.username && (
                  <>
                    <button
                      className="comment-edit"
                      onClick={() => handleCommentEdit(c)}
                    >
                      수정
                    </button>
                    <button
                      className="comment-delete"
                      onClick={() => handleCommentDelete(c.id)}
                    >
                      삭제
                    </button>
                  </>
                )}
              </div>
            </>
            /* 댓글 읽기 섹션 끝! */
          )}
        </li>
      ))}
    </ul>
  );
}

export default CommentList;
