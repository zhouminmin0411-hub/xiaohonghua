package com.xiaohonghua.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaohonghua.entity.RewardRecord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 兑换记录Mapper接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Mapper
public interface RewardRecordMapper extends BaseMapper<RewardRecord> {
    
    /**
     * 查询孩子的兑换记录
     * 
     * @param childId 孩子ID
     * @return 兑换记录列表
     */
    @Select("SELECT * FROM reward_record WHERE child_id = #{childId} ORDER BY created_at DESC")
    List<RewardRecord> findByChildId(Long childId);
}

