package com.xiaohonghua.controller;

import com.xiaohonghua.common.Result;
import com.xiaohonghua.entity.TaskRecord;
import com.xiaohonghua.service.TaskRecordService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 任务记录Controller
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Api(tags = "任务记录接口")
@RestController
@RequestMapping("/task-records")
public class TaskRecordController {
    
    @Resource
    private TaskRecordService taskRecordService;
    
    @ApiOperation("领取任务")
    @PostMapping("/receive")
    public Result<TaskRecord> receiveTask(
            @ApiParam("孩子ID") @RequestParam Long childId,
            @ApiParam("任务ID") @RequestParam Long taskId) {
        TaskRecord record = taskRecordService.receiveTask(childId, taskId);
        return Result.success("领取成功", record);
    }
    
    @ApiOperation("完成任务")
    @PostMapping("/complete")
    public Result<TaskRecord> completeTask(
            @ApiParam("任务记录ID") @RequestParam Long recordId) {
        TaskRecord record = taskRecordService.completeTask(recordId);
        return Result.success("完成任务成功", record);
    }
    
    @ApiOperation("查询任务记录")
    @GetMapping
    public Result<List<TaskRecord>> getTaskRecords(
            @ApiParam("孩子ID") @RequestParam Long childId,
            @ApiParam("状态（可选）") @RequestParam(required = false) String status) {
        List<TaskRecord> records = taskRecordService.getTaskRecords(childId, status);
        return Result.success(records);
    }
    
    @ApiOperation("点赞任务记录")
    @PostMapping("/{id}/like")
    public Result<Void> likeTask(@ApiParam("任务记录ID") @PathVariable Long id) {
        taskRecordService.likeTask(id);
        return Result.success("点赞成功", null);
    }
    
    @ApiOperation("取消点赞")
    @DeleteMapping("/{id}/like")
    public Result<Void> unlikeTask(@ApiParam("任务记录ID") @PathVariable Long id) {
        taskRecordService.unlikeTask(id);
        return Result.success("取消点赞成功", null);
    }
}

