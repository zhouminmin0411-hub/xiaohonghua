package com.xiaohonghua.service;

import com.xiaohonghua.entity.RewardRecord;
import com.xiaohonghua.exception.BusinessException;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import javax.annotation.Resource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class RewardRecordServiceImplTest {

    @Resource
    private RewardRecordService rewardRecordService;

    @Resource
    private PointService pointService;

    @Test
    void redeemRewardShouldDeductPointsAndCreateRecord() {
        Integer before = pointService.getCurrentPoints(1L);
        RewardRecord record = rewardRecordService.redeemReward(1L, 1L);
        Integer after = pointService.getCurrentPoints(1L);

        assertNotNull(record.getId());
        assertEquals(before - record.getCost(), after);
    }

    @Test
    void redeemRewardShouldFailWhenBalanceIsLow() {
        assertThrows(BusinessException.class, () -> rewardRecordService.redeemReward(1L, 2L));
    }
}
