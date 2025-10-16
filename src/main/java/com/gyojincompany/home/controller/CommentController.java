package com.gyojincompany.home.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gyojincompany.home.dto.CommentDto;
import com.gyojincompany.home.entity.Board;
import com.gyojincompany.home.entity.Comment;
import com.gyojincompany.home.entity.SiteUser;
import com.gyojincompany.home.repository.BoardRepository;
import com.gyojincompany.home.repository.CommentRepository;
import com.gyojincompany.home.repository.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/comments")
public class CommentController {
	
	@Autowired
	private CommentRepository commentRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	@Autowired
	private BoardRepository boardRepository;
	
	//댓글 작성->
	@PostMapping("/{boardId}")
	public ResponseEntity<?> writeComment(
			@PathVariable("boardId") Long boardId,
			@Valid @RequestBody CommentDto commentDto,
			BindingResult bindingResult, 
			Authentication auth
			) {
		
		//Spring Validation 결과 처리
		if(bindingResult.hasErrors()) { //참이면 유효성 체크 실패->error 발생
			Map<String, String> errors = new HashMap<>();
			bindingResult.getFieldErrors().forEach(
				err -> {
					errors.put(err.getField(), err.getDefaultMessage());					
				}
			);
			return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errors);
		}
		
		//원 게시글의 존재 여부 확인
		Optional<Board> _board = boardRepository.findById(boardId);
		if (_board.isEmpty()) { //참이면 해당 원 게시글 존재 x
			
			Map<String, String> error = new HashMap<>();
			error.put("boardError", "해당 게시글이 존재하지 않습니다.");
			
			return ResponseEntity.status(404).body(error);
		}
		
		//로그인한 유저의 SiteUser 객체 가져오기
		SiteUser user = userRepository.findByUsername(auth.getName()).orElseThrow();
		
		Comment comment = new Comment();
		comment.setBoard(_board.get());
		comment.setAuthor(user);
		comment.setContent(commentDto.getContent());
		
		commentRepository.save(comment); //작성된 comment 엔티티를 db에 삽입		
		
		return ResponseEntity.ok(comment); //db에 등록된 댓글 객체 200 응답과 반환
	}
	
	//댓글 조회->댓글이 달린 원 게시글의 id가 필요->게시글 id로 댓글 조회
	@GetMapping("/{boardId}")
	public ResponseEntity<?> getComments(@PathVariable("boardId") Long boardId) {
		
		//원 게시글의 존재 여부 확인
		Optional<Board> _board = boardRepository.findById(boardId);
		if (_board.isEmpty()) { //참이면 해당 원 게시글 존재 x
			return ResponseEntity.badRequest().body("해당 게시글이 존재하지 않습니다.");
		}
		
		List<Comment> comments  = commentRepository.findByBoard(_board.get());
		
		return ResponseEntity.ok(comments);
	}
	
	//댓글 수정
	@PutMapping("/{commentId}")
	public ResponseEntity<?> updateComment(
			@PathVariable("commentId") Long commentId,
			@RequestBody CommentDto commentDto,
			Authentication auth) {
		
		//수정할 댓글 찾아오기
		Comment comment = commentRepository.findById(commentId).orElseThrow();
		
		if (!comment.getAuthor().getUsername().equals(auth.getName())) { //참이면 수정 권한 X
			return ResponseEntity.status(403).body("수정 권한이 없습니다.");
		}
		
		comment.setContent(commentDto.getContent());
		commentRepository.save(comment); //수정 완료
		
		return ResponseEntity.ok(comment); //수정 완료 후 수정된 댓글 객체 반환
	}
	
	//댓글 삭제
	@DeleteMapping("/{commentId}")
	public ResponseEntity<?> deleteComment(
			@PathVariable("commentId") Long commentId,
			Authentication auth) {
		
		Optional<Comment> _comment = commentRepository.findById(commentId);
		if (_comment.isEmpty()) {
			return ResponseEntity.status(404).body("삭제할 댓글이 존재하지 않습니다.");
		}
		
		if (!_comment.get().getAuthor().getUsername().equals(auth.getName()) ) { //참->삭제권한 x
			return ResponseEntity.status(403).body("삭제 권한이 없습니다.");
		}
		
		commentRepository.delete(_comment.get());
			
		return ResponseEntity.ok("댓글 삭제 성공!");
	}
	

}
