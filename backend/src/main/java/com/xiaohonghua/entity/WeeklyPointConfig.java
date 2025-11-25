package com.xiaohonghua.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 每周积分配置实体类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("weekly_point_config")
public class WeeklyPointConfig {
    
    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 孩子ID（唯一，一个孩子一条配置）
     */
    private Long childId;
    
    /**
     * 每周发放积分数量
     */
    private Integer weeklyAmount;
    
    /**
     * 发放星期（1-7，1表示周一，7表示周日）
     */
    private Integer dayOfWeek;
    
    /**
     * 发放时间（HH:mm格式，如"09:00"）
     */
    private String time;
    
    /**
     * 是否启用（1-启用，0-停用）
     */
    private Boolean enabled;
    
    /**
     * 上次发放时间（用于防重复发放）
     */
    private LocalDateTime lastSentAt;
    
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

