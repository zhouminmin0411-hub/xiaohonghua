package com.xiaohonghua.service;

import com.xiaohonghua.entity.User;

/**
 * 用户Service接口
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
public interface UserService {
    
    /**
     * 根据openid查询用户
     * 
     * @param openid 微信openid
     * @return 用户信息
     */
    User findByOpenid(String openid);
    
    /**
     * 用户登录（Mock版本）
     * 
     * @param openid Mock openid
     * @return 用户信息
     */
    User mockLogin(String openid);
    
    /**
     * 验证家长密码
     * 
     * @param userId 用户ID
     * @param password 密码
     * @return 是否验证成功
     */
    boolean verifyParentPassword(Long userId, String password);
    
    /**
     * 设置家长密码
     * 
     * @param userId 用户ID
     * @param password 密码
     */
    void setParentPassword(Long userId, String password);
}

