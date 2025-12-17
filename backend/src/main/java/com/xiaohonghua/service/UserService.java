package com.xiaohonghua.service;

import com.xiaohonghua.entity.User;
import org.springframework.web.multipart.MultipartFile;

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
     * 微信登录
     * 
     * @param code 微信登录凭证
     * @return 用户信息
     */
    User wechatLogin(String code);
    
    /**
     * 更新用户资料
     * 
     * @param userId 用户ID
     * @param nickname 昵称（可选）
     * @param avatarUrl 头像URL（可选）
     * @return 更新后的用户信息
     */
    User updateProfile(Long userId, String nickname, String avatarUrl);
    
    /**
     * 上传用户头像
     * 
     * @param userId 用户ID
     * @param file 头像文件
     * @return 头像URL
     */
    String uploadAvatar(Long userId, MultipartFile file);
    
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

