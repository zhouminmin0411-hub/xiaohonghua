package com.xiaohonghua.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * 微信登录请求DTO
 * 
 * @author xiaohonghua
 * @since 2025-12-16
 */
@Data
@ApiModel(description = "微信登录请求")
public class WechatLoginRequest {
    
    @ApiModelProperty(value = "微信小程序登录凭证code", required = true, example = "0x1234567890abcdef")
    @NotBlank(message = "登录凭证code不能为空")
    private String code;
}

