package com.xiaohonghua.service.impl;

import com.xiaohonghua.entity.PointHistory;
import com.xiaohonghua.exception.BusinessException;
import com.xiaohonghua.mapper.PointHistoryMapper;
import com.xiaohonghua.service.PointService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * 积分Service实现类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Service
public class PointServiceImpl implements PointService {
    
    @Resource
    private PointHistoryMapper pointHistoryMapper;
    
    @Override
    public Integer getCurrentPoints(Long childId) {
        Integer points = pointHistoryMapper.calculateCurrentPoints(childId);
        return points != null ? points : 0;
    }
    
    @Override
    public List<PointHistory> getPointHistory(Long childId) {
        return pointHistoryMapper.findByChildId(childId);
    }
    
    @Override
    public void adjustPoints(Long childId, Integer change, String reason) {
        // 检查调整后积分是否为负
        Integer currentPoints = getCurrentPoints(childId);
        if (currentPoints + change < 0) {
            throw new BusinessException("调整后积分不能为负数");
        }
        
        PointHistory pointHistory = PointHistory.builder()
                .childId(childId)
                .change(change)
                .reason(reason != null && !reason.isEmpty() ? reason : "手动调整")
                .sourceType("adjustment")
                .build();
        
        pointHistoryMapper.insert(pointHistory);
        
        log.info("手动调整积分：childId={}, change={}, reason={}", childId, change, reason);
    }
}

