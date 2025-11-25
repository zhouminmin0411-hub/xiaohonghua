package com.xiaohonghua.common;

import lombok.Data;

import java.io.Serializable;

/**
 * 统一响应结果类
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Data
public class Result<T> implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    /**
     * 响应码
     */
    private Integer code;
    
    /**
     * 响应消息
     */
    private String message;
    
    /**
     * 响应数据
     */
    private T data;
    
    /**
     * 时间戳
     */
    private Long timestamp;
    
    public Result() {
        this.timestamp = System.currentTimeMillis();
    }
    
    public Result(Integer code, String message, T data) {
        this.code = code;
        this.message = message;
        this.data = data;
        this.timestamp = System.currentTimeMillis();
    }
    
    /**
     * 成功响应（无数据）
     */
    public static <T> Result<T> success() {
        return new Result<>(ResultCode.SUCCESS, "操作成功", null);
    }
    
    /**
     * 成功响应（带数据）
     */
    public static <T> Result<T> success(T data) {
        return new Result<>(ResultCode.SUCCESS, "操作成功", data);
    }
    
    /**
     * 成功响应（自定义消息和数据）
     */
    public static <T> Result<T> success(String message, T data) {
        return new Result<>(ResultCode.SUCCESS, message, data);
    }
    
    /**
     * 失败响应
     */
    public static <T> Result<T> error() {
        return new Result<>(ResultCode.ERROR, "操作失败", null);
    }
    
    /**
     * 失败响应（自定义消息）
     */
    public static <T> Result<T> error(String message) {
        return new Result<>(ResultCode.ERROR, message, null);
    }
    
    /**
     * 失败响应（自定义响应码和消息）
     */
    public static <T> Result<T> error(Integer code, String message) {
        return new Result<>(code, message, null);
    }
    
    /**
     * 参数校验失败响应
     */
    public static <T> Result<T> validateError(String message) {
        return new Result<>(ResultCode.VALIDATE_ERROR, message, null);
    }
    
    /**
     * 未授权响应
     */
    public static <T> Result<T> unauthorized(String message) {
        return new Result<>(ResultCode.UNAUTHORIZED, message, null);
    }
}

