package com.xiaohonghua.scheduled;

import com.xiaohonghua.entity.PointHistory;
import com.xiaohonghua.entity.WeeklyPointConfig;
import com.xiaohonghua.mapper.PointHistoryMapper;
import com.xiaohonghua.mapper.WeeklyPointConfigMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.temporal.ChronoField;
import java.util.List;

/**
 * 每周积分发放定时任务
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Component
public class WeeklyPointScheduledTask {
    
    @Resource
    private WeeklyPointConfigMapper weeklyPointConfigMapper;
    
    @Resource
    private PointHistoryMapper pointHistoryMapper;
    
    /**
     * 每分钟执行一次，检查是否需要发放每周积分
     * Cron表达式：秒 分 时 日 月 周
     * 0 * * * * ? 表示每分钟的第0秒执行
     */
    @Scheduled(cron = "0 * * * * ?")
    @Transactional(rollbackFor = Exception.class)
    public void distributeWeeklyPoints() {
        log.debug("开始检查每周积分发放...");
        
        // 获取所有启用的配置
        List<WeeklyPointConfig> configs = weeklyPointConfigMapper.findEnabledConfigs();
        
        if (configs == null || configs.isEmpty()) {
            return;
        }
        
        LocalDateTime now = LocalDateTime.now();
        int currentDayOfWeek = now.get(ChronoField.DAY_OF_WEEK); // 1=周一, 7=周日
        LocalTime currentTime = now.toLocalTime();
        String currentTimeStr = String.format("%02d:%02d", currentTime.getHour(), currentTime.getMinute());
        
        for (WeeklyPointConfig config : configs) {
            try {
                // 检查是否到达发放时间
                if (!shouldDistribute(config, currentDayOfWeek, currentTimeStr, now)) {
                    continue;
                }
                
                // 发放积分
                PointHistory pointHistory = PointHistory.builder()
                        .childId(config.getChildId())
                        .change(config.getWeeklyAmount())
                        .reason("每周固定发放")
                        .sourceType("weekly")
                        .build();
                
                pointHistoryMapper.insert(pointHistory);
                
                // 更新上次发放时间
                config.setLastSentAt(now);
                weeklyPointConfigMapper.updateById(config);
                
                log.info("每周积分发放成功：childId={}, amount={}", config.getChildId(), config.getWeeklyAmount());
                
            } catch (Exception e) {
                log.error("每周积分发放失败：childId={}, error={}", config.getChildId(), e.getMessage(), e);
            }
        }
    }
    
    /**
     * 判断是否应该发放积分
     * 
     * @param config 配置
     * @param currentDayOfWeek 当前星期（1-7）
     * @param currentTimeStr 当前时间（HH:mm）
     * @param now 当前时间
     * @return 是否应该发放
     */
    private boolean shouldDistribute(WeeklyPointConfig config, int currentDayOfWeek, String currentTimeStr, LocalDateTime now) {
        // 检查星期是否匹配
        if (!config.getDayOfWeek().equals(currentDayOfWeek)) {
            return false;
        }
        
        // 检查时间是否匹配
        if (!config.getTime().equals(currentTimeStr)) {
            return false;
        }
        
        // 防重复发放：检查是否在同一天已经发放过
        LocalDateTime lastSentAt = config.getLastSentAt();
        if (lastSentAt != null) {
            // 如果上次发放时间是今天，则不再发放
            if (lastSentAt.toLocalDate().equals(now.toLocalDate())) {
                return false;
            }
        }
        
        return true;
    }
}

