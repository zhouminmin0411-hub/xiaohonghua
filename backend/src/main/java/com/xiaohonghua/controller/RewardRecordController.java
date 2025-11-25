package com.xiaohonghua.controller;

import com.xiaohonghua.common.Result;
import com.xiaohonghua.entity.RewardRecord;
import com.xiaohonghua.service.RewardRecordService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 兑换记录Controller
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Api(tags = "兑换记录接口")
@RestController
@RequestMapping("/reward-records")
public class RewardRecordController {
    
    @Resource
    private RewardRecordService rewardRecordService;
    
    @ApiOperation("兑换奖励")
    @PostMapping("/redeem")
    public Result<RewardRecord> redeemReward(
            @ApiParam("孩子ID") @RequestParam Long childId,
            @ApiParam("奖励ID") @RequestParam Long rewardId) {
        RewardRecord record = rewardRecordService.redeemReward(childId, rewardId);
        return Result.success("兑换成功", record);
    }
    
    @ApiOperation("查询兑换记录")
    @GetMapping
    public Result<List<RewardRecord>> getRewardRecords(
            @ApiParam("孩子ID") @RequestParam Long childId) {
        List<RewardRecord> records = rewardRecordService.getRewardRecords(childId);
        return Result.success(records);
    }
}

