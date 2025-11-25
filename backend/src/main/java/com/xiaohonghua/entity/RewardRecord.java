package com.xiaohonghua.entity;

import com.baomidou.mybatisplus.annotation.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 兑换记录实体类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@TableName("reward_record")
public class RewardRecord {
    
    /**
     * 主键ID
     */
    @TableId(value = "id", type = IdType.AUTO)
    private Long id;
    
    /**
     * 奖励ID
     */
    private Long rewardId;
    
    /**
     * 孩子ID
     */
    private Long childId;
    
    /**
     * 消耗的积分（小红花数量）
     */
    private Integer cost;
    
    /**
     * 兑换时间
     */
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createdAt;
}

