package com.xiaohonghua.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 奖励实体类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("reward")
public class Reward {
    
    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 奖励标题
     */
    private String title;
    
    /**
     * 消耗积分（小红花数量）
     */
    private Integer cost;
    
    /**
     * 图标（emoji或图标名称）
     */
    private String icon;
    
    /**
     * 类型：virtual-虚拟奖励, physical-实物奖励
     */
    private String type;
    
    /**
     * 是否激活（1-激活，0-已删除/停用）
     */
    private Boolean isActive;
    
    /**
     * 创建者家长ID（NULL表示系统默认奖励）
     */
    private Long createdByParentId;
    
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

