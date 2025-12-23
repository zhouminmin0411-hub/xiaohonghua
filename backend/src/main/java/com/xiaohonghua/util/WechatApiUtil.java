package com.xiaohonghua.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.xiaohonghua.config.WechatConfig;
import com.xiaohonghua.exception.BusinessException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.Map;

/**
 * 微信API工具类
 * 
 * @author xiaohonghua
 * @since 2025-12-17
 */
@Slf4j
@Component
public class WechatApiUtil {
    
    @Resource
    private WechatConfig wechatConfig;
    
    @Resource
    private RestTemplate restTemplate;
    
    @Resource
    private ObjectMapper objectMapper;
    
    /**
     * 微信code2session接口URL
     */
    private static final String CODE_2_SESSION_URL = "https://api.weixin.qq.com/sns/jscode2session";
    
    /**
     * 使用code换取openid和session_key
     * 
     * @param code 微信登录凭证
     * @return 包含openid和session_key的Map
     */
    public Map<String, String> code2Session(String code) {
        try {
            // 构建请求URL
            String url = String.format("%s?appid=%s&secret=%s&js_code=%s&grant_type=authorization_code",
                    CODE_2_SESSION_URL,
                    wechatConfig.getAppid(),
                    wechatConfig.getSecret(),
                    code);
            
            log.info("调用微信code2session接口，code={}", code);
            
            // 发送HTTP GET请求
            String response = restTemplate.getForObject(url, String.class);
            log.debug("微信code2session响应：{}", response);
            
            // 解析响应JSON
            JsonNode jsonNode = objectMapper.readTree(response);
            
            // 检查是否有错误
            if (jsonNode.has("errcode")) {
                int errcode = jsonNode.get("errcode").asInt();
                if (errcode != 0) {
                    String errmsg = jsonNode.get("errmsg").asText();
                    log.error("微信code2session失败，errcode={}，errmsg={}", errcode, errmsg);
                    throw new BusinessException("微信登录失败：" + errmsg);
                }
            }
            
            // 提取openid和session_key
            if (!jsonNode.has("openid") || !jsonNode.has("session_key")) {
                throw new BusinessException("微信返回数据格式错误");
            }
            
            String openid = jsonNode.get("openid").asText();
            String sessionKey = jsonNode.get("session_key").asText();
            String unionid = jsonNode.has("unionid") ? jsonNode.get("unionid").asText() : null;
            
            Map<String, String> result = new HashMap<>();
            result.put("openid", openid);
            result.put("sessionKey", sessionKey);
            if (unionid != null) {
                result.put("unionid", unionid);
            }
            
            log.info("微信code2session成功，openid={}", openid);
            return result;
            
        } catch (Exception e) {
            log.error("调用微信code2session接口异常", e);
            throw new BusinessException("微信登录异常：" + e.getMessage());
        }
    }
}



