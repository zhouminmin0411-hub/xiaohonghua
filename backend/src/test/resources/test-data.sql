INSERT INTO `user` (id, openid, role, nickname, avatar_url, child_id)
VALUES
(1, 'mock_child_openid_001', 'child', '测试儿童', 'https://example.com/avatar.png', NULL),
(2, 'mock_parent_openid_001', 'parent', '测试家长', 'https://example.com/avatar2.png', 1);

INSERT INTO task (id, type, icon, title, description, reward, time_estimate, created_by_parent_id, is_active)
VALUES
(1, 'daily', '🧹', '整理房间', '保持房间整洁', 3, '5分钟', NULL, TRUE),
(2, 'daily', '🚴', '骑行训练', '完成一次骑行', 5, '30分钟', NULL, TRUE);

INSERT INTO reward (id, title, cost, icon, type, is_active)
VALUES
(1, '看30分钟电视', 5, '📺', 'virtual', TRUE),
(2, '周末豪华体验', 50, '🎁', 'physical', TRUE);

INSERT INTO point_history (child_id, change, reason, source_type, source_id)
VALUES
(1, 30, '初始化积分', 'adjustment', NULL);
