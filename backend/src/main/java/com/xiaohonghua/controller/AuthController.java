package com.xiaohonghua.controller;

import com.xiaohonghua.common.Result;
import com.xiaohonghua.dto.LoginRequest;
import com.xiaohonghua.dto.VerifyPasswordRequest;
import com.xiaohonghua.dto.WechatLoginRequest;
import com.xiaohonghua.entity.User;
import com.xiaohonghua.service.UserService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

/**
 * 认证Controller
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Api(tags = "认证接口")
@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Resource
    private UserService userService;
    
    @ApiOperation("用户登录（Mock版本）")
    @PostMapping("/login")
    public Result<User> login(@Validated @RequestBody LoginRequest request) {
        User user = userService.mockLogin(request.getOpenid());
        return Result.success(user);
    }
    
    @ApiOperation("微信登录")
    @PostMapping("/wechat-login")
    public Result<User> wechatLogin(@Validated @RequestBody WechatLoginRequest request) {
        log.info("微信登录请求，code={}", request.getCode());
        User user = userService.wechatLogin(request.getCode());
        return Result.success(user);
    }
    
    @ApiOperation("验证家长密码")
    @PostMapping("/verify-parent-password")
    public Result<Map<String, Boolean>> verifyParentPassword(@Validated @RequestBody VerifyPasswordRequest request) {
        boolean verified = userService.verifyParentPassword(request.getUserId(), request.getPassword());
        
        Map<String, Boolean> result = new HashMap<>();
        result.put("verified", verified);
        
        return Result.success(result);
    }
}

