package com.xiaohonghua.service;

import com.xiaohonghua.entity.RewardRecord;

import java.util.List;

/**
 * 兑换记录Service接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
public interface RewardRecordService {
    
    /**
     * 兑换奖励
     * 
     * @param childId 孩子ID
     * @param rewardId 奖励ID
     * @return 兑换记录
     */
    RewardRecord redeemReward(Long childId, Long rewardId);
    
    /**
     * 查询孩子的兑换记录
     * 
     * @param childId 孩子ID
     * @return 兑换记录列表
     */
    List<RewardRecord> getRewardRecords(Long childId);
}

