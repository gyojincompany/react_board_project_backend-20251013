package com.gyojincompany.home.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gyojincompany.home.dto.BoardDto;
import com.gyojincompany.home.entity.Board;
import com.gyojincompany.home.entity.SiteUser;
import com.gyojincompany.home.repository.BoardRepository;
import com.gyojincompany.home.repository.CommentRepository;
import com.gyojincompany.home.repository.UserRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/board")
public class BoardController {
	
	@Autowired
	private BoardRepository boardRepository;
	
	@Autowired
	private UserRepository userRepository;    
	
	@Autowired
	private CommentRepository commentRepository;
	
//	//전체 게시글 조회->페이징 처리 x
//	@GetMapping
//	public List<Board> list() {
//		return boardRepository.findAll();
//	}
	
	//게시글 페이징 처리
	@GetMapping
	public ResponseEntity<?> pagingList(@RequestParam(name = "page", defaultValue = "0") int page,
						@RequestParam(name ="size", defaultValue = "10") int size) {
		//page->사용자가 요청한 페이지의 번호, size->한 페이지당 보여질 글의 갯수
		
		if (page < 0) {
			page = 0;
		}
		
		if (size <= 0) {
			size = 10;
		}
		
		//Pageable 객체 생성->findAll에서 사용
		Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
		Page<Board> boardPage = boardRepository.findAll(pageable); //DB에서 페이징된 게시글만 조회
		//boardPage가 포함하는 정보->
		//1. 해당 페이지 글 리스트->boardPage.getContent()
		//2. 현재 페이지 번호->boardPage.getNumber()
		//3. 전체 페이지 수->boardPage.getTotalPages()
		//4. 전체 게시글 수-> boardPage.getTotalElements()
		
		Map<String, Object> pagingResponse = new HashMap<>();
		pagingResponse.put("posts", boardPage.getContent()); //페이징된 현재 페이지에 해당하는 게시글 리스트 10개
		pagingResponse.put("currentPage", boardPage.getNumber()); //현재 페이지 번호
		pagingResponse.put("totalPages", boardPage.getTotalPages()); //모든 페이지의 수
		pagingResponse.put("totalItems", boardPage.getTotalElements()); //게시판에 올라와 있는 모든 글 수(Long)
		//{"currentPage":3, totalPages:57}
		//System.out.println("총 글의 갯수:" + boardPage.getTotalElements());
		
		return ResponseEntity.ok(pagingResponse);
	}
	
	
	
//	//게시글 작성
//	@PostMapping
//	public ResponseEntity<?> write(@RequestBody Board req, Authentication auth) {
//		
//		//auth.getName() -> 로그인한 유저 이름
//		
//		SiteUser siteUser = userRepository.findByUsername(auth.getName())
//				.orElseThrow(()->new UsernameNotFoundException("사용자 없음"));
//		//siteUser->현재 로그인한 유저의 레코드
//		
//		Board board = new Board();
//		board.setTitle(req.getTitle()); //유저가 입력한 글 제목
//		board.setContent(req.getContent()); //유저가 입력한 글 내용
//		board.setAuthor(siteUser); //유저 정보
//		
//		boardRepository.save(board);
//		
//		return ResponseEntity.ok(board);
//	}
	
	//게시글 작성(유효성 체크->제목과 내용은 5글자 이상)
	@PostMapping
	public ResponseEntity<?> write(@Valid @RequestBody BoardDto boardDto, 
									BindingResult bindingResult, 
									Authentication auth) {
		
		//사용자의 로그인 여부 확인
		if (auth == null) { //참이면 로그인 x -> 글쓰기 권한 없음 -> 에러코드 반환  
			return ResponseEntity.status(401).body("로그인 후 글쓰기 가능합니다.");
		}
		
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
		
		//auth.getName() -> 로그인한 유저 이름		
		SiteUser siteUser = userRepository.findByUsername(auth.getName())
				.orElseThrow(()->new UsernameNotFoundException("사용자 없음"));
		//siteUser->현재 로그인한 유저의 레코드
		
		Board board = new Board();
		board.setTitle(boardDto.getTitle()); //유저가 입력한 글 제목
		board.setContent(boardDto.getContent()); //유저가 입력한 글 내용
		board.setAuthor(siteUser); //유저 정보
		
		boardRepository.save(board);
		
		return ResponseEntity.ok(board);
	}
	
	//특정 게시글 번호(id)로 조회(글 상세보기)
	@GetMapping("/{id}")	
	public ResponseEntity<?> getPost(@PathVariable("id") Long id) {
//		Board board = boardRepository.findById(id)
//				.orElseThrow(()->new EntityNotFoundException("해당 글 없음"));
		Optional<Board> _board = boardRepository.findById(id);
		if(_board.isPresent()) { //참이면 글 조회 성공
			return ResponseEntity.ok(_board.get()); //해당 id글을 반환
		} else { //거짓이면 해당 글 조회 실패
			return ResponseEntity.status(404).body("해당 게시글은 존재하지 않습니다.");
		}
		
	}
	
	//특정 id 글 삭제(삭제권한->로그인한 후 본인 글만 삭제 가능)
	@DeleteMapping("/{id}")
	public ResponseEntity<?> deletePost(@PathVariable("id") Long id, Authentication auth) {

		Optional<Board> _board = boardRepository.findById(id);
		
		//삭제할 글의 존재 여부 확인
		if (_board.isEmpty()) { //참이면 삭제할 글이 존재하지 않음			
			return ResponseEntity.status(404).body("해당 게시글은 존재하지 않아 삭제 실패하였습니다.");
		}
		
		//로그인한 유저의 삭제 권한 확인
		if (auth == null || !auth.getName().equals(_board.get().getAuthor().getUsername())) {
			return ResponseEntity.status(403).body("해당 글에 대한 삭제 권한이 없습니다.");
		}		
		
		boardRepository.delete(_board.get());
		return ResponseEntity.ok("글 삭제 성공"); //200
		
	} 
	
	//게시글 수정(권한 설정->로그인 후 본인 작성글만 수정 가능)
	@PutMapping("/{id}")
	public ResponseEntity<?> updatePost(
			@PathVariable("id") Long id, 
			@RequestBody Board updateBoard, 
			Authentication auth) {
		
		Optional<Board> _board = boardRepository.findById(id);
		
		if (_board.isEmpty()) { //참이면 수정할 글이 존재하지 않음
			return ResponseEntity.status(404).body("해당 게시글이 존재하지 않습니다.");
		}
		
		if (auth == null || !auth.getName().equals(_board.get().getAuthor().getUsername())) {
			return ResponseEntity.status(403).body("해당 글에 대한 수정 권한이 없습니다.");
		}
		
		Board oldPost = _board.get(); //기존 게시글
		
		oldPost.setTitle(updateBoard.getTitle()); //제목 수정
		oldPost.setContent(updateBoard.getContent()); //내용 수정
		
		boardRepository.save(oldPost); //수정한 내용 저장
		
		return ResponseEntity.ok(oldPost); //수정된 내용이 저장된 글 객체 반환
	}
	

}
