package com.gyojincompany.home.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.gyojincompany.home.entity.SiteUser;
import com.gyojincompany.home.repository.UserRepository;

@Service
public class UserSecurtiyService implements UserDetailsService{
	
	@Autowired
	private UserRepository userRepository;	
	
	//spring security->유저에게 받은 username과 password를 조회
	//username이 존재하지 않으면 "사용자 없음"으로 에러 발생
	//username이 존재하면 password 확인->성공->권한 부여
	@Override
	public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
		
		SiteUser siteUser = userRepository.findByUsername(username)
				.orElseThrow(()->new UsernameNotFoundException("사용자 없음"));
		
		return org.springframework.security.core.userdetails.User
				.withUsername(siteUser.getUsername())
				.password(siteUser.getPassword()) //비밀번호가 암호화되어 있어야 함
				.authorities("USER") //권한부여
				.build(); //UserDetails 객체 생성 반환
	}

}
