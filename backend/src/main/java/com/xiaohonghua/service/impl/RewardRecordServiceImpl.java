package com.xiaohonghua.service.impl;

import com.xiaohonghua.entity.PointHistory;
import com.xiaohonghua.entity.Reward;
import com.xiaohonghua.entity.RewardRecord;
import com.xiaohonghua.exception.BusinessException;
import com.xiaohonghua.mapper.PointHistoryMapper;
import com.xiaohonghua.mapper.RewardMapper;
import com.xiaohonghua.mapper.RewardRecordMapper;
import com.xiaohonghua.service.RewardRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

/**
 * 兑换记录Service实现类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Service
public class RewardRecordServiceImpl implements RewardRecordService {
    
    @Resource
    private RewardRecordMapper rewardRecordMapper;
    
    @Resource
    private RewardMapper rewardMapper;
    
    @Resource
    private PointHistoryMapper pointHistoryMapper;
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public RewardRecord redeemReward(Long childId, Long rewardId) {
        Reward reward = rewardMapper.selectById(rewardId);
        if (reward == null || !reward.getIsActive()) {
            throw new BusinessException("奖励不存在或已停用");
        }
        
        // 计算当前积分
        Integer currentPoints = pointHistoryMapper.calculateCurrentPoints(childId);
        if (currentPoints == null) {
            currentPoints = 0;
        }
        
        // 检查积分是否足够
        if (currentPoints < reward.getCost()) {
            throw new BusinessException("积分不足，无法兑换");
        }
        
        // 创建兑换记录
        RewardRecord record = RewardRecord.builder()
                .rewardId(rewardId)
                .childId(childId)
                .cost(reward.getCost())
                .build();
        
        rewardRecordMapper.insert(record);
        
        // 写入积分历史（扣减）
        PointHistory pointHistory = PointHistory.builder()
                .childId(childId)
                .change(-reward.getCost())
                .reason("兑换奖励：" + reward.getTitle())
                .sourceType("reward")
                .sourceId(record.getId())
                .build();
        
        pointHistoryMapper.insert(pointHistory);
        
        log.info("兑换奖励：childId={}, rewardId={}, cost={}", childId, rewardId, reward.getCost());
        
        return record;
    }
    
    @Override
    public List<RewardRecord> getRewardRecords(Long childId) {
        return rewardRecordMapper.findByChildId(childId);
    }
}

