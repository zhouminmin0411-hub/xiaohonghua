package com.xiaohonghua.service;

import com.xiaohonghua.entity.Reward;

import java.util.List;

/**
 * 奖励Service接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
public interface RewardService {
    
    /**
     * 获取所有激活的奖励列表
     * 
     * @return 奖励列表
     */
    List<Reward> getActiveRewards();
    
    /**
     * 根据ID获取奖励
     * 
     * @param id 奖励ID
     * @return 奖励信息
     */
    Reward getRewardById(Long id);
    
    /**
     * 创建奖励
     * 
     * @param reward 奖励信息
     * @return 创建的奖励
     */
    Reward createReward(Reward reward);
    
    /**
     * 更新奖励
     * 
     * @param id 奖励ID
     * @param reward 奖励信息
     * @return 更新后的奖励
     */
    Reward updateReward(Long id, Reward reward);
    
    /**
     * 删除奖励（软删除）
     * 
     * @param id 奖励ID
     */
    void deleteReward(Long id);
}

