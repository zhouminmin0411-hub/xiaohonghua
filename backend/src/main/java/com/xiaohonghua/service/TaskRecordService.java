package com.xiaohonghua.service;

import com.xiaohonghua.entity.TaskRecord;

import java.util.List;

/**
 * 任务记录Service接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
public interface TaskRecordService {
    
    /**
     * 领取任务
     * 
     * @param childId 孩子ID
     * @param taskId 任务ID
     * @return 任务记录
     */
    TaskRecord receiveTask(Long childId, Long taskId);
    
    /**
     * 完成任务
     * 
     * @param recordId 任务记录ID
     * @return 任务记录
     */
    TaskRecord completeTask(Long recordId);
    
    /**
     * 查询孩子的任务记录
     * 
     * @param childId 孩子ID
     * @param status 状态（可选）
     * @return 任务记录列表
     */
    List<TaskRecord> getTaskRecords(Long childId, String status);
    
    /**
     * 点赞任务记录
     * 
     * @param recordId 任务记录ID
     */
    void likeTask(Long recordId);
    
    /**
     * 取消点赞
     * 
     * @param recordId 任务记录ID
     */
    void unlikeTask(Long recordId);
}

