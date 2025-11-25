package com.xiaohonghua.service.impl;

import com.xiaohonghua.entity.Reward;
import com.xiaohonghua.exception.BusinessException;
import com.xiaohonghua.mapper.RewardMapper;
import com.xiaohonghua.service.RewardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * 奖励Service实现类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Service
public class RewardServiceImpl implements RewardService {
    
    @Resource
    private RewardMapper rewardMapper;
    
    @Override
    public List<Reward> getActiveRewards() {
        return rewardMapper.findActiveRewards();
    }
    
    @Override
    public Reward getRewardById(Long id) {
        Reward reward = rewardMapper.selectById(id);
        if (reward == null) {
            throw new BusinessException("奖励不存在");
        }
        return reward;
    }
    
    @Override
    public Reward createReward(Reward reward) {
        reward.setIsActive(true);
        rewardMapper.insert(reward);
        return reward;
    }
    
    @Override
    public Reward updateReward(Long id, Reward reward) {
        Reward existingReward = rewardMapper.selectById(id);
        if (existingReward == null) {
            throw new BusinessException("奖励不存在");
        }
        
        reward.setId(id);
        rewardMapper.updateById(reward);
        return rewardMapper.selectById(id);
    }
    
    @Override
    public void deleteReward(Long id) {
        Reward reward = rewardMapper.selectById(id);
        if (reward == null) {
            throw new BusinessException("奖励不存在");
        }
        
        // 软删除
        reward.setIsActive(false);
        rewardMapper.updateById(reward);
    }
}

