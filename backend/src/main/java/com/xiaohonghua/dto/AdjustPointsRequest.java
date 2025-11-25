package com.xiaohonghua.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotNull;

/**
 * 调整积分请求DTO
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@ApiModel("调整积分请求")
public class AdjustPointsRequest {
    
    @ApiModelProperty(value = "孩子ID", required = true, example = "1")
    @NotNull(message = "孩子ID不能为空")
    private Long childId;
    
    @ApiModelProperty(value = "变化值（正数增加，负数扣减）", required = true, example = "5")
    @NotNull(message = "变化值不能为空")
    private Integer change;
    
    @ApiModelProperty(value = "原因", example = "主动帮助妹妹")
    private String reason;
}

