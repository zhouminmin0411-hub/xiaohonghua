package com.xiaohonghua.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaohonghua.entity.WeeklyPointConfig;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 每周积分配置Mapper接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Mapper
public interface WeeklyPointConfigMapper extends BaseMapper<WeeklyPointConfig> {
    
    /**
     * 根据孩子ID查询配置
     * 
     * @param childId 孩子ID
     * @return 每周积分配置
     */
    @Select("SELECT * FROM weekly_point_config WHERE child_id = #{childId}")
    WeeklyPointConfig findByChildId(Long childId);
    
    /**
     * 查询所有启用的配置
     * 
     * @return 启用的配置列表
     */
    @Select("SELECT * FROM weekly_point_config WHERE enabled = 1")
    List<WeeklyPointConfig> findEnabledConfigs();
}

