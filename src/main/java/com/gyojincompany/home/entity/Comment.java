package com.gyojincompany.home.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
public class Comment {
	
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(nullable = false, length = 500)
	private String content; //댓글 내용
	
	@CreationTimestamp //자동으로 insert 시 현재 날짜시간 삽입
	private LocalDateTime createDate; //댓글 입력 날짜시간
	
	//로그인한 사용자의 이름->댓글 쓴 사용자
	@ManyToOne(fetch = FetchType.LAZY) //->불필요한 join방지->성능 상향->ManyToOne에서 항상 명시
	@JoinColumn(name = "author_id") //join되는 테이블의 외래키 이름 설정
	@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
	//@JsonIgnore
	private SiteUser author;
	
	//댓글이 달릴 원 게시글의 id
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "board_id") //join되는 테이블의 외래키 이름 설정
	@JsonIgnore
	private Board board;

}
