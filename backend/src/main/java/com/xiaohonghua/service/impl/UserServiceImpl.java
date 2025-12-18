package com.xiaohonghua.service.impl;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.xiaohonghua.entity.User;
import com.xiaohonghua.exception.BusinessException;
import com.xiaohonghua.mapper.UserMapper;
import com.xiaohonghua.service.UserService;
import com.xiaohonghua.util.FileUploadUtil;
import com.xiaohonghua.util.WechatApiUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.util.Map;

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
    
    @Resource
    private WechatApiUtil wechatApiUtil;
    
    @Resource
    private FileUploadUtil fileUploadUtil;
    
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
    public User wechatLogin(String code) {
        // 调用微信API换取openid
        Map<String, String> wechatData = wechatApiUtil.code2Session(code);
        String openid = wechatData.get("openid");
        String unionid = wechatData.get("unionid");
        
        // 查找用户
        User user = userMapper.findByOpenid(openid);
        
        if (user == null) {
            // 用户不存在，创建新用户
            user = User.builder()
                    .openid(openid)
                    .unionId(unionid)
                    .role("child")
                    .nickname("小朋友")
                    .avatarUrl("https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132")
                    .build();
            userMapper.insert(user);
            log.info("微信登录：创建新用户，openid={}", openid);
        } else {
            // 用户已存在，更新unionid（如果有）
            if (unionid != null && !unionid.equals(user.getUnionId())) {
                user.setUnionId(unionid);
                userMapper.updateById(user);
            }
            log.info("微信登录：用户已存在，openid={}", openid);
        }
        
        return user;
    }
    
    @Override
    public User updateProfile(Long userId, String nickname, String avatarUrl) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        boolean updated = false;
        
        // 更新昵称
        if (nickname != null && !nickname.trim().isEmpty()) {
            user.setNickname(nickname.trim());
            updated = true;
        }
        
        // 更新头像
        if (avatarUrl != null && !avatarUrl.trim().isEmpty()) {
            user.setAvatarUrl(avatarUrl.trim());
            updated = true;
        }
        
        if (updated) {
            userMapper.updateById(user);
            log.info("更新用户资料成功，userId={}", userId);
        }
        
        return user;
    }
    
    @Override
    public String uploadAvatar(Long userId, MultipartFile file) {
        User user = userMapper.selectById(userId);
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        
        // 上传文件
        String avatarUrl = fileUploadUtil.uploadAvatar(file);
        
        // 更新用户头像
        user.setAvatarUrl(avatarUrl);
        userMapper.updateById(user);
        
        log.info("上传用户头像成功，userId={}, avatarUrl={}", userId, avatarUrl);
        return avatarUrl;
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

