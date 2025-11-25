package com.xiaohonghua.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.xiaohonghua.entity.PointHistory;
import com.xiaohonghua.entity.Task;
import com.xiaohonghua.entity.TaskRecord;
import com.xiaohonghua.exception.BusinessException;
import com.xiaohonghua.mapper.PointHistoryMapper;
import com.xiaohonghua.mapper.TaskMapper;
import com.xiaohonghua.mapper.TaskRecordMapper;
import com.xiaohonghua.service.TaskRecordService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 任务记录Service实现类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Service
public class TaskRecordServiceImpl implements TaskRecordService {
    
    @Resource
    private TaskRecordMapper taskRecordMapper;
    
    @Resource
    private TaskMapper taskMapper;
    
    @Resource
    private PointHistoryMapper pointHistoryMapper;
    
    @Override
    public TaskRecord receiveTask(Long childId, Long taskId) {
        Task task = taskMapper.selectById(taskId);
        if (task == null || !task.getIsActive()) {
            throw new BusinessException("任务不存在或已停用");
        }
        
        LambdaQueryWrapper<TaskRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TaskRecord::getChildId, childId)
                .eq(TaskRecord::getTaskId, taskId)
                .eq(TaskRecord::getStatus, "received")
                .last("LIMIT 1");
        TaskRecord existingRecord = taskRecordMapper.selectOne(wrapper);
        if (existingRecord != null) {
            throw new BusinessException("任务已领取，请先完成后再领取");
        }
        
        TaskRecord record = TaskRecord.builder()
                .taskId(taskId)
                .childId(childId)
                .status("received")
                .reward(task.getReward())
                .receivedAt(LocalDateTime.now())
                .build();
        
        taskRecordMapper.insert(record);
        return record;
    }
    
    @Override
    @Transactional(rollbackFor = Exception.class)
    public TaskRecord completeTask(Long recordId) {
        TaskRecord record = taskRecordMapper.selectById(recordId);
        if (record == null) {
            throw new BusinessException("任务记录不存在");
        }
        
        if ("completed".equals(record.getStatus())) {
            throw new BusinessException("任务已完成，请勿重复操作");
        }
        
        // 更新任务记录
        record.setStatus("completed");
        record.setCompletedAt(LocalDateTime.now());
        taskRecordMapper.updateById(record);
        
        // 写入积分历史
        Task task = taskMapper.selectById(record.getTaskId());
        String taskTitle = task != null ? task.getTitle() : "任务";
        
        PointHistory pointHistory = PointHistory.builder()
                .childId(record.getChildId())
                .change(record.getReward())
                .reason("完成任务：" + taskTitle)
                .sourceType("task")
                .sourceId(recordId)
                .build();
        
        pointHistoryMapper.insert(pointHistory);
        
        log.info("任务完成：childId={}, taskId={}, reward={}", record.getChildId(), record.getTaskId(), record.getReward());
        
        return record;
    }
    
    @Override
    public List<TaskRecord> getTaskRecords(Long childId, String status) {
        LambdaQueryWrapper<TaskRecord> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(TaskRecord::getChildId, childId);
        
        if (status != null && !status.isEmpty()) {
            wrapper.eq(TaskRecord::getStatus, status);
        }
        
        wrapper.orderByDesc(TaskRecord::getCreatedAt);
        return taskRecordMapper.selectList(wrapper);
    }
    
    @Override
    public void likeTask(Long recordId) {
        TaskRecord record = taskRecordMapper.selectById(recordId);
        if (record == null) {
            throw new BusinessException("任务记录不存在");
        }
        
        if (!"completed".equals(record.getStatus())) {
            throw new BusinessException("只能为已完成的任务点赞");
        }
        
        record.setParentLikedAt(LocalDateTime.now());
        taskRecordMapper.updateById(record);
    }
    
    @Override
    public void unlikeTask(Long recordId) {
        TaskRecord record = taskRecordMapper.selectById(recordId);
        if (record == null) {
            throw new BusinessException("任务记录不存在");
        }
        
        record.setParentLikedAt(null);
        taskRecordMapper.updateById(record);
    }
}
