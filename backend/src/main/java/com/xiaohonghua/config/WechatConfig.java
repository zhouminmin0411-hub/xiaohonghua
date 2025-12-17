package com.xiaohonghua.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 微信小程序配置
 * 
 * @author xiaohonghua
 * @since 2025-12-16
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "wechat.miniapp")
public class WechatConfig {
    
    /**
     * 小程序AppID
     */
    private String appid;
    
    /**
     * 小程序AppSecret
     */
    private String secret;
}

