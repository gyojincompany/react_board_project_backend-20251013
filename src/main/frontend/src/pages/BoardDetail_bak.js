import "./BoardDetail.css"

import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axiosConfig";


function BoardDetail({ user }) { //props user->현재 로그인한 사용자의 username

    const navigate = useNavigate();

    const [post, setPost] = useState(null); //해당 글 id로 요청한 글 객체
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editing, setEditing] = useState(false); //수정 화면 출력 여부
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const {id} = useParams(); // board/:id id 파라미터 받아오기

    //클릭한 글의 id로 글 1개 가져오기
    const loadPost = async () => { //특정 글 id로 글 1개 요청하기
        try{
            setLoading(true);
            const res = await api.get(`/api/board/${id}`);            
            setPost(res.data); //특정 글 id 객체를 state에 등록
            setTitle(res.data.title); 
            //원본 글의 제목을 수정화면에 표시하는 변수인 title 변수에 저장
            setContent(res.data.content);
            //원본 글의 내용을 수정화면에 표시하는 변수인 content 변수에 저장
            
        } catch(err) {
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
    },[id]);
    
    //글삭제
    const handleDelete = async () => {
        if(!window.confirm("정말 삭제하시겠습니까?")) { //확인->true, 취소->false
            return;
        }
        try {
            await api.delete(`/api/board/${id}`);
            alert("게시글 삭제 성공!");
            navigate("/board");
        } catch (err) {
            console.error(err);
            if(err.response.status === 403){
                alert("삭제 권한이 없습니다.");
            } else {
                alert("삭제 실패!");
            }
        }
    }

    const handleUpdate = async () => {
        if(!window.confirm("정말 수정하시겠습니까?")) { //확인->true, 취소->false
            return;
        }
        try {
            const res = await api.put(`/api/board/${id}`,{ title, content });
            alert("게시글이 수정되었습니다.");
            setPost(res.data); //새로 수정된 글로 post 변수 값 변경
            setEditing(false); //상세보기 화면으로 전환

        } catch(err) {
            console.error(err);
            if(err.response.status === 403){
                alert("수정 권한이 없습니다.");
            } else {
                alert("수정 실패!");
            }
        }
    };

    //댓글 관련 이벤트 처리 시작!
    const [newComment, setNewComment] = useState(""); //새로운 댓글 저장 변수
    const [comments, setComments] = useState([]); //백엔드에서 가져온 기존 댓글 배열
    const [editingCommentContent, setEditingCommentContent] = useState("");
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [commentErrors, setCommentErrors] = useState({});

    //날짜 format 함수 -> 날짜와 시간 출력
    const formatDate = (dateString) => {        
        return dateString.substring(0,10);
    }

    //댓글 쓰기 함수->원 게시글의 id를 파라미터로 제출
    const handleCommentSubmit = async (e) => { //백엔드에 댓글 저장 요청
        e.preventDefault();   
        setCommentErrors({});
        if (!user) {
            alert("로그인 한 후 댓글을 작성해 주세요.");
        }
        if (!newComment.trim()) {
            alert("댓글 내용을 입력해주세요.");
            return;
        }
        try {
            alert("댓글을 입력하시겠습니까?");
            await api.post(`/api/comments/${id}`, { content : newComment });
            setNewComment("");            
            //댓글 리스트 불러오기 호출
            loadComments(); //새 댓글 기존 댓글 리스트에 반영
        } catch (err) {            
            if (err.response && err.response.status === 400) {
                setCommentErrors(err.response.data);
            } else {
                console.error(err);
                alert("댓글 등록 실패!");
            }
        }        
    };

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

    //댓글 삭제 이벤트 함수
    const handleCommentDelete = async (commentId) => {
        if(!window.confirm("정말 삭제하시겠습니까?")) { //확인->true, 취소->false
            return;
        }
        try {
            await api.delete(`/api/comments/${commentId}`);
            alert("댓글 삭제 성공!");
            //navigate("/board");
            loadComments(); //갱신된 댓글 리스트를 다시 로딩
        } catch (err) {
            console.error(err);
            alert("댓글 삭제 권한이 없거나 삭제할 수 없는 댓글입니다.");
        }
    }

    //댓글 수정 이벤트 함수->백엔드 수정 요청
    const handleCommentUpdate = async (commentId) => {
        try {
            await api.put(`/api/comments/${commentId}`, 
                { content : editingCommentContent });
            setEditingCommentId(null);
            setEditingCommentContent("");
            loadComments();
        } catch (err) {
            alert("댓글 수정 실패!");
        }
    }

    //댓글 수정 여부 확인
    const handleCommentEdit = (comment) => {
        setEditingCommentId(comment.id);
        setEditingCommentContent(comment.content); 
        //EditingCommentContent->수정할 내용으로 저장
    }

    //댓글 관련 이벤트 처리 끝!


    if(loading) return <p>게시글 로딩 중....</p>;
    if(error) return <p style={{color:"red"}}>{error}</p>
    if(!post) return <p sytle={{color:"blue"}}>해당 게시글이 존재하지 않습니다.</p>

    //로그인 상태이면서 로그인한 유저와 글을 쓴 유저가 같은때->참
    const isAuthor = user && user === post?.author?.username;

    return (
        <div className="detail-container">
            {editing ? (
                <div className="edit-form">
                    <h2>글 수정하기</h2>
                    <input type="text" value={title}
                    onChange={(e) => setTitle(e.target.value)} />
                    <textarea value={content}
                    onChange={(e) => setContent(e.target.value)} />
                    <div className="button-group">
                        <button className="edit-button" onClick={() => handleUpdate}>저장</button>
                        <button className="delete-button" onClick={() => setEditing(false)}>취소</button>
                    </div>    
                </div>
            ):(
                <>
                <h2>{post.title}</h2>
                <p className="author">작성자 : {post.author.username}</p>
                <div className="content">{post.content}</div>

                <div className="button-group">
                    <button className="list-button" onClick={()=>navigate("/board")}>글목록</button>
                    
                    {/* 로그인한 유저 본인이 쓴글만 삭제 수정 가능 */}
                    {isAuthor && (
                    <>    
                        <button className="edit-button" onClick={() => setEditing(true)}>수정</button>
                        <button className="delete-button" onClick={handleDelete}>삭제</button>
                    </>
                    )}
                </div>

                {/* 댓글 영역 시작! */}  
                <div className="comment-section">  
                    {/* 댓글 입력 폼 시작! */}                  
                    <h3>댓글 쓰기</h3>
                    <form onSubmit={handleCommentSubmit} className="comment-form">
                        <textarea placeholder="댓글을 입력하세요."
                            value={newComment} onChange={(e) => setNewComment(e.target.value)}
                        />
                        {commentErrors.content && <p style={{color:"red"}}>{commentErrors.content}</p>}
                        <button type="submit" className="comment-button">등록</button>
                    </form>
                    {/* 댓글 입력 폼 끝! */}

                    {/* 기존 댓글 리스트 시작! */}
                    <ul className="comment-list">
                        {comments.length === 0 && <p style={{color:"blue"}}>아직 등록된 댓글이 없습니다.</p>}
                        {comments.map((c)=>(
                            <li key={c.id} className="comment-item">
                                <div className="comment-header">
                                    <span className="comment-author">
                                        {c.author?.username}
                                    </span>
                                    <span className="comment-date">
                                        {formatDate(c.createDate)}
                                    </span>
                                </div>

                            {editingCommentId === c.id ? (
                                /* 댓글 수정 섹션 시작! */
                                <>
                                    <textarea value={editingCommentContent} 
                                    onChange={(e) => setEditingCommentContent(e.target.value)}
                                    />
                                    <div className="comment-savegroup">
                                        <button className="comment-save"
                                            onClick={() => handleCommentUpdate(c.id)}
                                        >
                                            저장
                                        </button>
                                        <button className="comment-cancel"
                                            onClick={() => setEditingCommentId(null)}
                                        >
                                            취소
                                        </button>
                                    </div>
                                </>
                                /* 댓글 수정 섹션 끝! */
                            ) : (

                                /* 댓글 읽기 섹션 시작! */
                                <>
                                    <div className="comment-content">
                                        {c.content}
                                    </div>
                                    
                                    <div className="button-group">
                                        {/* 로그인한 유저 본인이 쓴 댓글만 삭제 수정 가능 */}
                                        {user === c.author?.username && (
                                        <>    
                                            <button className="comment-edit" 
                                                onClick={() => handleCommentEdit(c)}>
                                                수정
                                            </button>
                                            <button className="comment-delete"
                                                onClick={() => handleCommentDelete(c.id)}>
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
                    {/* 기존 댓글 리스트 끝! */}
                </div>    
                {/* 댓글 영역 끝! */}    
                </>
            )}
        </div>
    );
}

export default BoardDetail;