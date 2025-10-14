package com.gyojincompany.home.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.gyojincompany.home.entity.Board;

public interface BoardRepository extends JpaRepository<Board, Long>{

}
