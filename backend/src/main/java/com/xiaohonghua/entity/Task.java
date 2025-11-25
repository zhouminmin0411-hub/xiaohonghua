package com.xiaohonghua.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 任务实体类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("task")
public class Task {
    
    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 任务类型：daily-每日任务, challenge-挑战任务, housework-家务任务
     */
    private String type;
    
    /**
     * 图标（emoji或图标名称）
     */
    private String icon;
    
    /**
     * 任务标题
     */
    private String title;
    
    /**
     * 任务描述
     */
    private String description;
    
    /**
     * 奖励积分（小红花数量）
     */
    private Integer reward;
    
    /**
     * 预计时长（如"5分钟"、"30分钟"）
     */
    private String timeEstimate;
    
    /**
     * 创建者家长ID（NULL表示系统默认任务）
     */
    private Long createdByParentId;
    
    /**
     * 是否激活（1-激活，0-已删除/停用）
     */
    private Boolean isActive;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
    
    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updatedAt;
}

