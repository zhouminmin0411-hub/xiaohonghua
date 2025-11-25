package com.xiaohonghua.service;

import com.xiaohonghua.entity.Task;

import java.util.List;

/**
 * 任务Service接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
public interface TaskService {
    
    /**
     * 获取所有激活的任务列表
     * 
     * @return 任务列表
     */
    List<Task> getActiveTasks();
    
    /**
     * 根据ID获取任务
     * 
     * @param id 任务ID
     * @return 任务信息
     */
    Task getTaskById(Long id);
    
    /**
     * 创建任务
     * 
     * @param task 任务信息
     * @return 创建的任务
     */
    Task createTask(Task task);
    
    /**
     * 更新任务
     * 
     * @param id 任务ID
     * @param task 任务信息
     * @return 更新后的任务
     */
    Task updateTask(Long id, Task task);
    
    /**
     * 删除任务（软删除）
     * 
     * @param id 任务ID
     */
    void deleteTask(Long id);
}

