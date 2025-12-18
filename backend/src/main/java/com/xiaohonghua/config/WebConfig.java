package com.xiaohonghua.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.converter.json.MappingJackson2HttpMessageConverter;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Resource;
import java.nio.file.Paths;
import org.springframework.lang.NonNull;

import java.util.List;

/**
 * Web配置类
 * 配置跨域等
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Resource
    private FileUploadConfig fileUploadConfig;
    
    /**
     * 跨域配置
     */
    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedOriginPatterns("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
    
    /**
     * 配置消息转换器，确保JSON不转义Unicode
     */
    @Override
    public void configureMessageConverters(@NonNull List<HttpMessageConverter<?>> converters) {
        // 使用默认的Jackson转换器，但确保使用我们配置的ObjectMapper
        converters.add(new MappingJackson2HttpMessageConverter());
    }

    /**
     * 静态资源映射：将上传的头像文件对外暴露
     * 访问路径：/uploads/** -> 指向配置的本地上传目录
     */
    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        // 计算本地上传目录的父目录（uploads/）的绝对路径
        // fileUploadConfig.getPath() = ./uploads/avatars/
        // 需要映射到 ./uploads/ 而不是 ./uploads/avatars/
        String uploadsDir = Paths.get("./uploads/").toAbsolutePath().toString();
        // 确保以斜杠结尾
        if (!uploadsDir.endsWith("/")) {
            uploadsDir = uploadsDir + "/";
        }
        // file: 前缀是 Spring 静态资源映射需要的
        String location = "file:" + uploadsDir;
        
        // 映射 /uploads/** 到 ./uploads/
        // 这样访问 /uploads/avatars/xxx.jpg 就会找到 ./uploads/avatars/xxx.jpg
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(location);
    }
    
    /**
     * 配置RestTemplate用于HTTP请求
     */
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
