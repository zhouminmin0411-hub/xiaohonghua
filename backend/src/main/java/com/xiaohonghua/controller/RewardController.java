package com.xiaohonghua.controller;

import cn.hutool.core.bean.BeanUtil;
import com.xiaohonghua.common.Result;
import com.xiaohonghua.dto.RewardRequest;
import com.xiaohonghua.entity.Reward;
import com.xiaohonghua.service.RewardService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 奖励Controller
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Api(tags = "奖励接口")
@RestController
@RequestMapping("/rewards")
public class RewardController {
    
    @Resource
    private RewardService rewardService;
    
    @ApiOperation("获取奖励列表")
    @GetMapping
    public Result<List<Reward>> getRewards() {
        List<Reward> rewards = rewardService.getActiveRewards();
        return Result.success(rewards);
    }
    
    @ApiOperation("创建奖励")
    @PostMapping
    public Result<Reward> createReward(@Validated @RequestBody RewardRequest request) {
        Reward reward = BeanUtil.copyProperties(request, Reward.class);
        Reward createdReward = rewardService.createReward(reward);
        return Result.success("创建成功", createdReward);
    }
    
    @ApiOperation("更新奖励")
    @PutMapping("/{id}")
    public Result<Reward> updateReward(
            @ApiParam("奖励ID") @PathVariable Long id,
            @Validated @RequestBody RewardRequest request) {
        Reward reward = BeanUtil.copyProperties(request, Reward.class);
        Reward updatedReward = rewardService.updateReward(id, reward);
        return Result.success("更新成功", updatedReward);
    }
    
    @ApiOperation("删除奖励")
    @DeleteMapping("/{id}")
    public Result<Void> deleteReward(@ApiParam("奖励ID") @PathVariable Long id) {
        rewardService.deleteReward(id);
        return Result.success("删除成功", null);
    }
}

