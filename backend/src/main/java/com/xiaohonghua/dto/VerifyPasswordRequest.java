package com.xiaohonghua.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 验证家长密码请求DTO
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@ApiModel("验证家长密码请求")
public class VerifyPasswordRequest {
    
    @ApiModelProperty(value = "用户ID", required = true, example = "1")
    @NotNull(message = "用户ID不能为空")
    private Long userId;
    
    @ApiModelProperty(value = "密码", required = true, example = "0000")
    @NotBlank(message = "密码不能为空")
    private String password;
}

