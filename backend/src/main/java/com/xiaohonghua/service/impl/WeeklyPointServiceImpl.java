package com.xiaohonghua.service.impl;

import com.xiaohonghua.entity.WeeklyPointConfig;
import com.xiaohonghua.mapper.WeeklyPointConfigMapper;
import com.xiaohonghua.service.WeeklyPointService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * 每周积分配置Service实现类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Service
public class WeeklyPointServiceImpl implements WeeklyPointService {
    
    @Resource
    private WeeklyPointConfigMapper weeklyPointConfigMapper;
    
    @Override
    public WeeklyPointConfig getConfig(Long childId) {
        WeeklyPointConfig config = weeklyPointConfigMapper.findByChildId(childId);
        
        // 如果不存在，创建默认配置
        if (config == null) {
            config = WeeklyPointConfig.builder()
                    .childId(childId)
                    .weeklyAmount(0)
                    .dayOfWeek(1) // 周一
                    .time("09:00")
                    .enabled(false)
                    .build();
            weeklyPointConfigMapper.insert(config);
        }
        
        return config;
    }
    
    @Override
    public WeeklyPointConfig updateConfig(Long childId, WeeklyPointConfig config) {
        WeeklyPointConfig existingConfig = weeklyPointConfigMapper.findByChildId(childId);
        
        if (existingConfig == null) {
            // 创建新配置
            config.setChildId(childId);
            weeklyPointConfigMapper.insert(config);
            return config;
        } else {
            // 更新现有配置
            config.setId(existingConfig.getId());
            config.setChildId(childId);
            weeklyPointConfigMapper.updateById(config);
            return weeklyPointConfigMapper.selectById(config.getId());
        }
    }
}

