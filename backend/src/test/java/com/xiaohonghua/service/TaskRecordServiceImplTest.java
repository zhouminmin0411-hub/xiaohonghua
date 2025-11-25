package com.xiaohonghua.service;

import com.xiaohonghua.entity.PointHistory;
import com.xiaohonghua.entity.TaskRecord;
import com.xiaohonghua.exception.BusinessException;
import com.xiaohonghua.mapper.PointHistoryMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class TaskRecordServiceImplTest {

    @Resource
    private TaskRecordService taskRecordService;

    @Resource
    private PointHistoryMapper pointHistoryMapper;

    @Test
    void receiveTaskShouldRejectDuplicateInFlightRecords() {
        TaskRecord first = taskRecordService.receiveTask(1L, 1L);
        assertNotNull(first.getId());
        BusinessException exception = assertThrows(BusinessException.class,
                () -> taskRecordService.receiveTask(1L, 1L));
        assertTrue(exception.getMessage().contains("任务已领取"));
    }

    @Test
    void completeTaskShouldInsertPointHistory() {
        TaskRecord record = taskRecordService.receiveTask(1L, 2L);
        TaskRecord completed = taskRecordService.completeTask(record.getId());
        assertEquals("completed", completed.getStatus());

        List<PointHistory> histories = pointHistoryMapper.findByChildId(1L);
        boolean exists = histories.stream()
                .anyMatch(history -> "task".equals(history.getSourceType())
                        && record.getId().equals(history.getSourceId()));
        assertTrue(exists, "完成任务后应写入积分历史");
    }
}
