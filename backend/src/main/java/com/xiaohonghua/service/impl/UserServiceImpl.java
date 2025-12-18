package com.xiaohonghua.service.impl;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.xiaohonghua.entity.User;
import com.xiaohonghua.exception.BusinessException;
import com.xiaohonghua.mapper.UserMapper;
import com.xiaohonghua.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;

/**
 * 用户Service实现类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Service
public class UserServiceImpl implements UserService {
    
    @Resource
    private UserMapper userMapper;
    
    @Override
    public User findByOpenid(String openid) {
        return userMapper.findByOpenid(openid);
    }
    
    @Override
    public User mockLogin(String openid) {
        User user = userMapper.findByOpenid(openid);
        if (user == null) {
            // Mock登录：如果用户不存在，自动创建
            user = User.builder()
                    .openid(openid)
                    .role("child")
                    .nickname("新用户")
                    .avatarUrl("https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132")
                    .build();
            userMapper.insert(user);
            log.info("Mock登录：创建新用户，openid={}", openid);
        }
        return user;
    }
    
    @Override
    public boolean verifyParentPassword(Long userId, String password) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        String storedPassword = user.getParentPassword();
        if (storedPassword == null) {
            // 如果没有设置密码，默认密码是0000
            // 这里使用明文比较（实际应该在首次设置时加密）
            return "0000".equals(password);
        }
        
        // 使用BCrypt验证密码
        BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), storedPassword);
        return result.verified;
    }
    
    @Override
    public void setParentPassword(Long userId, String password) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 使用BCrypt加密密码
        String hashedPassword = BCrypt.withDefaults().hashToString(12, password.toCharArray());
        user.setParentPassword(hashedPassword);
        userMapper.updateById(user);
    }
}

