package com.xiaohonghua.service;

import com.xiaohonghua.entity.PointHistory;

import java.util.List;

/**
 * 积分Service接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
public interface PointService {
    
    /**
     * 获取孩子当前积分
     * 
     * @param childId 孩子ID
     * @return 当前积分
     */
    Integer getCurrentPoints(Long childId);
    
    /**
     * 获取孩子的积分历史
     * 
     * @param childId 孩子ID
     * @return 积分历史列表
     */
    List<PointHistory> getPointHistory(Long childId);
    
    /**
     * 手动调整积分
     * 
     * @param childId 孩子ID
     * @param change 变化值（正数增加，负数扣减）
     * @param reason 原因
     */
    void adjustPoints(Long childId, Integer change, String reason);
}

