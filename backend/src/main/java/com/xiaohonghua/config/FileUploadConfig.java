package com.xiaohonghua.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * 文件上传配置
 * 
 * @author xiaohonghua
 * @since 2025-12-17
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "file.upload")
public class FileUploadConfig {
    
    /**
     * 上传目录
     */
    private String path;
    
    /**
     * 允许的文件类型
     */
    private String allowedTypes;
    
    /**
     * 最大文件大小（字节）
     */
    private Long maxSize;
    
    /**
     * 访问URL前缀
     */
    private String urlPrefix;
}

