package com.xiaohonghua.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;

/**
 * 任务请求DTO
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@ApiModel("任务请求")
public class TaskRequest {
    
    @ApiModelProperty(value = "任务类型", required = true, example = "daily")
    @NotBlank(message = "任务类型不能为空")
    private String type;
    
    @ApiModelProperty(value = "图标", example = "🧹")
    private String icon;
    
    @ApiModelProperty(value = "任务标题", required = true, example = "整理房间")
    @NotBlank(message = "任务标题不能为空")
    private String title;
    
    @ApiModelProperty(value = "任务描述", example = "把房间整理得干干净净")
    private String description;
    
    @ApiModelProperty(value = "奖励积分", required = true, example = "3")
    @NotNull(message = "奖励积分不能为空")
    private Integer reward;
    
    @ApiModelProperty(value = "预计时长", example = "5分钟")
    private String timeEstimate;
    
    @ApiModelProperty(value = "创建者家长ID", example = "2")
    private Long createdByParentId;
}

