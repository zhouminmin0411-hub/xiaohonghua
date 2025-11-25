package com.xiaohonghua.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class E2EFlowTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private long childId;

    @BeforeEach
    void login() throws Exception {
        JsonNode loginData = performAndExtract(
                post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"openid\":\"mock_child_openid_001\"}")
        );
        this.childId = loginData.get("id").asLong();
    }

    @Test
    void childTaskAndRewardFlow() throws Exception {
        // 初始积分
        int initialPoints = getCurrentPoints();

        // 获取任务并领取第一个任务
        JsonNode tasks = performAndExtract(get("/tasks"));
        assertThat(tasks.isArray()).isTrue();
        JsonNode firstTask = tasks.get(0);
        long taskId = firstTask.get("id").asLong();
        int reward = firstTask.get("reward").asInt();

        JsonNode receiveData = performAndExtract(
                post("/task-records/receive")
                        .param("childId", String.valueOf(childId))
                        .param("taskId", String.valueOf(taskId))
        );
        long recordId = receiveData.get("id").asLong();

        // 完成任务
        performAndExtract(
                post("/task-records/complete")
                        .param("recordId", String.valueOf(recordId))
        );

        int afterCompletePoints = getCurrentPoints();
        assertThat(afterCompletePoints).isEqualTo(initialPoints + reward);

        // 兑换奖励
        performAndExtract(
                post("/reward-records/redeem")
                        .param("childId", String.valueOf(childId))
                        .param("rewardId", "1")
        );

        int afterRedeemPoints = getCurrentPoints();
        assertThat(afterRedeemPoints).isEqualTo(afterCompletePoints - 5);
    }

    private int getCurrentPoints() throws Exception {
        JsonNode node = performAndExtract(
                get("/points/current")
                        .param("childId", String.valueOf(childId))
        );
        return node.get("points").asInt();
    }

    private JsonNode performAndExtract(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder builder) throws Exception {
        MvcResult result = mockMvc.perform(builder)
                .andExpect(status().isOk())
                .andReturn();
        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        assertThat(root.get("code").asInt()).isEqualTo(200);
        return root.get("data");
    }
}
