package com.xiaohonghua.controller;

import com.xiaohonghua.common.Result;
import com.xiaohonghua.entity.WeeklyPointConfig;
import com.xiaohonghua.service.WeeklyPointService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;

/**
 * 每周积分配置Controller
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Api(tags = "每周积分配置接口")
@RestController
@RequestMapping("/weekly-config")
public class WeeklyPointConfigController {
    
    @Resource
    private WeeklyPointService weeklyPointService;
    
    @ApiOperation("获取每周积分配置")
    @GetMapping
    public Result<WeeklyPointConfig> getConfig(
            @ApiParam("孩子ID") @RequestParam Long childId) {
        WeeklyPointConfig config = weeklyPointService.getConfig(childId);
        return Result.success(config);
    }
    
    @ApiOperation("更新每周积分配置")
    @PutMapping
    public Result<WeeklyPointConfig> updateConfig(
            @ApiParam("孩子ID") @RequestParam Long childId,
            @RequestBody WeeklyPointConfig config) {
        WeeklyPointConfig updatedConfig = weeklyPointService.updateConfig(childId, config);
        return Result.success("更新成功", updatedConfig);
    }
}

