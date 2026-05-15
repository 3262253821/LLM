CREATE DATABASE IF NOT EXISTS `dbllmchat`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `dbllmchat`;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(50) NOT NULL,
  `account` VARCHAR(50) NOT NULL,
  `username` VARCHAR(50) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `avatar` LONGTEXT NULL,
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_account` (`account`),
  UNIQUE KEY `uk_users_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `chat_states` (
  `user_id` VARCHAR(50) NOT NULL,
  `state_json` LONGTEXT NOT NULL,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_chat_states_user_id`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users` (`id`, `account`, `username`, `password_hash`, `avatar`, `created_at`)
VALUES
  (
    '1778833696337',
    '11230',
    '野原新之助',
    '$2b$10$yyONv2O4kLhbMQlTSSRllej7nUPU9qovFiFuLqSVyhjbupk2juCOC',
    '',
    '2026-05-15 08:28:16'
  ),
  (
    '1778835127707',
    '11231',
    '牢大',
    '$2b$10$/g6hd9DUoMN.HCH5VDDalu2d8.MuhKdf2OmJCGMo8xFaPZRVZX5vW',
    '',
    '2026-05-15 08:52:07'
  )
ON DUPLICATE KEY UPDATE
  `account` = VALUES(`account`),
  `username` = VALUES(`username`),
  `password_hash` = VALUES(`password_hash`),
  `avatar` = VALUES(`avatar`),
  `created_at` = VALUES(`created_at`);

INSERT INTO `chat_states` (`user_id`, `state_json`)
VALUES
  (
    '1778833696337',
    '{\"sessions\":[{\"id\":1,\"title\":\"默认会话\"},{\"id\":2,\"title\":\"Vue 组件通信\"}],\"activeSessionId\":1,\"messagesBySession\":{\"1\":[{\"id\":1,\"role\":\"assistant\",\"content\":\"你好，我是天才程序员(gpt大人)^_^。\",\"time\":\"16:48:41\"}],\"2\":[{\"id\":1,\"role\":\"user\",\"content\":\"我是你爹。\",\"time\":\"16:48:41\"}]},\"systemPrompt\":\"\",\"temperature\":1,\"model\":\"deepseek-v4-flash\"}'
  ),
  (
    '1778835127707',
    '{\"sessions\":[{\"id\":1,\"title\":\"默认会话\"},{\"id\":2,\"title\":\"Vue 组件通信\"}],\"activeSessionId\":1,\"messagesBySession\":{\"1\":[{\"id\":1,\"role\":\"assistant\",\"content\":\"你好，我是天才程序员(gpt大人)^_^。\",\"time\":\"16:52:07\"}],\"2\":[{\"id\":1,\"role\":\"user\",\"content\":\"我是你爹。\",\"time\":\"16:52:07\"}]},\"systemPrompt\":\"\",\"temperature\":1,\"model\":\"deepseek-v4-flash\"}'
  )
ON DUPLICATE KEY UPDATE
  `state_json` = VALUES(`state_json`),
  `updated_at` = CURRENT_TIMESTAMP;
