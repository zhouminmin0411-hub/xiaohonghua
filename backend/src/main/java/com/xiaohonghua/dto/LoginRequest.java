package com.xiaohonghua.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 登录请求DTO
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@ApiModel("登录请求")
public class LoginRequest {
    
    @ApiModelProperty(value = "微信openid（Mock版本）", required = true, example = "mock_openid_001")
    @NotBlank(message = "openid不能为空")
    private String openid;
}

