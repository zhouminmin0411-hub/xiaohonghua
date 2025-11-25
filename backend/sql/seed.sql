-- 小红花数据库种子数据脚本
-- 用于插入初始测试数据
-- 执行前请确保已运行 schema.sql

USE xiaohonghua;

-- 清空现有数据（谨慎使用，仅开发环境）
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE point_history;
TRUNCATE TABLE reward_record;
TRUNCATE TABLE task_record;
TRUNCATE TABLE weekly_point_config;
TRUNCATE TABLE reward;
TRUNCATE TABLE task;
TRUNCATE TABLE user;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================
-- 1. 插入测试用户
-- ============================================
-- 密码说明：默认家长密码为 "0000"，BCrypt加密后的值
-- 可使用在线工具生成：https://bcrypt-generator.com/
-- 或使用Java代码：BCrypt.hashpw("0000", BCrypt.gensalt())

INSERT INTO `user` (`id`, `openid`, `role`, `nickname`, `avatar_url`, `parent_password`, `created_at`) VALUES
(1, 'mock_child_openid_001', 'child', '小明', 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132', NULL, '2025-11-01 08:00:00'),
(2, 'mock_parent_openid_001', 'parent', '小明妈妈', 'https://thirdwx.qlogo.cn/mmopen/vi_32/Q0j4TwGTfTKVUskibDnhMt0fk1L5nhGp1xCU9kH5EY7HqibJtHmSQQDKBgV4HJIrLWNGO9cqnC3ggiaUnXQMR6kHQ/132', '$2a$10$N9qo8uLOickgx2ZMRZOMyTOZhj.WdCoCdEiPNLLxQvCGsR8KPx8tZe', '2025-11-01 08:00:00');

-- 关联家长和孩子
UPDATE `user` SET `child_id` = 1 WHERE `id` = 2;

-- ============================================
-- 2. 插入默认任务（对应前端 mockData/tasks.json）
-- ============================================
INSERT INTO `task` (`id`, `type`, `icon`, `title`, `description`, `reward`, `time_estimate`, `is_active`, `created_at`) VALUES
(1, 'daily', '🧹', '整理房间', '把房间整理得干干净净', 3, '5分钟', 1, '2025-11-15 08:00:00'),
(2, 'daily', '🚴', '完成1次10公里骑行', '骑自行车锻炼身体', 10, '30分钟', 1, '2025-11-15 08:00:00'),
(3, 'daily', '📚', '阅读30分钟', '认真阅读课外书', 5, '30分钟', 1, '2025-11-15 08:00:00'),
(4, 'daily', '🥗', '吃完所有蔬菜', '不挑食，营养均衡', 2, '', 1, '2025-11-15 08:00:00'),
(5, 'challenge', '🎵', '练习钢琴1小时', '完成本周的钢琴练习', 8, '60分钟', 1, '2025-11-15 08:00:00'),
(6, 'daily', '🛏️', '自己叠被子', '起床后整理床铺', 2, '3分钟', 1, '2025-11-15 08:00:00'),
(7, 'housework', '🍽️', '帮忙洗碗', '饭后帮助家人洗碗', 4, '10分钟', 1, '2025-11-15 08:00:00'),
(8, 'challenge', '🧮', '完成数学练习题', '认真完成10道数学题', 6, '20分钟', 1, '2025-11-15 08:00:00'),
(9, 'daily', '🦷', '早晚刷牙', '保护牙齿健康', 1, '5分钟', 1, '2025-11-15 08:00:00'),
(10, 'housework', '🗑️', '倒垃圾', '帮忙把垃圾拿到楼下', 3, '5分钟', 1, '2025-11-15 08:00:00');

-- ============================================
-- 3. 插入默认奖励（对应前端 mockData/rewards.json）
-- ============================================
INSERT INTO `reward` (`id`, `title`, `cost`, `icon`, `type`, `is_active`, `created_at`) VALUES
(1, '看30分钟电视', 10, '📺', 'virtual', 1, '2025-11-15 08:00:00'),
(2, '周末去游乐场', 50, '🎡', 'physical', 1, '2025-11-15 08:00:00'),
(3, '晚睡30分钟', 15, '🌙', 'virtual', 1, '2025-11-15 08:00:00'),
(4, '买喜欢的玩具', 100, '🧸', 'physical', 1, '2025-11-15 08:00:00'),
(5, '一起做烘焙', 30, '🍰', 'physical', 1, '2025-11-15 08:00:00'),
(6, '解锁彩虹头像框', 20, '🌈', 'virtual', 1, '2025-11-15 08:00:00'),
(7, '选择周末活动', 25, '🎯', 'virtual', 1, '2025-11-15 08:00:00'),
(8, '爸爸妈妈陪玩1小时', 40, '❤️', 'physical', 1, '2025-11-15 08:00:00');

-- ============================================
-- 4. 插入示例任务记录
-- ============================================
-- 已完成的任务（本周）
INSERT INTO `task_record` (`task_id`, `child_id`, `status`, `reward`, `received_at`, `completed_at`, `parent_liked_at`) VALUES
(1, 1, 'completed', 3, '2025-11-16 07:00:00', '2025-11-16 07:30:00', '2025-11-16 08:00:00'),
(3, 1, 'completed', 5, '2025-11-16 08:00:00', '2025-11-16 08:35:00', NULL),
(9, 1, 'completed', 1, '2025-11-16 07:00:00', '2025-11-16 07:05:00', '2025-11-16 09:00:00'),
(6, 1, 'completed', 2, '2025-11-15 07:00:00', '2025-11-15 07:10:00', '2025-11-15 08:00:00'),
(4, 1, 'completed', 2, '2025-11-15 12:00:00', '2025-11-15 12:30:00', NULL);

-- 已领取未完成的任务
INSERT INTO `task_record` (`task_id`, `child_id`, `status`, `reward`, `received_at`, `completed_at`) VALUES
(2, 1, 'received', 10, '2025-11-16 09:00:00', NULL),
(5, 1, 'received', 8, '2025-11-16 09:30:00', NULL);

-- ============================================
-- 5. 插入积分历史记录
-- ============================================
-- 任务完成获得积分
INSERT INTO `point_history` (`child_id`, `change`, `reason`, `source_type`, `source_id`, `created_at`) VALUES
(1, 3, '完成任务：整理房间', 'task', 1, '2025-11-16 07:30:00'),
(1, 5, '完成任务：阅读30分钟', 'task', 2, '2025-11-16 08:35:00'),
(1, 1, '完成任务：早晚刷牙', 'task', 3, '2025-11-16 07:05:00'),
(1, 2, '完成任务：自己叠被子', 'task', 4, '2025-11-15 07:10:00'),
(1, 2, '完成任务：吃完所有蔬菜', 'task', 5, '2025-11-15 12:30:00');

-- 每周发放积分（示例）
INSERT INTO `point_history` (`child_id`, `change`, `reason`, `source_type`, `source_id`, `created_at`) VALUES
(1, 20, '每周固定发放', 'weekly', NULL, '2025-11-11 09:00:00');

-- 家长手动调整（示例）
INSERT INTO `point_history` (`child_id`, `change`, `reason`, `source_type`, `source_id`, `created_at`) VALUES
(1, 5, '主动帮助妹妹，额外奖励', 'adjustment', NULL, '2025-11-14 18:00:00');

-- ============================================
-- 6. 插入兑换记录（示例）
-- ============================================
INSERT INTO `reward_record` (`reward_id`, `child_id`, `cost`, `created_at`) VALUES
(1, 1, 10, '2025-11-14 19:00:00'),
(3, 1, 15, '2025-11-13 20:00:00');

-- 兑换扣减积分记录
INSERT INTO `point_history` (`child_id`, `change`, `reason`, `source_type`, `source_id`, `created_at`) VALUES
(1, -10, '兑换奖励：看30分钟电视', 'reward', 1, '2025-11-14 19:00:00'),
(1, -15, '兑换奖励：晚睡30分钟', 'reward', 2, '2025-11-13 20:00:00');

-- ============================================
-- 7. 插入每周配置（示例）
-- ============================================
INSERT INTO `weekly_point_config` (`child_id`, `weekly_amount`, `day_of_week`, `time`, `enabled`, `last_sent_at`) VALUES
(1, 20, 1, '09:00', 1, '2025-11-11 09:00:00');

-- ============================================
-- 8. 验证数据
-- ============================================
-- 查看各表数据量
SELECT 'user' AS '表名', COUNT(*) AS '记录数' FROM user
UNION ALL
SELECT 'task', COUNT(*) FROM task
UNION ALL
SELECT 'task_record', COUNT(*) FROM task_record
UNION ALL
SELECT 'reward', COUNT(*) FROM reward
UNION ALL
SELECT 'reward_record', COUNT(*) FROM reward_record
UNION ALL
SELECT 'point_history', COUNT(*) FROM point_history
UNION ALL
SELECT 'weekly_point_config', COUNT(*) FROM weekly_point_config;

-- 计算当前积分（应该为：20+5+3+5+1+2+2-10-15 = 13）
SELECT 
    child_id,
    SUM(`change`) AS current_points
FROM point_history
GROUP BY child_id;

-- ============================================
-- 数据插入完成
-- ============================================
SELECT '种子数据插入完成！' AS 'Status';
SELECT '测试用户：小明（child），小明妈妈（parent）' AS 'Users';
SELECT '家长密码：0000' AS 'Password';
SELECT '当前积分：13朵小红花' AS 'Points';

