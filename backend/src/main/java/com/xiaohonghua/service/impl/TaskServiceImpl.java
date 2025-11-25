package com.xiaohonghua.service.impl;

import com.xiaohonghua.entity.Task;
import com.xiaohonghua.exception.BusinessException;
import com.xiaohonghua.mapper.TaskMapper;
import com.xiaohonghua.service.TaskService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.List;

/**
 * 任务Service实现类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Service
public class TaskServiceImpl implements TaskService {
    
    @Resource
    private TaskMapper taskMapper;
    
    @Override
    public List<Task> getActiveTasks() {
        return taskMapper.findActiveTasks();
    }
    
    @Override
    public Task getTaskById(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        return task;
    }
    
    @Override
    public Task createTask(Task task) {
        task.setIsActive(true);
        taskMapper.insert(task);
        return task;
    }
    
    @Override
    public Task updateTask(Long id, Task task) {
        Task existingTask = taskMapper.selectById(id);
        if (existingTask == null) {
            throw new BusinessException("任务不存在");
        }
        
        task.setId(id);
        taskMapper.updateById(task);
        return taskMapper.selectById(id);
    }
    
    @Override
    public void deleteTask(Long id) {
        Task task = taskMapper.selectById(id);
        if (task == null) {
            throw new BusinessException("任务不存在");
        }
        
        // 软删除
        task.setIsActive(false);
        taskMapper.updateById(task);
    }
}

