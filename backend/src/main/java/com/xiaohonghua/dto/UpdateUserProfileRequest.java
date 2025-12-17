package com.xiaohonghua.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.Size;

/**
 * 更新用户资料请求DTO
 * 
 * @author xiaohonghua
 * @since 2025-12-16
 */
@Data
@ApiModel(description = "更新用户资料请求")
public class UpdateUserProfileRequest {
    
    @ApiModelProperty(value = "昵称", example = "小明")
    @Size(min = 1, max = 64, message = "昵称长度必须在1-64个字符之间")
    private String nickname;
    
    @ApiModelProperty(value = "头像URL", example = "https://example.com/avatar.jpg")
    @Size(max = 255, message = "头像URL长度不能超过255个字符")
    private String avatarUrl;
}

