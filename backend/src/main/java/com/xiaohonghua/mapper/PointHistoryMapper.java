package com.xiaohonghua.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaohonghua.entity.PointHistory;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 积分历史Mapper接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Mapper
public interface PointHistoryMapper extends BaseMapper<PointHistory> {
    
    /**
     * 计算孩子当前积分
     * 
     * @param childId 孩子ID
     * @return 当前积分
     */
    @Select("SELECT COALESCE(SUM(`change`), 0) FROM point_history WHERE child_id = #{childId}")
    Integer calculateCurrentPoints(Long childId);
    
    /**
     * 查询孩子的积分历史
     * 
     * @param childId 孩子ID
     * @return 积分历史列表
     */
    @Select("SELECT * FROM point_history WHERE child_id = #{childId} ORDER BY created_at DESC")
    List<PointHistory> findByChildId(Long childId);
}

