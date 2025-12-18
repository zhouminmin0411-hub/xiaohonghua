package com.xiaohonghua.controller;

import com.xiaohonghua.common.Result;
import com.xiaohonghua.dto.UpdateUserProfileRequest;
import com.xiaohonghua.entity.User;
import com.xiaohonghua.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

/**
 * 用户Controller
 * 
 * @author xiaohonghua
 * @since 2025-12-17
 */
@Slf4j
@Api(tags = "用户接口")
@RestController
@RequestMapping("/users")
public class UserController {
    
    @Resource
    private UserService userService;
    
    @ApiOperation("更新用户资料")
    @PutMapping("/{userId}/profile")
    public Result<User> updateProfile(
            @ApiParam(value = "用户ID", required = true) @PathVariable Long userId,
            @Validated @RequestBody UpdateUserProfileRequest request) {
        
        log.info("更新用户资料，userId={}, nickname={}, avatarUrl={}", 
                userId, request.getNickname(), request.getAvatarUrl());
        
        User user = userService.updateProfile(userId, request.getNickname(), request.getAvatarUrl());
        return Result.success(user);
    }
    
    @ApiOperation("上传用户头像")
    @PostMapping("/{userId}/avatar")
    public Result<Map<String, String>> uploadAvatar(
            @ApiParam(value = "用户ID", required = true) @PathVariable Long userId,
            @ApiParam(value = "头像文件", required = true) @RequestParam("avatar") MultipartFile file) {
        
        log.info("上传用户头像，userId={}, filename={}", userId, file.getOriginalFilename());
        
        String avatarUrl = userService.uploadAvatar(userId, file);
        
        Map<String, String> result = new HashMap<>();
        result.put("avatarUrl", avatarUrl);
        
        return Result.success(result);
    }
}

