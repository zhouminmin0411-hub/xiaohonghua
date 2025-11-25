package com.xiaohonghua.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 任务记录实体类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("task_record")
public class TaskRecord {
    
    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 任务ID
     */
    private Long taskId;
    
    /**
     * 孩子ID
     */
    private Long childId;
    
    /**
     * 状态：received-已领取, completed-已完成
     */
    private String status;
    
    /**
     * 获得的积分（小红花数量）
     */
    private Integer reward;
    
    /**
     * 领取时间
     */
    private LocalDateTime receivedAt;
    
    /**
     * 完成时间
     */
    private LocalDateTime completedAt;
    
    /**
     * 家长点赞时间（NULL表示未点赞）
     */
    private LocalDateTime parentLikedAt;
    
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

