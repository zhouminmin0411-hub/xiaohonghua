package com.xiaohonghua.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 奖励请求DTO
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@ApiModel("奖励请求")
public class RewardRequest {
    
    @ApiModelProperty(value = "奖励标题", required = true, example = "看30分钟电视")
    @NotBlank(message = "奖励标题不能为空")
    private String title;
    
    @ApiModelProperty(value = "消耗积分", required = true, example = "10")
    @NotNull(message = "消耗积分不能为空")
    private Integer cost;
    
    @ApiModelProperty(value = "图标", example = "📺")
    private String icon;
    
    @ApiModelProperty(value = "类型", required = true, example = "virtual")
    @NotBlank(message = "类型不能为空")
    private String type;
    
    @ApiModelProperty(value = "创建者家长ID", example = "2")
    private Long createdByParentId;
}

