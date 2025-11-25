package com.xiaohonghua.controller;

import com.xiaohonghua.common.Result;
import com.xiaohonghua.dto.AdjustPointsRequest;
import com.xiaohonghua.entity.PointHistory;
import com.xiaohonghua.service.PointService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 积分Controller
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Api(tags = "积分接口")
@RestController
@RequestMapping("/points")
public class PointController {
    
    @Resource
    private PointService pointService;
    
    @ApiOperation("获取当前积分")
    @GetMapping("/current")
    public Result<Map<String, Integer>> getCurrentPoints(
            @ApiParam("孩子ID") @RequestParam Long childId) {
        Integer points = pointService.getCurrentPoints(childId);
        
        Map<String, Integer> result = new HashMap<>();
        result.put("points", points);
        
        return Result.success(result);
    }
    
    @ApiOperation("获取积分历史")
    @GetMapping("/history")
    public Result<List<PointHistory>> getPointHistory(
            @ApiParam("孩子ID") @RequestParam Long childId) {
        List<PointHistory> history = pointService.getPointHistory(childId);
        return Result.success(history);
    }
    
    @ApiOperation("手动调整积分")
    @PostMapping("/adjust")
    public Result<Void> adjustPoints(@Validated @RequestBody AdjustPointsRequest request) {
        pointService.adjustPoints(request.getChildId(), request.getChange(), request.getReason());
        return Result.success("调整成功", null);
    }
}

