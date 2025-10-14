package com.gyojincompany.home.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gyojincompany.home.entity.Board;
import com.gyojincompany.home.entity.SiteUser;
import com.gyojincompany.home.repository.BoardRepository;
import com.gyojincompany.home.repository.UserRepository;

@RestController
@RequestMapping("/api/board")
public class BoardController {
	
	@Autowired
	private BoardRepository boardRepository;
	
	@Autowired
	private UserRepository userRepository;
	
	//전체 게시글 조회
	@GetMapping
	public List<Board> list() {
		return boardRepository.findAll();
	}
	
	//게시글 작성
	@PostMapping
	public ResponseEntity<?> write(@RequestBody Board req, Authentication auth) {
		
		//auth.getName() -> 로그인한 유저 이름
		
		SiteUser siteUser = userRepository.findByUsername(auth.getName())
				.orElseThrow(()->new UsernameNotFoundException("사용자 없음"));
		//siteUser->현재 로그인한 유저의 레코드
		
		Board board = new Board();
		board.setTitle(req.getTitle()); //유저가 입력한 글 제목
		board.setContent(req.getContent()); //유저가 입력한 글 내용
		board.setAuthor(siteUser); //유저 정보
		
		boardRepository.save(board);
		
		return ResponseEntity.ok(board);
	}
	

}
