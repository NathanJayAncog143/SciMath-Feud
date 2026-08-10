USE `scimath`;

DROP PROCEDURE IF EXISTS `sp_get_teams`;
DROP PROCEDURE IF EXISTS `sp_get_all_game_sets`;
DROP PROCEDURE IF EXISTS `sp_get_game_set_by_code`;
DROP PROCEDURE IF EXISTS `sp_get_questions`;
DROP PROCEDURE IF EXISTS `sp_create_game_set`;
DROP PROCEDURE IF EXISTS `sp_create_question`;
DROP PROCEDURE IF EXISTS `sp_create_answer`;
DROP PROCEDURE IF EXISTS `sp_create_game`;
DROP PROCEDURE IF EXISTS `sp_create_game_with_custom_names`;
DROP PROCEDURE IF EXISTS `sp_get_game_by_id`;
DROP PROCEDURE IF EXISTS `sp_get_latest_game_by_game_set`;
DROP PROCEDURE IF EXISTS `sp_update_game`;
DROP PROCEDURE IF EXISTS `sp_finish_game`;
DROP PROCEDURE IF EXISTS `sp_add_team_strike`;
DROP PROCEDURE IF EXISTS `sp_reveal_answer`;
DROP PROCEDURE IF EXISTS `sp_get_revealed_answers`;

CREATE TABLE IF NOT EXISTS `sf_teams` (
  `id` CHAR(36) NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `color` VARCHAR(50) NOT NULL DEFAULT 'blue',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_teams_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sf_game_sets` (
  `id` CHAR(36) NOT NULL,
  `code` VARCHAR(20) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` VARCHAR(100) NULL,
  `is_active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_game_sets_code` (`code`),
  KEY `idx_game_sets_active_created` (`is_active`, `created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sf_questions` (
  `id` CHAR(36) NOT NULL,
  `game_set_id` CHAR(36) NOT NULL,
  `question` TEXT NOT NULL,
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_questions_game_set_order` (`game_set_id`, `order_index`),
  CONSTRAINT `fk_sf_questions_game_sets`
    FOREIGN KEY (`game_set_id`) REFERENCES `sf_game_sets` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sf_answers` (
  `id` CHAR(36) NOT NULL,
  `question_id` CHAR(36) NOT NULL,
  `text` VARCHAR(200) NOT NULL,
  `points` INT NOT NULL DEFAULT 0,
  `order_index` INT NOT NULL DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_answers_question_order` (`question_id`, `order_index`),
  CONSTRAINT `fk_sf_answers_questions`
    FOREIGN KEY (`question_id`) REFERENCES `sf_questions` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sf_games` (
  `id` CHAR(36) NOT NULL,
  `game_set_id` CHAR(36) NOT NULL,
  `team1_id` CHAR(36) NULL,
  `team2_id` CHAR(36) NULL,
  `team3_id` CHAR(36) NULL,
  `team4_id` CHAR(36) NULL,
  `team5_id` CHAR(36) NULL,
  `team1_custom_name` VARCHAR(100) NULL,
  `team2_custom_name` VARCHAR(100) NULL,
  `team3_custom_name` VARCHAR(100) NULL,
  `team4_custom_name` VARCHAR(100) NULL,
  `team5_custom_name` VARCHAR(100) NULL,
  `team1_score` INT NOT NULL DEFAULT 0,
  `team2_score` INT NOT NULL DEFAULT 0,
  `team3_score` INT NOT NULL DEFAULT 0,
  `team4_score` INT NOT NULL DEFAULT 0,
  `team5_score` INT NOT NULL DEFAULT 0,
  `team1_strikes` INT NOT NULL DEFAULT 0,
  `team2_strikes` INT NOT NULL DEFAULT 0,
  `team3_strikes` INT NOT NULL DEFAULT 0,
  `team4_strikes` INT NOT NULL DEFAULT 0,
  `team5_strikes` INT NOT NULL DEFAULT 0,
  `current_question_index` INT NOT NULL DEFAULT 0,
  `strikes` INT NOT NULL DEFAULT 0,
  `show_strike_animation_at` DATETIME NULL,
  `play_intense_sound_at` DATETIME NULL,
  `play_winning_sound_at` DATETIME NULL,
  `stop_sounds_at` DATETIME NULL,
  `game_status` ENUM('waiting', 'playing', 'paused', 'finished') NOT NULL DEFAULT 'waiting',
  `started_at` DATETIME NULL,
  `finished_at` DATETIME NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_games_game_set_created` (`game_set_id`, `created_at`),
  KEY `idx_games_status` (`game_status`),
  CONSTRAINT `fk_sf_games_game_sets`
    FOREIGN KEY (`game_set_id`) REFERENCES `sf_game_sets` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team1` FOREIGN KEY (`team1_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team2` FOREIGN KEY (`team2_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team3` FOREIGN KEY (`team3_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team4` FOREIGN KEY (`team4_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team5` FOREIGN KEY (`team5_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `sf_game_answers` (
  `id` CHAR(36) NOT NULL,
  `game_id` CHAR(36) NOT NULL,
  `answer_id` CHAR(36) NOT NULL,
  `revealed_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revealed_by_team` INT NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_game_answers_game_answer` (`game_id`, `answer_id`),
  KEY `idx_game_answers_game` (`game_id`),
  CONSTRAINT `fk_sf_game_answers_games`
    FOREIGN KEY (`game_id`) REFERENCES `sf_games` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_game_answers_answers`
    FOREIGN KEY (`answer_id`) REFERENCES `sf_answers` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELIMITER $$

CREATE PROCEDURE `sp_get_teams`()
BEGIN
  SELECT * FROM `sf_teams` ORDER BY `name`;
END$$

CREATE PROCEDURE `sp_get_all_game_sets`()
BEGIN
  SELECT *
  FROM `sf_game_sets`
  WHERE `is_active` = 1
  ORDER BY `created_at` DESC;
END$$

CREATE PROCEDURE `sp_get_game_set_by_code`(IN p_code VARCHAR(20))
BEGIN
  SELECT *
  FROM `sf_game_sets`
  WHERE LOWER(`code`) = LOWER(p_code)
    AND `is_active` = 1
  LIMIT 1;

  SELECT
    q.`id` AS `question_id`,
    q.`game_set_id`,
    q.`question`,
    q.`order_index` AS `question_order_index`,
    q.`created_at` AS `question_created_at`,
    a.`id` AS `answer_id`,
    a.`text` AS `answer_text`,
    a.`points`,
    a.`order_index` AS `answer_order_index`,
    a.`created_at` AS `answer_created_at`
  FROM `sf_questions` q
  JOIN `sf_game_sets` gs ON gs.`id` = q.`game_set_id`
  LEFT JOIN `sf_answers` a ON a.`question_id` = q.`id`
  WHERE LOWER(gs.`code`) = LOWER(p_code)
    AND gs.`is_active` = 1
  ORDER BY q.`order_index`, q.`created_at`, a.`order_index`, a.`points` DESC;
END$$

CREATE PROCEDURE `sp_get_questions`()
BEGIN
  SELECT
    q.`id` AS `question_id`,
    q.`game_set_id`,
    q.`question`,
    q.`order_index` AS `question_order_index`,
    q.`created_at` AS `question_created_at`,
    a.`id` AS `answer_id`,
    a.`text` AS `answer_text`,
    a.`points`,
    a.`order_index` AS `answer_order_index`,
    a.`created_at` AS `answer_created_at`
  FROM `sf_questions` q
  LEFT JOIN `sf_answers` a ON a.`question_id` = q.`id`
  JOIN `sf_game_sets` gs ON gs.`id` = q.`game_set_id`
  WHERE gs.`is_active` = 1
  ORDER BY gs.`created_at` DESC, q.`order_index`, a.`order_index`;
END$$

CREATE PROCEDURE `sp_create_game_set`(
  IN p_code VARCHAR(20),
  IN p_title VARCHAR(200),
  IN p_description TEXT
)
BEGIN
  DECLARE v_id CHAR(36);
  SET v_id = UUID();

  INSERT INTO `sf_game_sets` (`id`, `code`, `title`, `description`, `is_active`)
  VALUES (v_id, UPPER(p_code), p_title, p_description, 1);

  SELECT * FROM `sf_game_sets` WHERE `id` = v_id;
END$$

CREATE PROCEDURE `sp_create_question`(
  IN p_game_set_id CHAR(36),
  IN p_question TEXT,
  IN p_order_index INT
)
BEGIN
  DECLARE v_id CHAR(36);
  SET v_id = UUID();

  INSERT INTO `sf_questions` (`id`, `game_set_id`, `question`, `order_index`)
  VALUES (v_id, p_game_set_id, p_question, p_order_index);

  SELECT * FROM `sf_questions` WHERE `id` = v_id;
END$$

CREATE PROCEDURE `sp_create_answer`(
  IN p_question_id CHAR(36),
  IN p_text VARCHAR(200),
  IN p_points INT,
  IN p_order_index INT
)
BEGIN
  INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
  VALUES (UUID(), p_question_id, p_text, p_points, p_order_index);
END$$

CREATE PROCEDURE `sp_create_game`(
  IN p_game_set_id CHAR(36),
  IN p_team1_id CHAR(36),
  IN p_team2_id CHAR(36),
  IN p_team3_id CHAR(36),
  IN p_team4_id CHAR(36),
  IN p_team5_id CHAR(36)
)
BEGIN
  DECLARE v_id CHAR(36);
  SET v_id = UUID();

  INSERT INTO `sf_games` (`id`, `game_set_id`, `team1_id`, `team2_id`, `team3_id`, `team4_id`, `team5_id`, `game_status`)
  VALUES (v_id, p_game_set_id, p_team1_id, p_team2_id, p_team3_id, p_team4_id, p_team5_id, 'waiting');

  CALL `sp_get_game_by_id`(v_id);
END$$

CREATE PROCEDURE `sp_create_game_with_custom_names`(
  IN p_game_set_id CHAR(36),
  IN p_team1_custom_name VARCHAR(100),
  IN p_team2_custom_name VARCHAR(100),
  IN p_team3_custom_name VARCHAR(100),
  IN p_team4_custom_name VARCHAR(100),
  IN p_team5_custom_name VARCHAR(100)
)
BEGIN
  DECLARE v_id CHAR(36);
  SET v_id = UUID();

  INSERT INTO `sf_games` (
    `id`, `game_set_id`,
    `team1_custom_name`, `team2_custom_name`, `team3_custom_name`, `team4_custom_name`, `team5_custom_name`,
    `game_status`
  )
  VALUES (
    v_id, p_game_set_id,
    p_team1_custom_name, p_team2_custom_name, p_team3_custom_name, p_team4_custom_name, p_team5_custom_name,
    'waiting'
  );

  CALL `sp_get_game_by_id`(v_id);
END$$

CREATE PROCEDURE `sp_get_game_by_id`(IN p_id CHAR(36))
BEGIN
  SELECT
    g.*,
    t1.`name` AS `team1_name`, t1.`color` AS `team1_color`,
    t2.`name` AS `team2_name`, t2.`color` AS `team2_color`,
    t3.`name` AS `team3_name`, t3.`color` AS `team3_color`,
    t4.`name` AS `team4_name`, t4.`color` AS `team4_color`,
    t5.`name` AS `team5_name`, t5.`color` AS `team5_color`
  FROM `sf_games` g
  LEFT JOIN `sf_teams` t1 ON t1.`id` = g.`team1_id`
  LEFT JOIN `sf_teams` t2 ON t2.`id` = g.`team2_id`
  LEFT JOIN `sf_teams` t3 ON t3.`id` = g.`team3_id`
  LEFT JOIN `sf_teams` t4 ON t4.`id` = g.`team4_id`
  LEFT JOIN `sf_teams` t5 ON t5.`id` = g.`team5_id`
  WHERE g.`id` = p_id
  LIMIT 1;
END$$

CREATE PROCEDURE `sp_get_latest_game_by_game_set`(IN p_game_set_id CHAR(36))
BEGIN
  SELECT *
  FROM `sf_games`
  WHERE `game_set_id` = p_game_set_id
  ORDER BY `created_at` DESC
  LIMIT 1;
END$$

CREATE PROCEDURE `sp_update_game`(
  IN p_id CHAR(36),
  IN p_team1_score INT,
  IN p_team2_score INT,
  IN p_team3_score INT,
  IN p_team4_score INT,
  IN p_team5_score INT,
  IN p_team1_strikes INT,
  IN p_team2_strikes INT,
  IN p_team3_strikes INT,
  IN p_team4_strikes INT,
  IN p_team5_strikes INT,
  IN p_current_question_index INT,
  IN p_strikes INT,
  IN p_game_status VARCHAR(20),
  IN p_show_strike_animation_at DATETIME,
  IN p_play_intense_sound_at DATETIME,
  IN p_play_winning_sound_at DATETIME,
  IN p_stop_sounds_at DATETIME,
  IN p_started_at DATETIME
)
BEGIN
  UPDATE `sf_games`
  SET
    `team1_score` = COALESCE(p_team1_score, `team1_score`),
    `team2_score` = COALESCE(p_team2_score, `team2_score`),
    `team3_score` = COALESCE(p_team3_score, `team3_score`),
    `team4_score` = COALESCE(p_team4_score, `team4_score`),
    `team5_score` = COALESCE(p_team5_score, `team5_score`),
    `team1_strikes` = COALESCE(p_team1_strikes, `team1_strikes`),
    `team2_strikes` = COALESCE(p_team2_strikes, `team2_strikes`),
    `team3_strikes` = COALESCE(p_team3_strikes, `team3_strikes`),
    `team4_strikes` = COALESCE(p_team4_strikes, `team4_strikes`),
    `team5_strikes` = COALESCE(p_team5_strikes, `team5_strikes`),
    `current_question_index` = COALESCE(p_current_question_index, `current_question_index`),
    `strikes` = COALESCE(p_strikes, `strikes`),
    `game_status` = COALESCE(p_game_status, `game_status`),
    `show_strike_animation_at` = p_show_strike_animation_at,
    `play_intense_sound_at` = p_play_intense_sound_at,
    `play_winning_sound_at` = p_play_winning_sound_at,
    `stop_sounds_at` = p_stop_sounds_at,
    `started_at` = COALESCE(p_started_at, `started_at`)
  WHERE `id` = p_id;
END$$

CREATE PROCEDURE `sp_finish_game`(IN p_id CHAR(36))
BEGIN
  UPDATE `sf_games`
  SET `finished_at` = COALESCE(`finished_at`, CURRENT_TIMESTAMP)
  WHERE `id` = p_id;
END$$

CREATE PROCEDURE `sp_add_team_strike`(
  IN p_game_id CHAR(36),
  IN p_team_id INT
)
BEGIN
  UPDATE `sf_games`
  SET
    `team1_strikes` = CASE WHEN p_team_id = 1 THEN `team1_strikes` + 1 ELSE `team1_strikes` END,
    `team2_strikes` = CASE WHEN p_team_id = 2 THEN `team2_strikes` + 1 ELSE `team2_strikes` END,
    `team3_strikes` = CASE WHEN p_team_id = 3 THEN `team3_strikes` + 1 ELSE `team3_strikes` END,
    `team4_strikes` = CASE WHEN p_team_id = 4 THEN `team4_strikes` + 1 ELSE `team4_strikes` END,
    `team5_strikes` = CASE WHEN p_team_id = 5 THEN `team5_strikes` + 1 ELSE `team5_strikes` END
  WHERE `id` = p_game_id
    AND p_team_id BETWEEN 1 AND 5;

  CALL `sp_get_game_by_id`(p_game_id);
END$$

CREATE PROCEDURE `sp_reveal_answer`(
  IN p_game_id CHAR(36),
  IN p_answer_id CHAR(36),
  IN p_revealed_by_team INT
)
BEGIN
  INSERT IGNORE INTO `sf_game_answers` (`id`, `game_id`, `answer_id`, `revealed_by_team`)
  VALUES (UUID(), p_game_id, p_answer_id, p_revealed_by_team);

  SELECT *
  FROM `sf_game_answers`
  WHERE `game_id` = p_game_id
    AND `answer_id` = p_answer_id
  LIMIT 1;
END$$

CREATE PROCEDURE `sp_get_revealed_answers`(IN p_game_id CHAR(36))
BEGIN
  SELECT `answer_id`
  FROM `sf_game_answers`
  WHERE `game_id` = p_game_id
  ORDER BY `revealed_at`;
END$$

DELIMITER ;

INSERT INTO `sf_teams` (`id`, `name`, `color`)
SELECT UUID(), 'Team Red', 'red'
WHERE NOT EXISTS (SELECT 1 FROM `sf_teams` WHERE `name` = 'Team Red');

INSERT INTO `sf_teams` (`id`, `name`, `color`)
SELECT UUID(), 'Team Blue', 'blue'
WHERE NOT EXISTS (SELECT 1 FROM `sf_teams` WHERE `name` = 'Team Blue');

INSERT INTO `sf_teams` (`id`, `name`, `color`)
SELECT UUID(), 'Team Green', 'green'
WHERE NOT EXISTS (SELECT 1 FROM `sf_teams` WHERE `name` = 'Team Green');

INSERT INTO `sf_teams` (`id`, `name`, `color`)
SELECT UUID(), 'Team Yellow', 'yellow'
WHERE NOT EXISTS (SELECT 1 FROM `sf_teams` WHERE `name` = 'Team Yellow');

INSERT INTO `sf_teams` (`id`, `name`, `color`)
SELECT UUID(), 'Team Purple', 'purple'
WHERE NOT EXISTS (SELECT 1 FROM `sf_teams` WHERE `name` = 'Team Purple');

SET @demo_game_set_id = COALESCE((SELECT `id` FROM `sf_game_sets` WHERE `code` = 'DEMO001' LIMIT 1), UUID());
INSERT INTO `sf_game_sets` (`id`, `code`, `title`, `description`, `is_active`)
SELECT @demo_game_set_id, 'DEMO001', 'Demo Family Feud Game', 'A demonstration game with sample questions', 1
WHERE NOT EXISTS (SELECT 1 FROM `sf_game_sets` WHERE `code` = 'DEMO001');

SET @question1_id = COALESCE((SELECT `id` FROM `sf_questions` WHERE `game_set_id` = @demo_game_set_id AND `order_index` = 1 LIMIT 1), UUID());
INSERT INTO `sf_questions` (`id`, `game_set_id`, `question`, `order_index`)
SELECT @question1_id, @demo_game_set_id, 'Name something you might find in a kitchen', 1
WHERE NOT EXISTS (SELECT 1 FROM `sf_questions` WHERE `id` = @question1_id);

INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question1_id, 'Refrigerator', 32, 1 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question1_id AND `text` = 'Refrigerator');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question1_id, 'Stove', 28, 2 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question1_id AND `text` = 'Stove');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question1_id, 'Sink', 15, 3 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question1_id AND `text` = 'Sink');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question1_id, 'Microwave', 12, 4 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question1_id AND `text` = 'Microwave');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question1_id, 'Table', 8, 5 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question1_id AND `text` = 'Table');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question1_id, 'Dishes', 5, 6 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question1_id AND `text` = 'Dishes');

SET @question2_id = COALESCE((SELECT `id` FROM `sf_questions` WHERE `game_set_id` = @demo_game_set_id AND `order_index` = 2 LIMIT 1), UUID());
INSERT INTO `sf_questions` (`id`, `game_set_id`, `question`, `order_index`)
SELECT @question2_id, @demo_game_set_id, 'Name a popular vacation destination', 2
WHERE NOT EXISTS (SELECT 1 FROM `sf_questions` WHERE `id` = @question2_id);

INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question2_id, 'Hawaii', 35, 1 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question2_id AND `text` = 'Hawaii');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question2_id, 'Florida', 25, 2 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question2_id AND `text` = 'Florida');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question2_id, 'California', 18, 3 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question2_id AND `text` = 'California');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question2_id, 'New York', 12, 4 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question2_id AND `text` = 'New York');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question2_id, 'Las Vegas', 7, 5 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question2_id AND `text` = 'Las Vegas');
INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
SELECT UUID(), @question2_id, 'Paris', 3, 6 WHERE NOT EXISTS (SELECT 1 FROM `sf_answers` WHERE `question_id` = @question2_id AND `text` = 'Paris');
