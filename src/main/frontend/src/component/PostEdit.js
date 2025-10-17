import { useState } from "react";
import api from "../api/axiosConfig";

function PostEdit({ post, setEditing, setPost }) {
  //props post->BoardDetail에서 제공한 기존 글(수정하기 전 글)->아이디,제목,내용
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);

  const handleUpdate = async () => {
    if (!window.confirm("정말 수정하시겠습니까?")) {
      //확인->true, 취소->false
      return;
    }
    try {
      const res = await api.put(`/api/board/${post.id}`, { title, content });
      alert("게시글이 수정되었습니다.");
      setPost(res.data); //새로 수정된 글로 post 변수 값 변경
      setEditing(false); //상세보기 화면으로 전환
    } catch (err) {
      console.error(err);
      if (err.response.status === 403) {
        alert("수정 권한이 없습니다.");
      } else {
        alert("수정 실패!");
      }
    }
  };

  return (
    <div className="edit-form">
      <h2>글 수정하기</h2>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea value={content} onChange={(e) => setContent(e.target.value)} />
      <div className="button-group">
        <button className="edit-button" onClick={handleUpdate}>
          저장
        </button>
        <button className="delete-button" onClick={() => setEditing(false)}>
          취소
        </button>
      </div>
    </div>
  );
}

export default PostEdit;
