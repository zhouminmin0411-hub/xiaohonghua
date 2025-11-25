package com.xiaohonghua.common;

/**
 * 响应状态码
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
public class ResultCode {
    
    /**
     * 成功
     */
    public static final Integer SUCCESS = 200;
    
    /**
     * 失败
     */
    public static final Integer ERROR = 500;
    
    /**
     * 参数校验失败
     */
    public static final Integer VALIDATE_ERROR = 400;
    
    /**
     * 未授权
     */
    public static final Integer UNAUTHORIZED = 401;
    
    /**
     * 禁止访问
     */
    public static final Integer FORBIDDEN = 403;
    
    /**
     * 未找到
     */
    public static final Integer NOT_FOUND = 404;
}

