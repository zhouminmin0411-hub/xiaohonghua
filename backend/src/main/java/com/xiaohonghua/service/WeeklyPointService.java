package com.xiaohonghua.service;

import com.xiaohonghua.entity.WeeklyPointConfig;

/**
 * 每周积分配置Service接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
public interface WeeklyPointService {
    
    /**
     * 获取孩子的每周积分配置
     * 
     * @param childId 孩子ID
     * @return 每周积分配置
     */
    WeeklyPointConfig getConfig(Long childId);
    
    /**
     * 更新每周积分配置
     * 
     * @param childId 孩子ID
     * @param config 配置信息
     * @return 更新后的配置
     */
    WeeklyPointConfig updateConfig(Long childId, WeeklyPointConfig config);
}

