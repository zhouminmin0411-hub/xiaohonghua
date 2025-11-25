package com.xiaohonghua.controller;

import cn.hutool.core.bean.BeanUtil;
import com.xiaohonghua.common.Result;
import com.xiaohonghua.dto.TaskRequest;
import com.xiaohonghua.entity.Task;
import com.xiaohonghua.service.TaskService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 任务Controller
 * 
 * @author xiaohonghua
 * @since 2025-11-16
 */
@Slf4j
@Api(tags = "任务接口")
@RestController
@RequestMapping("/tasks")
public class TaskController {
    
    @Resource
    private TaskService taskService;
    
    @ApiOperation("获取任务列表")
    @GetMapping
    public Result<List<Task>> getTasks() {
        List<Task> tasks = taskService.getActiveTasks();
        return Result.success(tasks);
    }
    
    @ApiOperation("创建任务")
    @PostMapping
    public Result<Task> createTask(@Validated @RequestBody TaskRequest request) {
        Task task = BeanUtil.copyProperties(request, Task.class);
        Task createdTask = taskService.createTask(task);
        return Result.success("创建成功", createdTask);
    }
    
    @ApiOperation("更新任务")
    @PutMapping("/{id}")
    public Result<Task> updateTask(
            @ApiParam("任务ID") @PathVariable Long id,
            @Validated @RequestBody TaskRequest request) {
        Task task = BeanUtil.copyProperties(request, Task.class);
        Task updatedTask = taskService.updateTask(id, task);
        return Result.success("更新成功", updatedTask);
    }
    
    @ApiOperation("删除任务")
    @DeleteMapping("/{id}")
    public Result<Void> deleteTask(@ApiParam("任务ID") @PathVariable Long id) {
        taskService.deleteTask(id);
        return Result.success("删除成功", null);
    }
}

