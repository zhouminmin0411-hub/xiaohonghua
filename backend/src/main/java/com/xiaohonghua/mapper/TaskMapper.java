package com.xiaohonghua.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaohonghua.entity.Task;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 任务Mapper接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Mapper
public interface TaskMapper extends BaseMapper<Task> {
    
    /**
     * 查询所有激活的任务
     * 
     * @return 激活的任务列表
     */
    @Select("SELECT * FROM task WHERE is_active = 1 ORDER BY created_at DESC")
    List<Task> findActiveTasks();
    
    /**
     * 根据类型查询激活的任务
     * 
     * @param type 任务类型
     * @return 任务列表
     */
    @Select("SELECT * FROM task WHERE is_active = 1 AND type = #{type} ORDER BY created_at DESC")
    List<Task> findActiveTasksByType(String type);
}

