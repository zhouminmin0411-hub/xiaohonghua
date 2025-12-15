package com.xiaohonghua.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 积分历史实体类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("point_history")
public class PointHistory {
    
    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 孩子ID
     */
    private Long childId;
    
    /**
     * 积分变化（正数表示增加，负数表示扣减）
     */
    @TableField("`change`")
    private Integer change;
    
    /**
     * 原因说明
     */
    private String reason;
    
    /**
     * 来源类型：task-任务, reward-兑换, adjustment-手动调整, weekly-每周发放
     */
    private String sourceType;
    
    /**
     * 来源ID（task_record.id 或 reward_record.id，手动调整时为NULL）
     */
    private Long sourceId;
    
    /**
     * 创建时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

