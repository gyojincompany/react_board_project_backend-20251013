import "./BoardDetail.css";

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axiosConfig";

import PostEdit from "../component/PostEdit";
import PostView from "../component/PostView";
import CommentForm from "../component/CommentForm";
import CommentList from "../component/CommentList";

function BoardDetail({ user }) {
  //props user->현재 로그인한 사용자의 username

  const [post, setPost] = useState(null); //해당 글 id로 요청한 글 객체
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false); //수정 화면 출력 여부

  const { id } = useParams(); // board/:id id 파라미터 받아오기

  //클릭한 글의 id로 글 1개 가져오기
  const loadPost = async () => {
    //특정 글 id로 글 1개 요청하기
    try {
      setLoading(true);
      const res = await api.get(`/api/board/${id}`);
      setPost(res.data); //특정 글 id 객체를 state에 등록
    } catch (err) {
      console.error(err);
      setError("해당 게시글은 존재하지 않습니다.");
      // alert("해당 게시글은 존재하지 않습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPost(); //게시글 다시 불러오기
    loadComments(); //게시글에 달린 댓글 리스트 다시 불러오기
  }, [id]);

  //댓글 관련 이벤트 처리 시작!
  const [comments, setComments] = useState([]); //백엔드에서 가져온 기존 댓글 배열

  //댓글 리스트 불러오기 함수
  const loadComments = async () => {
    try {
      const res = await api.get(`/api/comments/${id}`);
      //res->댓글 리스트 저장(ex:7번글에 달린 댓글 4개 리스트)
      setComments(res.data);
    } catch (err) {
      console.error(err);
      alert("댓글 리스트 불러오기 실패!");
    }
  };

  if (loading) return <p>게시글 로딩 중....</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!post)
    return <p sytle={{ color: "blue" }}>해당 게시글이 존재하지 않습니다.</p>;

  //로그인 상태이면서 로그인한 유저와 글을 쓴 유저가 같은때->참
  return (
    <div className="detail-container">
      {/* 게시글 영역 시작! */}
      {editing ? (
        <PostEdit post={post} setEditing={setEditing} setPost={setPost} />
      ) : (
        <PostView post={post} user={user} setEditing={setEditing} />
      )}
      {/* 게시글 영역 끝! */}

      {/* 댓글 영역 시작! */}
      <div className="comment-section">
        {/* 댓글 입력 폼 시작! */}
        <CommentForm user={user} boardId={id} loadComments={loadComments} />
        {/* 댓글 입력 폼 끝! */}

        {/* 기존 댓글 리스트 시작! */}
        <CommentList
          comments={comments}
          user={user}
          loadComments={loadComments}
        />
        {/* 기존 댓글 리스트 끝! */}
      </div>
      {/* 댓글 영역 끝! */}
    </div>
  );
}

export default BoardDetail;
