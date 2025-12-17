package com.xiaohonghua.util;

import com.xiaohonghua.config.FileUploadConfig;
import com.xiaohonghua.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.UUID;

/**
 * 文件上传工具类
 * 
 * @author xiaohonghua
 * @since 2025-12-16
 */
@Slf4j
@Component
public class FileUploadUtil {
    
    @Resource
    private FileUploadConfig fileUploadConfig;
    
    /**
     * 上传头像文件
     * 
     * @param file 上传的文件
     * @return 文件访问URL
     */
    public String uploadAvatar(MultipartFile file) {
        // 验证文件
        validateFile(file);
        
        // 确保上传目录存在
        String uploadPath = fileUploadConfig.getPath();
        File uploadDir = new File(uploadPath);
        if (!uploadDir.exists()) {
            boolean created = uploadDir.mkdirs();
            if (!created) {
                throw new BusinessException("创建上传目录失败");
            }
        }
        
        // 生成唯一文件名
        String originalFilename = file.getOriginalFilename();
        String extension = getFileExtension(originalFilename);
        String newFilename = UUID.randomUUID().toString() + "." + extension;
        
        try {
            // 保存文件
            Path filePath = Paths.get(uploadPath, newFilename);
            Files.write(filePath, file.getBytes());
            
            log.info("文件上传成功：{}", newFilename);
            
            // 返回访问URL
            return fileUploadConfig.getUrlPrefix() + newFilename;
            
        } catch (IOException e) {
            log.error("文件上传失败", e);
            throw new BusinessException("文件上传失败：" + e.getMessage());
        }
    }
    
    /**
     * 验证文件
     * 
     * @param file 上传的文件
     */
    private void validateFile(MultipartFile file) {
        // 检查文件是否为空
        if (file == null || file.isEmpty()) {
            throw new BusinessException("上传文件不能为空");
        }
        
        // 检查文件大小
        if (file.getSize() > fileUploadConfig.getMaxSize()) {
            throw new BusinessException("文件大小超过限制（最大2MB）");
        }
        
        // 检查文件类型
        String extension = getFileExtension(file.getOriginalFilename());
        String[] allowedTypes = fileUploadConfig.getAllowedTypes().split(",");
        boolean isAllowed = Arrays.stream(allowedTypes)
                .anyMatch(type -> type.equalsIgnoreCase(extension));
        
        if (!isAllowed) {
            throw new BusinessException("不支持的文件类型，只允许：" + fileUploadConfig.getAllowedTypes());
        }
    }
    
    /**
     * 获取文件扩展名
     * 
     * @param filename 文件名
     * @return 扩展名（小写）
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            throw new BusinessException("无效的文件名");
        }
        int lastDot = filename.lastIndexOf(".");
        return filename.substring(lastDot + 1).toLowerCase();
    }
}

