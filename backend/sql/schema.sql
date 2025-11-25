-- 小红花数据库建表脚本
-- 数据库: xiaohonghua
-- 字符集: utf8mb4
-- 创建时间: 2025-11-16

-- 如果数据库不存在则创建
CREATE DATABASE IF NOT EXISTS xiaohonghua DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE xiaohonghua;

-- ============================================
-- 表1: user (用户表)
-- ============================================
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `openid` VARCHAR(64) UNIQUE COMMENT '微信openid',
  `union_id` VARCHAR(64) COMMENT '微信unionid',
  `role` ENUM('child', 'parent') DEFAULT 'child' COMMENT '角色：child-孩子, parent-家长',
  `parent_password` VARCHAR(255) COMMENT '家长密码（BCrypt加密）',
  `nickname` VARCHAR(64) COMMENT '昵称',
  `avatar_url` VARCHAR(255) COMMENT '头像URL',
  `child_id` BIGINT COMMENT '家长关联的孩子ID（仅家长角色使用）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_openid (`openid`),
  INDEX idx_role (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- ============================================
-- 表2: task (任务表)
-- ============================================
DROP TABLE IF EXISTS `task`;
CREATE TABLE `task` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `type` ENUM('daily', 'challenge', 'housework') DEFAULT 'daily' COMMENT '任务类型：daily-每日任务, challenge-挑战任务, housework-家务任务',
  `icon` VARCHAR(128) COMMENT '图标（emoji或图标名称）',
  `title` VARCHAR(128) NOT NULL COMMENT '任务标题',
  `description` TEXT COMMENT '任务描述',
  `reward` INT DEFAULT 0 COMMENT '奖励积分（小红花数量）',
  `time_estimate` VARCHAR(32) COMMENT '预计时长（如"5分钟"、"30分钟"）',
  `created_by_parent_id` BIGINT COMMENT '创建者家长ID（NULL表示系统默认任务）',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否激活（1-激活，0-已删除/停用）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_type (`type`),
  INDEX idx_active (`is_active`),
  INDEX idx_created_by (`created_by_parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务表';

-- ============================================
-- 表3: task_record (任务记录表)
-- ============================================
DROP TABLE IF EXISTS `task_record`;
CREATE TABLE `task_record` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `task_id` BIGINT NOT NULL COMMENT '任务ID',
  `child_id` BIGINT NOT NULL COMMENT '孩子ID',
  `status` ENUM('received', 'completed') DEFAULT 'received' COMMENT '状态：received-已领取, completed-已完成',
  `reward` INT DEFAULT 0 COMMENT '获得的积分（小红花数量）',
  `received_at` DATETIME COMMENT '领取时间',
  `completed_at` DATETIME COMMENT '完成时间',
  `parent_liked_at` DATETIME COMMENT '家长点赞时间（NULL表示未点赞）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_child_id (`child_id`),
  INDEX idx_task_id (`task_id`),
  INDEX idx_status (`status`),
  INDEX idx_completed_at (`completed_at`),
  INDEX idx_parent_liked (`parent_liked_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务记录表';

-- ============================================
-- 表4: reward (奖励表)
-- ============================================
DROP TABLE IF EXISTS `reward`;
CREATE TABLE `reward` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `title` VARCHAR(128) NOT NULL COMMENT '奖励标题',
  `cost` INT NOT NULL COMMENT '消耗积分（小红花数量）',
  `icon` VARCHAR(128) COMMENT '图标（emoji或图标名称）',
  `type` ENUM('virtual', 'physical') DEFAULT 'virtual' COMMENT '类型：virtual-虚拟奖励, physical-实物奖励',
  `is_active` TINYINT(1) DEFAULT 1 COMMENT '是否激活（1-激活，0-已删除/停用）',
  `created_by_parent_id` BIGINT COMMENT '创建者家长ID（NULL表示系统默认奖励）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_active (`is_active`),
  INDEX idx_type (`type`),
  INDEX idx_created_by (`created_by_parent_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='奖励表';

-- ============================================
-- 表5: reward_record (兑换记录表)
-- ============================================
DROP TABLE IF EXISTS `reward_record`;
CREATE TABLE `reward_record` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `reward_id` BIGINT NOT NULL COMMENT '奖励ID',
  `child_id` BIGINT NOT NULL COMMENT '孩子ID',
  `cost` INT NOT NULL COMMENT '消耗的积分（小红花数量）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '兑换时间',
  INDEX idx_child_id (`child_id`),
  INDEX idx_reward_id (`reward_id`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='兑换记录表';

-- ============================================
-- 表6: weekly_point_config (每周积分配置表)
-- ============================================
DROP TABLE IF EXISTS `weekly_point_config`;
CREATE TABLE `weekly_point_config` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `child_id` BIGINT UNIQUE NOT NULL COMMENT '孩子ID（唯一，一个孩子一条配置）',
  `weekly_amount` INT DEFAULT 0 COMMENT '每周发放积分数量',
  `day_of_week` TINYINT COMMENT '发放星期（1-7，1表示周一，7表示周日）',
  `time` VARCHAR(5) COMMENT '发放时间（HH:mm格式，如"09:00"）',
  `enabled` TINYINT(1) DEFAULT 0 COMMENT '是否启用（1-启用，0-停用）',
  `last_sent_at` DATETIME COMMENT '上次发放时间（用于防重复发放）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_child_id (`child_id`),
  INDEX idx_enabled (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='每周积分配置表';

-- ============================================
-- 表7: point_history (积分历史表)
-- ============================================
DROP TABLE IF EXISTS `point_history`;
CREATE TABLE `point_history` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
  `child_id` BIGINT NOT NULL COMMENT '孩子ID',
  `change` INT NOT NULL COMMENT '积分变化（正数表示增加，负数表示扣减）',
  `reason` VARCHAR(255) COMMENT '原因说明',
  `source_type` ENUM('task', 'reward', 'adjustment', 'weekly') COMMENT '来源类型：task-任务, reward-兑换, adjustment-手动调整, weekly-每周发放',
  `source_id` BIGINT COMMENT '来源ID（task_record.id 或 reward_record.id，手动调整时为NULL）',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_child_id (`child_id`),
  INDEX idx_source (`source_type`, `source_id`),
  INDEX idx_created_at (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='积分历史表';

-- ============================================
-- 创建完成提示
-- ============================================
SELECT '数据库表创建完成！共创建7张表：user, task, task_record, reward, reward_record, weekly_point_config, point_history' AS 'Status';

