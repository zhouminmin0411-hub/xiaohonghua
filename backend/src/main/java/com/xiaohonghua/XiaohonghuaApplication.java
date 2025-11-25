package com.xiaohonghua;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * 小红花应用启动类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@SpringBootApplication
@EnableScheduling
@MapperScan("com.xiaohonghua.mapper")
public class XiaohonghuaApplication {

    public static void main(String[] args) {
        SpringApplication.run(XiaohonghuaApplication.class, args);
        System.out.println("\n========================================");
        System.out.println("🌸 小红花后端服务启动成功！");
        System.out.println("📚 API文档地址: http://localhost:8080/api/doc.html");
        System.out.println("========================================\n");
    }
}

