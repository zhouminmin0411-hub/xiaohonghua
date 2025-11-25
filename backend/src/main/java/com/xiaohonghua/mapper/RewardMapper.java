package com.xiaohonghua.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaohonghua.entity.Reward;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import java.util.List;

/**
 * 奖励Mapper接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Mapper
public interface RewardMapper extends BaseMapper<Reward> {
    
    /**
     * 查询所有激活的奖励
     * 
     * @return 激活的奖励列表
     */
    @Select("SELECT * FROM reward WHERE is_active = 1 ORDER BY cost ASC, created_at DESC")
    List<Reward> findActiveRewards();
}

