package com.gyojincompany.home.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;


import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity //모든 요청 url이 스프링 시큐리티의 제어를 받도록 하는 annotation
public class Securityconfig {	
	
	@Bean
	public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
	    http
	        .csrf(csrf -> csrf.disable())  //새 방식 (람다 DSL)
	        .cors(Customizer.withDefaults())
	        .authorizeHttpRequests(auth -> auth
	        		//리액트 라우터 설정 경로 허용
	        		.requestMatchers(
	        				"/", 
	        				"/index.html", 
	        				"/login", 
	        				"/signup", 
	        				"/board/**", 
	        				"/static/**")
	        		.permitAll()	                
	                // 읽기 API는 로그인 없이 허용
	                .requestMatchers(
	                		"/api/board", 
	                		"/api/board/**", 
	                		"/api/comments", 
	                		"/api/comments/**")
	                .permitAll()
	                
	                // 쓰기/수정/삭제 API는 인증 필요
//	                .requestMatchers(
//	                		"/api/board/write", 
//	                		"/api/board/update/**", 
//	                		"/api/board/delete/**")
//	                .authenticated()
//	                .requestMatchers(
//	                		"/api/comments/write", 
//	                		"/api/comments/delete/**")
//	                .authenticated()           
	            .anyRequest().authenticated()
	        )	      
	        .formLogin(login -> login	 
	        	.loginPage("/login").permitAll()	
	            .loginProcessingUrl("/api/auth/login")
	            .usernameParameter("username")
	            .passwordParameter("password")
	            .successHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_OK))
	            .failureHandler((req, res, ex) -> res.setStatus(HttpServletResponse.SC_UNAUTHORIZED))
	        )
	        .logout(logout -> logout
	            .logoutUrl("/api/auth/logout")
	            .logoutSuccessHandler((req, res, auth) -> res.setStatus(HttpServletResponse.SC_OK))
	        )
//	        .anonymous().disable()
	        .anonymous(anonymous -> anonymous.disable()); //로그아웃 후 user를 null값으로 변경
	        ; 
		

	    return http.build();
	}

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    
 // 프론트엔드(React) 주소 허용
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(
        		"http://localhost:3000",
        		"http://localhost:8888",
        		"http://172.30.1.55:3000", //본인 서버 주소 ip(개발)->배포 서버 ip
        		"http://172.30.1.55:8888", //본인 서버 주소 ip(개발)->배포 서버 ip
        		"http:127.0.0.1:3000"
        		)); // React 개발 서버
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true); // 쿠키, 세션 허용 시 필요

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
    
    
	
}
