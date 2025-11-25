package com.xiaohonghua.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaohonghua.entity.TaskRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 任务记录Mapper接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Mapper
public interface TaskRecordMapper extends BaseMapper<TaskRecord> {
    
    /**
     * 查询孩子本周完成的任务记录
     * 
     * @param childId 孩子ID
     * @return 任务记录列表
     */
    @Select("SELECT * FROM task_record WHERE child_id = #{childId} " +
            "AND status = 'completed' " +
            "AND YEARWEEK(completed_at, 1) = YEARWEEK(NOW(), 1) " +
            "ORDER BY completed_at DESC")
    List<TaskRecord> findWeeklyCompletedRecords(Long childId);
    
    /**
     * 查询孩子所有已完成的任务记录
     * 
     * @param childId 孩子ID
     * @return 任务记录列表
     */
    @Select("SELECT * FROM task_record WHERE child_id = #{childId} " +
            "AND status = 'completed' " +
            "ORDER BY completed_at DESC")
    List<TaskRecord> findCompletedRecords(Long childId);
}

