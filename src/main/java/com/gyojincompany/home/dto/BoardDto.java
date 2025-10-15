package com.gyojincompany.home.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class BoardDto {
	
	@NotBlank(message = "제목을 입력해 주세요")
	@Size(min = 5, message = "글 제목은 최소 5글자 이상이어야 합니다")
	private String title;
	
	@NotBlank(message = "내용을 입력해 주세요")
	@Size(min = 5, message = "글 내용은 최소 5글자 이상이어야 합니다")
	private String content;

}
