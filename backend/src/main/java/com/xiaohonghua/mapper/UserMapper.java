package com.xiaohonghua.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.xiaohonghua.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

/**
 * 用户Mapper接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Mapper
public interface UserMapper extends BaseMapper<User> {
    
    /**
     * 根据openid查询用户
     * 
     * @param openid 微信openid
     * @return 用户信息
     */
    @Select("SELECT * FROM user WHERE openid = #{openid}")
    User findByOpenid(String openid);
}

