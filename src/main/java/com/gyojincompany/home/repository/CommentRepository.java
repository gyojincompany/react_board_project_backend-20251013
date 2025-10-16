package com.gyojincompany.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gyojincompany.home.entity.Comment;

public interface CommentRepository extends JpaRepository<Comment, Long>{

}
