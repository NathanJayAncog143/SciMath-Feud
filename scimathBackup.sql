/*
SQLyog Ultimate v9.62 
MySQL - 5.7.43-log : Database - scimath
*********************************************************************
*/

/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
CREATE DATABASE /*!32312 IF NOT EXISTS*/`scimath` /*!40100 DEFAULT CHARACTER SET latin1 */;

USE `scimath`;

/*Table structure for table `answers` */

DROP TABLE IF EXISTS `answers`;

CREATE TABLE `answers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `question_id` int(10) unsigned NOT NULL,
  `answer` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int(10) unsigned NOT NULL DEFAULT '0',
  `sort_order` int(10) unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_answers_question_sort` (`question_id`,`sort_order`,`points`),
  CONSTRAINT `fk_answers_questions` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `answers` */

/*Table structure for table `game_state` */

DROP TABLE IF EXISTS `game_state`;

CREATE TABLE `game_state` (
  `id` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `state` json NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `game_state` */

insert  into `game_state`(`id`,`state`,`created_at`,`updated_at`) values ('main','{\"teams\": {\"team1\": {\"name\": \"Player 1\", \"score\": 0}, \"team2\": {\"name\": \"Player 2\", \"score\": 0}}, \"timer\": 45, \"fastMoney\": {\"questions\": [\"\", \"\", \"\", \"\", \"\"], \"totalScore\": 0, \"player1Score\": 0, \"player2Score\": 0, \"currentPlayer\": 1, \"player1Answers\": [{\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}, {\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}, {\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}, {\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}, {\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}], \"player2Answers\": [{\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}, {\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}, {\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}, {\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}, {\"answer\": \"\", \"points\": 0, \"question\": \"\", \"revealed\": false, \"showToAudience\": false}], \"showPlayer1Answers\": false}, \"gamePhase\": \"fastmoney\", \"soundEnabled\": true, \"timerRunning\": false}','2026-08-05 14:06:28','2026-08-05 14:37:31');

/*Table structure for table `questions` */

DROP TABLE IF EXISTS `questions`;

CREATE TABLE `questions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `question` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `round` int(10) unsigned NOT NULL DEFAULT '1',
  `sort_order` int(10) unsigned NOT NULL DEFAULT '0',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_questions_round_sort` (`round`,`sort_order`,`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `questions` */

insert  into `questions`(`id`,`question`,`round`,`sort_order`,`is_active`,`created_at`,`updated_at`) values (1,'bayot si allene?',1,1,1,'2026-08-05 14:34:41','2026-08-05 14:34:41');

/*Table structure for table `sf_answers` */

DROP TABLE IF EXISTS `sf_answers`;

CREATE TABLE `sf_answers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `text` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `points` int(11) NOT NULL DEFAULT '0',
  `order_index` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_answers_question_order` (`question_id`,`order_index`),
  CONSTRAINT `fk_sf_answers_questions` FOREIGN KEY (`question_id`) REFERENCES `sf_questions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `sf_answers` */

insert  into `sf_answers`(`id`,`question_id`,`text`,`points`,`order_index`,`created_at`) values ('2b0cdf82-945d-11f1-aca4-94bb43285cf3','2b09aaf9-945d-11f1-aca4-94bb43285cf3','banga',17,1,'2026-08-10 09:44:59'),('2b0d09c4-945d-11f1-aca4-94bb43285cf3','2b09aaf9-945d-11f1-aca4-94bb43285cf3','john',10,2,'2026-08-10 09:44:59'),('2b0d1ddd-945d-11f1-aca4-94bb43285cf3','2b09aaf9-945d-11f1-aca4-94bb43285cf3','angelo',9,3,'2026-08-10 09:44:59'),('2b0db464-945d-11f1-aca4-94bb43285cf3','2b0d45bf-945d-11f1-aca4-94bb43285cf3','NAtha',10,1,'2026-08-10 09:44:59'),('2b0dcb46-945d-11f1-aca4-94bb43285cf3','2b0d45bf-945d-11f1-aca4-94bb43285cf3','jay',7,2,'2026-08-10 09:44:59'),('2b0de295-945d-11f1-aca4-94bb43285cf3','2b0d45bf-945d-11f1-aca4-94bb43285cf3','ancog',7,3,'2026-08-10 09:44:59'),('2e2dec97-a746-11f1-aa1e-5a57a32df548','2e2c21e3-a746-11f1-aa1e-5a57a32df548','sdff',5,1,'2026-09-03 11:18:38'),('2e2e1b7f-a746-11f1-aa1e-5a57a32df548','2e2c21e3-a746-11f1-aa1e-5a57a32df548','dhdsh',6,2,'2026-09-03 11:18:38'),('2e2e34e6-a746-11f1-aa1e-5a57a32df548','2e2c21e3-a746-11f1-aa1e-5a57a32df548','dffdf',5,3,'2026-09-03 11:18:38'),('2e2e4b93-a746-11f1-aa1e-5a57a32df548','2e2c21e3-a746-11f1-aa1e-5a57a32df548','asadf',3,4,'2026-09-03 11:18:38'),('2e2e5fcd-a746-11f1-aa1e-5a57a32df548','2e2c21e3-a746-11f1-aa1e-5a57a32df548','sdfsf',15,5,'2026-09-03 11:18:38'),('38d5ecd2-9300-11f1-aca4-94bb43285cf3','38d40432-9300-11f1-aca4-94bb43285cf3','suck',10,1,'2026-08-08 16:07:14'),('38d6136a-9300-11f1-aca4-94bb43285cf3','38d40432-9300-11f1-aca4-94bb43285cf3','my ',5,2,'2026-08-08 16:07:14'),('38d62b01-9300-11f1-aca4-94bb43285cf3','38d40432-9300-11f1-aca4-94bb43285cf3','dick',0,3,'2026-08-08 16:07:14'),('3fa16312-ac0e-11f1-aa1e-5a57a32df548','3fa0ca23-ac0e-11f1-aa1e-5a57a32df548','sdsd',0,1,'2026-09-09 13:20:30'),('4c1d57b4-ac0b-11f1-aa1e-5a57a32df548','4c1c0b6f-ac0b-11f1-aa1e-5a57a32df548','werawerwae',14,1,'2026-09-09 12:59:22'),('52371ce5-945e-11f1-aca4-94bb43285cf3','5236572a-945e-11f1-aca4-94bb43285cf3','banga',17,1,'2026-08-10 09:53:15'),('52374ff7-945e-11f1-aca4-94bb43285cf3','5236572a-945e-11f1-aca4-94bb43285cf3','john',10,2,'2026-08-10 09:53:15'),('5237c497-945e-11f1-aca4-94bb43285cf3','5236572a-945e-11f1-aca4-94bb43285cf3','angelo',9,3,'2026-08-10 09:53:15'),('5237f457-945e-11f1-aca4-94bb43285cf3','5236572a-945e-11f1-aca4-94bb43285cf3','nathan',0,4,'2026-08-10 09:53:15'),('52381ea5-945e-11f1-aca4-94bb43285cf3','5236572a-945e-11f1-aca4-94bb43285cf3','Gino',0,5,'2026-08-10 09:53:15'),('52383ee4-945e-11f1-aca4-94bb43285cf3','5236572a-945e-11f1-aca4-94bb43285cf3','Allen',0,6,'2026-08-10 09:53:15'),('52389e59-945e-11f1-aca4-94bb43285cf3','5238730c-945e-11f1-aca4-94bb43285cf3','jhell jone',20,1,'2026-08-10 09:53:15'),('5238b633-945e-11f1-aca4-94bb43285cf3','5238730c-945e-11f1-aca4-94bb43285cf3','jay',7,2,'2026-08-10 09:53:15'),('5238d5b7-945e-11f1-aca4-94bb43285cf3','5238730c-945e-11f1-aca4-94bb43285cf3','ancog',7,3,'2026-08-10 09:53:15'),('5a2dd05d-9a04-11f1-aca4-94bb43285cf3','5a29ce96-9a04-11f1-aca4-94bb43285cf3','sdsdd',4,1,'2026-08-17 14:23:56'),('5a2e7348-9a04-11f1-aca4-94bb43285cf3','5a29ce96-9a04-11f1-aca4-94bb43285cf3','sdsd',2,2,'2026-08-17 14:23:56'),('5a2e976c-9a04-11f1-aca4-94bb43285cf3','5a29ce96-9a04-11f1-aca4-94bb43285cf3','sdd',1,3,'2026-08-17 14:23:56'),('6694bb97-ac19-11f1-aa1e-5a57a32df548','6694473b-ac19-11f1-aa1e-5a57a32df548','sdfsd',12,1,'2026-09-09 14:40:20'),('6b4e11b6-ac24-11f1-aa1e-5a57a32df548','6b4d1e58-ac24-11f1-aa1e-5a57a32df548','Iron Man',35,1,'2026-09-09 15:59:12'),('6b50648f-ac24-11f1-aa1e-5a57a32df548','6b4d1e58-ac24-11f1-aa1e-5a57a32df548','Spider-Man',25,2,'2026-09-09 15:59:12'),('6b50a9d7-ac24-11f1-aa1e-5a57a32df548','6b4d1e58-ac24-11f1-aa1e-5a57a32df548','Captain America',20,3,'2026-09-09 15:59:12'),('6b50dbd7-ac24-11f1-aa1e-5a57a32df548','6b4d1e58-ac24-11f1-aa1e-5a57a32df548','Thor',12,4,'2026-09-09 15:59:12'),('6b50eb67-ac24-11f1-aa1e-5a57a32df548','6b4d1e58-ac24-11f1-aa1e-5a57a32df548','Black Widow',5,5,'2026-09-09 15:59:12'),('6b50f9a1-ac24-11f1-aa1e-5a57a32df548','6b4d1e58-ac24-11f1-aa1e-5a57a32df548','Ant-Man',3,6,'2026-09-09 15:59:12'),('6b514fea-ac24-11f1-aa1e-5a57a32df548','6b510cf1-ac24-11f1-aa1e-5a57a32df548','Pera',30,1,'2026-09-09 15:59:12'),('6b51666d-ac24-11f1-aa1e-5a57a32df548','6b510cf1-ac24-11f1-aa1e-5a57a32df548','Cellphone',24,2,'2026-09-09 15:59:12'),('6b5181c5-ac24-11f1-aa1e-5a57a32df548','6b510cf1-ac24-11f1-aa1e-5a57a32df548','Balisong/pocketknife',18,3,'2026-09-09 15:59:12'),('6b5199d6-ac24-11f1-aa1e-5a57a32df548','6b510cf1-ac24-11f1-aa1e-5a57a32df548','Lighter',15,4,'2026-09-09 15:59:12'),('6b51a9d0-ac24-11f1-aa1e-5a57a32df548','6b510cf1-ac24-11f1-aa1e-5a57a32df548','ID',8,5,'2026-09-09 15:59:12'),('6b51b45c-ac24-11f1-aa1e-5a57a32df548','6b510cf1-ac24-11f1-aa1e-5a57a32df548','Chicle/mints',5,6,'2026-09-09 15:59:12'),('6b51cf40-ac24-11f1-aa1e-5a57a32df548','6b51bd1e-ac24-11f1-aa1e-5a57a32df548','Sobra sa dami ang tao (overpopulation)',32,1,'2026-09-09 15:59:12'),('6b51e32a-ac24-11f1-aa1e-5a57a32df548','6b51bd1e-ac24-11f1-aa1e-5a57a32df548','Limitado lang ang resources',22,2,'2026-09-09 15:59:12'),('6b536d8d-ac24-11f1-aa1e-5a57a32df548','6b51bd1e-ac24-11f1-aa1e-5a57a32df548','Kailangan ng balance',19,3,'2026-09-09 15:59:12'),('6b538443-ac24-11f1-aa1e-5a57a32df548','6b51bd1e-ac24-11f1-aa1e-5a57a32df548','Wala, mali siya',15,4,'2026-09-09 15:59:12'),('6b53b459-ac24-11f1-aa1e-5a57a32df548','6b51bd1e-ac24-11f1-aa1e-5a57a32df548','Nagdudusa na ang uniberso',8,5,'2026-09-09 15:59:12'),('6b53c5ea-ac24-11f1-aa1e-5a57a32df548','6b51bd1e-ac24-11f1-aa1e-5a57a32df548','Efficient ang plano niya',4,6,'2026-09-09 15:59:12'),('763ca8ad-acb9-11f1-976f-94bb43285cf3','763bf86e-acb9-11f1-976f-94bb43285cf3','Chair',40,1,'2026-09-10 09:46:37'),('763ce19a-acb9-11f1-976f-94bb43285cf3','763bf86e-acb9-11f1-976f-94bb43285cf3','Desk',30,2,'2026-09-10 09:46:37'),('763cf3a1-acb9-11f1-976f-94bb43285cf3','763bf86e-acb9-11f1-976f-94bb43285cf3','Board',20,3,'2026-09-10 09:46:37'),('763d0c27-acb9-11f1-976f-94bb43285cf3','763bf86e-acb9-11f1-976f-94bb43285cf3','Projector',10,4,'2026-09-10 09:46:37'),('763d2539-acb9-11f1-976f-94bb43285cf3','763bf86e-acb9-11f1-976f-94bb43285cf3','Book',5,5,'2026-09-10 09:46:37'),('763d38c5-acb9-11f1-976f-94bb43285cf3','763bf86e-acb9-11f1-976f-94bb43285cf3','Pencil',3,6,'2026-09-10 09:46:37'),('763d508b-acb9-11f1-976f-94bb43285cf3','763bf86e-acb9-11f1-976f-94bb43285cf3','Bag',2,7,'2026-09-10 09:46:37'),('763d675b-acb9-11f1-976f-94bb43285cf3','763bf86e-acb9-11f1-976f-94bb43285cf3','Clock',1,8,'2026-09-10 09:46:37'),('763d9cdb-acb9-11f1-976f-94bb43285cf3','763d77fc-acb9-11f1-976f-94bb43285cf3','Java',40,1,'2026-09-10 09:46:37'),('763dac98-acb9-11f1-976f-94bb43285cf3','763d77fc-acb9-11f1-976f-94bb43285cf3','Python',30,2,'2026-09-10 09:46:37'),('763dba2b-acb9-11f1-976f-94bb43285cf3','763d77fc-acb9-11f1-976f-94bb43285cf3','C++',20,3,'2026-09-10 09:46:37'),('763dc56a-acb9-11f1-976f-94bb43285cf3','763d77fc-acb9-11f1-976f-94bb43285cf3','JavaScript',10,4,'2026-09-10 09:46:37'),('763dd5c0-acb9-11f1-976f-94bb43285cf3','763d77fc-acb9-11f1-976f-94bb43285cf3','C#',5,5,'2026-09-10 09:46:37'),('7ada7c22-9a06-11f1-aca4-94bb43285cf3','7ad9ce47-9a06-11f1-aca4-94bb43285cf3','ananna',10,1,'2026-08-17 14:39:09'),('7ada9ed1-9a06-11f1-aca4-94bb43285cf3','7ad9ce47-9a06-11f1-aca4-94bb43285cf3','jjdjdjd',9,2,'2026-08-17 14:39:09'),('7adab9b2-9a06-11f1-aca4-94bb43285cf3','7ad9ce47-9a06-11f1-aca4-94bb43285cf3','sfswee',8,3,'2026-08-17 14:39:09'),('7adae6f9-9a06-11f1-aca4-94bb43285cf3','7ad9ce47-9a06-11f1-aca4-94bb43285cf3','ewe',7,4,'2026-08-17 14:39:09'),('80dbaae8-aa55-11f1-aa1e-5a57a32df548','80dae6dc-aa55-11f1-aa1e-5a57a32df548','sadfsaasd',17,1,'2026-09-07 08:45:39'),('80dbdc64-aa55-11f1-aa1e-5a57a32df548','80dae6dc-aa55-11f1-aa1e-5a57a32df548','asdfsdf',13,2,'2026-09-07 08:45:39'),('80dbfa3e-aa55-11f1-aa1e-5a57a32df548','80dae6dc-aa55-11f1-aa1e-5a57a32df548','sadfsda',14,3,'2026-09-07 08:45:39'),('95466dbc-aa5c-11f1-aa1e-5a57a32df548','95453d36-aa5c-11f1-aa1e-5a57a32df548','sdfwsdf',12,1,'2026-09-07 09:36:19'),('95469f51-aa5c-11f1-aa1e-5a57a32df548','95453d36-aa5c-11f1-aa1e-5a57a32df548','sdfsdfsdfsd',9,2,'2026-09-07 09:36:19'),('9546ae4d-aa5c-11f1-aa1e-5a57a32df548','95453d36-aa5c-11f1-aa1e-5a57a32df548','sdfsdfsdfsd',10,3,'2026-09-07 09:36:19'),('9546cafe-aa5c-11f1-aa1e-5a57a32df548','95453d36-aa5c-11f1-aa1e-5a57a32df548','sdfsdfsdfs',4,4,'2026-09-07 09:36:19'),('9546d5c9-aa5c-11f1-aa1e-5a57a32df548','95453d36-aa5c-11f1-aa1e-5a57a32df548','sdfasdfasdfasd',10,5,'2026-09-07 09:36:19'),('9546e0c1-aa5c-11f1-aa1e-5a57a32df548','95453d36-aa5c-11f1-aa1e-5a57a32df548','asdfasdfasdf',9,6,'2026-09-07 09:36:19'),('9546f1fa-aa5c-11f1-aa1e-5a57a32df548','95453d36-aa5c-11f1-aa1e-5a57a32df548','asdfasdcs',4,7,'2026-09-07 09:36:19'),('95472431-aa5c-11f1-aa1e-5a57a32df548','95453d36-aa5c-11f1-aa1e-5a57a32df548','SFDASDF',5,8,'2026-09-07 09:36:19'),('a2fa41f3-aa52-11f1-aa1e-5a57a32df548','a2f9f467-aa52-11f1-aa1e-5a57a32df548','zdsd',14,1,'2026-09-07 08:25:07'),('a2fbfe1c-aa52-11f1-aa1e-5a57a32df548','a2f9f467-aa52-11f1-aa1e-5a57a32df548','sdfsdf',11,2,'2026-09-07 08:25:07'),('a2fc0cb6-aa52-11f1-aa1e-5a57a32df548','a2f9f467-aa52-11f1-aa1e-5a57a32df548','sdf',6,3,'2026-09-07 08:25:07'),('a2fc1872-aa52-11f1-aa1e-5a57a32df548','a2f9f467-aa52-11f1-aa1e-5a57a32df548','sdf',3,4,'2026-09-07 08:25:07'),('a2fc2f3c-aa52-11f1-aa1e-5a57a32df548','a2f9f467-aa52-11f1-aa1e-5a57a32df548','sdfsd',7,5,'2026-09-07 08:25:07'),('a2fc407c-aa52-11f1-aa1e-5a57a32df548','a2f9f467-aa52-11f1-aa1e-5a57a32df548','sdfsd',7,6,'2026-09-07 08:25:07'),('a2fc4cfc-aa52-11f1-aa1e-5a57a32df548','a2f9f467-aa52-11f1-aa1e-5a57a32df548','sdf',7,7,'2026-09-07 08:25:07'),('a2fc5894-aa52-11f1-aa1e-5a57a32df548','a2f9f467-aa52-11f1-aa1e-5a57a32df548','sdfsd',1,8,'2026-09-07 08:25:07'),('b606c9ed-9a09-11f1-aca4-94bb43285cf3','b605ae52-9a09-11f1-aca4-94bb43285cf3','sdds',8,1,'2026-08-17 15:02:17'),('b607107e-9a09-11f1-aca4-94bb43285cf3','b605ae52-9a09-11f1-aca4-94bb43285cf3','gfgf',7,2,'2026-08-17 15:02:17'),('b607346f-9a09-11f1-aca4-94bb43285cf3','b605ae52-9a09-11f1-aca4-94bb43285cf3','hjhj',6,3,'2026-08-17 15:02:17'),('b6075b68-9a09-11f1-aca4-94bb43285cf3','b605ae52-9a09-11f1-aca4-94bb43285cf3','kllk',5,4,'2026-08-17 15:02:17'),('bc8bf44d-ac1c-11f1-aa1e-5a57a32df548','bc86986e-ac1c-11f1-aa1e-5a57a32df548','Swimming',34,1,'2026-09-09 15:04:13'),('bc8c3f44-ac1c-11f1-aa1e-5a57a32df548','bc86986e-ac1c-11f1-aa1e-5a57a32df548','Surfing',29,2,'2026-09-09 15:04:13'),('bc8c5f1b-ac1c-11f1-aa1e-5a57a32df548','bc86986e-ac1c-11f1-aa1e-5a57a32df548','Boating',14,3,'2026-09-09 15:04:13'),('bc8cf839-ac1c-11f1-aa1e-5a57a32df548','bc86986e-ac1c-11f1-aa1e-5a57a32df548','Jet Skiing',11,4,'2026-09-09 15:04:13'),('bc8d2ab6-ac1c-11f1-aa1e-5a57a32df548','bc86986e-ac1c-11f1-aa1e-5a57a32df548','Diving',9,5,'2026-09-09 15:04:13'),('bc8d616b-ac1c-11f1-aa1e-5a57a32df548','bc86986e-ac1c-11f1-aa1e-5a57a32df548','Water Polo',3,6,'2026-09-09 15:04:13'),('bc8e3c78-ac1c-11f1-aa1e-5a57a32df548','bc8d9b96-ac1c-11f1-aa1e-5a57a32df548','Computers',32,1,'2026-09-09 15:04:13'),('bc8f3408-ac1c-11f1-aa1e-5a57a32df548','bc8d9b96-ac1c-11f1-aa1e-5a57a32df548','Librarians',27,2,'2026-09-09 15:04:13'),('bc905529-ac1c-11f1-aa1e-5a57a32df548','bc8d9b96-ac1c-11f1-aa1e-5a57a32df548','Magazines',18,3,'2026-09-09 15:04:13'),('bc906c2c-ac1c-11f1-aa1e-5a57a32df548','bc8d9b96-ac1c-11f1-aa1e-5a57a32df548','News Paper',15,4,'2026-09-09 15:04:13'),('bc90b6de-ac1c-11f1-aa1e-5a57a32df548','bc8d9b96-ac1c-11f1-aa1e-5a57a32df548','Tables',0,5,'2026-09-09 15:04:13'),('bc90ed43-ac1c-11f1-aa1e-5a57a32df548','bc90cfeb-ac1c-11f1-aa1e-5a57a32df548','Lion / Tiger',29,1,'2026-09-09 15:04:13'),('bc90ff9c-ac1c-11f1-aa1e-5a57a32df548','bc90cfeb-ac1c-11f1-aa1e-5a57a32df548','Monkey',25,2,'2026-09-09 15:04:13'),('bc911281-ac1c-11f1-aa1e-5a57a32df548','bc90cfeb-ac1c-11f1-aa1e-5a57a32df548','Python / Snake',21,3,'2026-09-09 15:04:13'),('bc912801-ac1c-11f1-aa1e-5a57a32df548','bc90cfeb-ac1c-11f1-aa1e-5a57a32df548','Parrot',18,4,'2026-09-09 15:04:13'),('bc915df4-ac1c-11f1-aa1e-5a57a32df548','bc90cfeb-ac1c-11f1-aa1e-5a57a32df548','Foox',5,5,'2026-09-09 15:04:13'),('bc91a0cc-ac1c-11f1-aa1e-5a57a32df548','bc918180-ac1c-11f1-aa1e-5a57a32df548','Ear',33,1,'2026-09-09 15:04:13'),('bc91d020-ac1c-11f1-aa1e-5a57a32df548','bc918180-ac1c-11f1-aa1e-5a57a32df548','Eye',31,2,'2026-09-09 15:04:13'),('bc91e036-ac1c-11f1-aa1e-5a57a32df548','bc918180-ac1c-11f1-aa1e-5a57a32df548','Elbow ',25,3,'2026-09-09 15:04:13'),('bc91ed6e-ac1c-11f1-aa1e-5a57a32df548','bc918180-ac1c-11f1-aa1e-5a57a32df548','Esophagus',10,4,'2026-09-09 15:04:13'),('bc92182a-ac1c-11f1-aa1e-5a57a32df548','bc91fbf5-ac1c-11f1-aa1e-5a57a32df548','Nuts',29,1,'2026-09-09 15:04:13'),('bc9226a2-ac1c-11f1-aa1e-5a57a32df548','bc91fbf5-ac1c-11f1-aa1e-5a57a32df548','Sea Foods',27,2,'2026-09-09 15:04:13'),('bc923fa4-ac1c-11f1-aa1e-5a57a32df548','bc91fbf5-ac1c-11f1-aa1e-5a57a32df548','Dairy',19,3,'2026-09-09 15:04:13'),('bc9260ec-ac1c-11f1-aa1e-5a57a32df548','bc91fbf5-ac1c-11f1-aa1e-5a57a32df548','Wheat',0,4,'2026-09-09 15:04:13'),('bc92c62c-ac1c-11f1-aa1e-5a57a32df548','bc91fbf5-ac1c-11f1-aa1e-5a57a32df548','Soy',11,5,'2026-09-09 15:04:13'),('bd44ec78-9a98-11f1-aac1-306e96a67c7b','bd407d97-9a98-11f1-aac1-306e96a67c7b','fdgdg',6,1,'2026-08-18 08:07:00'),('bd47a287-9a98-11f1-aac1-306e96a67c7b','bd407d97-9a98-11f1-aac1-306e96a67c7b','cvvv',5,2,'2026-08-18 08:07:00'),('bd47bbf1-9a98-11f1-aac1-306e96a67c7b','bd407d97-9a98-11f1-aac1-306e96a67c7b','sdvsfv',5,3,'2026-08-18 08:07:00'),('bd47d1d2-9a98-11f1-aac1-306e96a67c7b','bd407d97-9a98-11f1-aac1-306e96a67c7b','vgvv',2,4,'2026-08-18 08:07:00'),('c9535955-92fd-11f1-aca4-94bb43285cf3','c9520972-92fd-11f1-aca4-94bb43285cf3','Refrigerator',32,1,'2026-08-08 15:49:48'),('c953b504-92fd-11f1-aca4-94bb43285cf3','c9520972-92fd-11f1-aca4-94bb43285cf3','Stove',28,2,'2026-08-08 15:49:48'),('c953edeb-92fd-11f1-aca4-94bb43285cf3','c9520972-92fd-11f1-aca4-94bb43285cf3','Sink',15,3,'2026-08-08 15:49:48'),('c9542243-92fd-11f1-aca4-94bb43285cf3','c9520972-92fd-11f1-aca4-94bb43285cf3','Microwave',12,4,'2026-08-08 15:49:48'),('c954541d-92fd-11f1-aca4-94bb43285cf3','c9520972-92fd-11f1-aca4-94bb43285cf3','Table',8,5,'2026-08-08 15:49:48'),('c954945f-92fd-11f1-aca4-94bb43285cf3','c9520972-92fd-11f1-aca4-94bb43285cf3','Dishes',5,6,'2026-08-08 15:49:48'),('c9555a57-92fd-11f1-aca4-94bb43285cf3','c954d873-92fd-11f1-aca4-94bb43285cf3','Hawaii',35,1,'2026-08-08 15:49:48'),('c955cc0d-92fd-11f1-aca4-94bb43285cf3','c954d873-92fd-11f1-aca4-94bb43285cf3','Florida',25,2,'2026-08-08 15:49:48'),('c956216d-92fd-11f1-aca4-94bb43285cf3','c954d873-92fd-11f1-aca4-94bb43285cf3','California',18,3,'2026-08-08 15:49:48'),('c95655ca-92fd-11f1-aca4-94bb43285cf3','c954d873-92fd-11f1-aca4-94bb43285cf3','New York',12,4,'2026-08-08 15:49:48'),('c956888a-92fd-11f1-aca4-94bb43285cf3','c954d873-92fd-11f1-aca4-94bb43285cf3','Las Vegas',7,5,'2026-08-08 15:49:48'),('c956c9ec-92fd-11f1-aca4-94bb43285cf3','c954d873-92fd-11f1-aca4-94bb43285cf3','Paris',3,6,'2026-08-08 15:49:48'),('df226427-aa4f-11f1-aa1e-5a57a32df548','df2106e4-aa4f-11f1-aa1e-5a57a32df548','aa',6,1,'2026-09-07 08:05:20'),('df23abcc-aa4f-11f1-aa1e-5a57a32df548','df2106e4-aa4f-11f1-aa1e-5a57a32df548','b',4,2,'2026-09-07 08:05:20'),('df244796-aa4f-11f1-aa1e-5a57a32df548','df2106e4-aa4f-11f1-aa1e-5a57a32df548','c',3,3,'2026-09-07 08:05:20'),('df24fc83-aa4f-11f1-aa1e-5a57a32df548','df2106e4-aa4f-11f1-aa1e-5a57a32df548','d',2,4,'2026-09-07 08:05:20'),('df25361e-aa4f-11f1-aa1e-5a57a32df548','df2106e4-aa4f-11f1-aa1e-5a57a32df548','e',1,5,'2026-09-07 08:05:20'),('fa2c2b86-acbc-11f1-976f-94bb43285cf3','fa2b172e-acbc-11f1-976f-94bb43285cf3','Chair',40,1,'2026-09-10 10:11:47'),('fa2c8679-acbc-11f1-976f-94bb43285cf3','fa2b172e-acbc-11f1-976f-94bb43285cf3','Desk',30,2,'2026-09-10 10:11:47'),('fa2cb507-acbc-11f1-976f-94bb43285cf3','fa2b172e-acbc-11f1-976f-94bb43285cf3','Board',20,3,'2026-09-10 10:11:47'),('fa2dfcac-acbc-11f1-976f-94bb43285cf3','fa2b172e-acbc-11f1-976f-94bb43285cf3','Projector',10,4,'2026-09-10 10:11:47'),('fa2e1a85-acbc-11f1-976f-94bb43285cf3','fa2b172e-acbc-11f1-976f-94bb43285cf3','Book',5,5,'2026-09-10 10:11:47'),('fa2e3f05-acbc-11f1-976f-94bb43285cf3','fa2b172e-acbc-11f1-976f-94bb43285cf3','Pencil',3,6,'2026-09-10 10:11:47'),('fa2e783f-acbc-11f1-976f-94bb43285cf3','fa2b172e-acbc-11f1-976f-94bb43285cf3','Bag',2,7,'2026-09-10 10:11:47'),('fa2ea057-acbc-11f1-976f-94bb43285cf3','fa2b172e-acbc-11f1-976f-94bb43285cf3','Clock',1,8,'2026-09-10 10:11:47'),('fa2f2029-acbc-11f1-976f-94bb43285cf3','fa2ec002-acbc-11f1-976f-94bb43285cf3','Java',40,1,'2026-09-10 10:11:47'),('fa2f8876-acbc-11f1-976f-94bb43285cf3','fa2ec002-acbc-11f1-976f-94bb43285cf3','Python',30,2,'2026-09-10 10:11:47'),('fa2f99d1-acbc-11f1-976f-94bb43285cf3','fa2ec002-acbc-11f1-976f-94bb43285cf3','C++',20,3,'2026-09-10 10:11:47'),('fa2fa607-acbc-11f1-976f-94bb43285cf3','fa2ec002-acbc-11f1-976f-94bb43285cf3','JavaScript',10,4,'2026-09-10 10:11:47'),('fa2fb3f8-acbc-11f1-976f-94bb43285cf3','fa2ec002-acbc-11f1-976f-94bb43285cf3','C#',5,5,'2026-09-10 10:11:47');

/*Table structure for table `sf_game_answers` */

DROP TABLE IF EXISTS `sf_game_answers`;

CREATE TABLE `sf_game_answers` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `answer_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `revealed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `revealed_by_team` int(11) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_game_answers_game_answer` (`game_id`,`answer_id`),
  KEY `idx_game_answers_game` (`game_id`),
  KEY `fk_sf_game_answers_answers` (`answer_id`),
  CONSTRAINT `fk_sf_game_answers_answers` FOREIGN KEY (`answer_id`) REFERENCES `sf_answers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_game_answers_games` FOREIGN KEY (`game_id`) REFERENCES `sf_games` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `sf_game_answers` */

insert  into `sf_game_answers`(`id`,`game_id`,`answer_id`,`revealed_at`,`revealed_by_team`) values ('148303f8-ac28-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b4e11b6-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:25:25',1),('160e5b38-ac29-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b50f9a1-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:32:37',5),('26aa115a-ac29-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b50eb67-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:33:05',5),('472bff43-ac28-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b50648f-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:26:50',1),('5baaedc5-945f-11f1-aca4-94bb43285cf3','6f1fb7e5-945e-11f1-aca4-94bb43285cf3','52371ce5-945e-11f1-aca4-94bb43285cf3','2026-08-10 10:00:40',1),('6195669b-ac28-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b50a9d7-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:27:34',1),('675398b3-aa5d-11f1-aa1e-5a57a32df548','a6e0439f-aa5c-11f1-aa1e-5a57a32df548','95466dbc-aa5c-11f1-aa1e-5a57a32df548','2026-09-07 09:42:12',1),('70d0c8be-945f-11f1-aca4-94bb43285cf3','6f1fb7e5-945e-11f1-aca4-94bb43285cf3','52374ff7-945e-11f1-aca4-94bb43285cf3','2026-08-10 10:01:15',0),('8713cdac-945f-11f1-aca4-94bb43285cf3','6f1fb7e5-945e-11f1-aca4-94bb43285cf3','5237c497-945e-11f1-aca4-94bb43285cf3','2026-08-10 10:01:53',4),('8b1c98ef-945f-11f1-aca4-94bb43285cf3','6f1fb7e5-945e-11f1-aca4-94bb43285cf3','52383ee4-945e-11f1-aca4-94bb43285cf3','2026-08-10 10:01:59',4),('8ffa3c8d-945d-11f1-aca4-94bb43285cf3','533c109c-945d-11f1-aca4-94bb43285cf3','2b0cdf82-945d-11f1-aca4-94bb43285cf3','2026-08-10 09:47:49',1),('9014abf0-ac26-11f1-aa1e-5a57a32df548','1a61f266-ac25-11f1-aa1e-5a57a32df548','6b4e11b6-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:14:33',1),('93f12fab-945d-11f1-aca4-94bb43285cf3','533c109c-945d-11f1-aca4-94bb43285cf3','2b0d09c4-945d-11f1-aca4-94bb43285cf3','2026-08-10 09:47:55',0),('97405d66-ac2a-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b536d8d-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:43:23',1),('9b3547ea-ac28-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b50dbd7-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:29:11',4),('9ffcf0f6-acb9-11f1-976f-94bb43285cf3','92bf84e5-acb9-11f1-976f-94bb43285cf3','763ca8ad-acb9-11f1-976f-94bb43285cf3','2026-09-10 09:47:47',1),('a1c04c3c-945f-11f1-aca4-94bb43285cf3','6f1fb7e5-945e-11f1-aca4-94bb43285cf3','52381ea5-945e-11f1-aca4-94bb43285cf3','2026-08-10 10:02:37',5),('ae0a0e80-945f-11f1-aca4-94bb43285cf3','6f1fb7e5-945e-11f1-aca4-94bb43285cf3','5237f457-945e-11f1-aca4-94bb43285cf3','2026-08-10 10:02:58',5),('aea8fa41-aa53-11f1-aa1e-5a57a32df548','831442de-aa53-11f1-aa1e-5a57a32df548','a2fa41f3-aa52-11f1-aa1e-5a57a32df548','2026-09-07 08:32:37',1),('b1b2c59f-aa53-11f1-aa1e-5a57a32df548','831442de-aa53-11f1-aa1e-5a57a32df548','a2fbfe1c-aa52-11f1-aa1e-5a57a32df548','2026-09-07 08:32:42',1),('b3291cbe-aa53-11f1-aa1e-5a57a32df548','831442de-aa53-11f1-aa1e-5a57a32df548','a2fc0cb6-aa52-11f1-aa1e-5a57a32df548','2026-09-07 08:32:44',1),('b438e7c6-aa53-11f1-aa1e-5a57a32df548','831442de-aa53-11f1-aa1e-5a57a32df548','a2fc1872-aa52-11f1-aa1e-5a57a32df548','2026-09-07 08:32:46',1),('b53c7e61-aa53-11f1-aa1e-5a57a32df548','831442de-aa53-11f1-aa1e-5a57a32df548','a2fc2f3c-aa52-11f1-aa1e-5a57a32df548','2026-09-07 08:32:48',1),('b63f598a-aa53-11f1-aa1e-5a57a32df548','831442de-aa53-11f1-aa1e-5a57a32df548','a2fc407c-aa52-11f1-aa1e-5a57a32df548','2026-09-07 08:32:49',1),('b7724224-aa53-11f1-aa1e-5a57a32df548','831442de-aa53-11f1-aa1e-5a57a32df548','a2fc4cfc-aa52-11f1-aa1e-5a57a32df548','2026-09-07 08:32:51',1),('b8a9d336-aa53-11f1-aa1e-5a57a32df548','831442de-aa53-11f1-aa1e-5a57a32df548','a2fc5894-aa52-11f1-aa1e-5a57a32df548','2026-09-07 08:32:53',1),('c2f49ac7-aa50-11f1-aa1e-5a57a32df548','a8db59ec-aa50-11f1-aa1e-5a57a32df548','df244796-aa4f-11f1-aa1e-5a57a32df548','2026-09-07 08:11:42',1),('c3a9c365-aa55-11f1-aa1e-5a57a32df548','95fa4eaf-aa55-11f1-aa1e-5a57a32df548','80dbaae8-aa55-11f1-aa1e-5a57a32df548','2026-09-07 08:47:31',1),('c77cd16c-ac2a-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b53c5ea-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:44:44',0),('c90ec08d-ac2a-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b53b459-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:44:46',0),('cc737e22-aa50-11f1-aa1e-5a57a32df548','a8db59ec-aa50-11f1-aa1e-5a57a32df548','df226427-aa4f-11f1-aa1e-5a57a32df548','2026-09-07 08:11:58',1),('ce8baf84-ac2a-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b538443-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:44:56',0),('d04a6648-ac2a-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b51e32a-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:44:59',0),('d3ab0d8a-ac2a-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b51cf40-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:45:04',0),('e3dc8d4a-ac29-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b51b45c-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:38:22',0),('e6c38c1d-92fd-11f1-aca4-94bb43285cf3','e6be8eb9-92fd-11f1-aca4-94bb43285cf3','c9535955-92fd-11f1-aca4-94bb43285cf3','2026-08-08 15:50:37',1),('e6e38c6a-ac29-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b51a9d0-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:38:27',0),('e97cbf40-ac29-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b5199d6-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:38:31',0),('ec0fafe9-ac29-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b5181c5-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:38:36',0),('ee20535f-aa50-11f1-aa1e-5a57a32df548','a8db59ec-aa50-11f1-aa1e-5a57a32df548','df23abcc-aa4f-11f1-aa1e-5a57a32df548','2026-09-07 08:12:55',4),('f09282c6-ac29-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b51666d-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:38:43',0),('f32c3de6-ac29-11f1-aa1e-5a57a32df548','8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b514fea-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:38:48',0),('fb3c336d-ac26-11f1-aa1e-5a57a32df548','1a61f266-ac25-11f1-aa1e-5a57a32df548','6b50a9d7-ac24-11f1-aa1e-5a57a32df548','2026-09-09 16:17:33',4);

/*Table structure for table `sf_game_sets` */

DROP TABLE IF EXISTS `sf_game_sets`;

CREATE TABLE `sf_game_sets` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `code` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_by` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_game_sets_code` (`code`),
  KEY `idx_game_sets_active_created` (`is_active`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `sf_game_sets` */

insert  into `sf_game_sets`(`id`,`code`,`title`,`description`,`created_at`,`created_by`,`is_active`) values ('2b04e859-945d-11f1-aca4-94bb43285cf3','UXNKRR','Banga ','ahahahd','2026-08-10 09:44:59',NULL,1),('2e27870d-a746-11f1-aa1e-5a57a32df548','UQPL4N','jajas',NULL,'2026-09-03 11:18:37',NULL,1),('38cda292-9300-11f1-aca4-94bb43285cf3','9KHW7T','hele','esmiringhoy','2026-08-08 16:07:14',NULL,1),('3fa00659-ac0e-11f1-aa1e-5a57a32df548','XL4JBW','sample',NULL,'2026-09-09 13:20:30',NULL,1),('4c19c56a-ac0b-11f1-aa1e-5a57a32df548','R4GKTC','sampleee','hgfhg','2026-09-09 12:59:22',NULL,1),('52358677-945e-11f1-aca4-94bb43285cf3','HYHXM4','Banga ','ahahahd','2026-08-10 09:53:15',NULL,1),('5a22a4ae-9a04-11f1-aca4-94bb43285cf3','WW85CU','Game testing','testing button ','2026-08-17 14:23:56',NULL,1),('6693b4ad-ac19-11f1-aa1e-5a57a32df548','TXPLF8','sefwe',NULL,'2026-09-09 14:40:20',NULL,1),('6b4c826a-ac24-11f1-aa1e-5a57a32df548','5XV9M3','sample game',NULL,'2026-09-09 15:59:12',NULL,1),('763a5f31-acb9-11f1-976f-94bb43285cf3','G6M8Y5','sample import',NULL,'2026-09-10 09:46:37',NULL,1),('7ad7ff51-9a06-11f1-aca4-94bb43285cf3','AJNWWQ','testing','testing button','2026-08-17 14:39:09',NULL,1),('80d9f2d1-aa55-11f1-aa1e-5a57a32df548','PETVWT','sample2','sedfsdf','2026-09-07 08:45:39',NULL,1),('9541eab0-aa5c-11f1-aa1e-5a57a32df548','MJXLVV','test','asdfsdf','2026-09-07 09:36:19',NULL,1),('a2f9ba43-aa52-11f1-aa1e-5a57a32df548','DFQLVT','Sample',NULL,'2026-09-07 08:25:07',NULL,1),('b60367c8-9a09-11f1-aca4-94bb43285cf3','8CJ5AZ','test banga','test button banga','2026-08-17 15:02:17',NULL,1),('bc8332fa-ac1c-11f1-aa1e-5a57a32df548','RB9BE9','testing',NULL,'2026-09-09 15:04:12',NULL,1),('bd3f7683-9a98-11f1-aac1-306e96a67c7b','Q6KSRJ','sdfs',NULL,'2026-08-18 08:07:00',NULL,1),('c9510383-92fd-11f1-aca4-94bb43285cf3','DEMO001','Demo Family Feud Game','A demonstration game with sample questions','2026-08-08 15:49:48',NULL,1),('df1ec6e2-aa4f-11f1-aa1e-5a57a32df548','GFZEKJ','game',NULL,'2026-09-07 08:05:20',NULL,1),('fa28865f-acbc-11f1-976f-94bb43285cf3','3BXM5H','sample question',NULL,'2026-09-10 10:11:47',NULL,1);

/*Table structure for table `sf_games` */

DROP TABLE IF EXISTS `sf_games`;

CREATE TABLE `sf_games` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_set_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `team1_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team2_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team3_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team4_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team5_id` char(36) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team1_custom_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team2_custom_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team3_custom_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team4_custom_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team5_custom_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `team1_score` int(11) NOT NULL DEFAULT '0',
  `team2_score` int(11) NOT NULL DEFAULT '0',
  `team3_score` int(11) NOT NULL DEFAULT '0',
  `team4_score` int(11) NOT NULL DEFAULT '0',
  `team5_score` int(11) NOT NULL DEFAULT '0',
  `team1_strikes` int(11) NOT NULL DEFAULT '0',
  `team2_strikes` int(11) NOT NULL DEFAULT '0',
  `team3_strikes` int(11) NOT NULL DEFAULT '0',
  `team4_strikes` int(11) NOT NULL DEFAULT '0',
  `team5_strikes` int(11) NOT NULL DEFAULT '0',
  `current_question_index` int(11) NOT NULL DEFAULT '0',
  `strikes` int(11) NOT NULL DEFAULT '0',
  `show_strike_animation_at` datetime(3) DEFAULT NULL,
  `play_intense_sound_at` datetime(3) DEFAULT NULL,
  `play_winning_sound_at` datetime(3) DEFAULT NULL,
  `stop_sounds_at` datetime(3) DEFAULT NULL,
  `game_status` enum('waiting','playing','paused','finished') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'waiting',
  `started_at` datetime DEFAULT NULL,
  `finished_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_games_game_set_created` (`game_set_id`,`created_at`),
  KEY `idx_games_status` (`game_status`),
  KEY `fk_sf_games_team1` (`team1_id`),
  KEY `fk_sf_games_team2` (`team2_id`),
  KEY `fk_sf_games_team3` (`team3_id`),
  KEY `fk_sf_games_team4` (`team4_id`),
  KEY `fk_sf_games_team5` (`team5_id`),
  CONSTRAINT `fk_sf_games_game_sets` FOREIGN KEY (`game_set_id`) REFERENCES `sf_game_sets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team1` FOREIGN KEY (`team1_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team2` FOREIGN KEY (`team2_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team3` FOREIGN KEY (`team3_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team4` FOREIGN KEY (`team4_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `fk_sf_games_team5` FOREIGN KEY (`team5_id`) REFERENCES `sf_teams` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `sf_games` */

insert  into `sf_games`(`id`,`game_set_id`,`team1_id`,`team2_id`,`team3_id`,`team4_id`,`team5_id`,`team1_custom_name`,`team2_custom_name`,`team3_custom_name`,`team4_custom_name`,`team5_custom_name`,`team1_score`,`team2_score`,`team3_score`,`team4_score`,`team5_score`,`team1_strikes`,`team2_strikes`,`team3_strikes`,`team4_strikes`,`team5_strikes`,`current_question_index`,`strikes`,`show_strike_animation_at`,`play_intense_sound_at`,`play_winning_sound_at`,`stop_sounds_at`,`game_status`,`started_at`,`finished_at`,`created_at`) values ('17b52800-acbd-11f1-976f-94bb43285cf3','fa28865f-acbc-11f1-976f-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'cte','cbm','ctech','coas','cfes',0,0,0,0,0,0,0,0,0,0,1,0,NULL,'2026-09-10 10:17:50.219','2026-09-10 10:17:52.502',NULL,'playing','2026-09-10 10:12:37',NULL,'2026-09-10 10:12:37'),('1a61f266-ac25-11f1-aa1e-5a57a32df548','6b4c826a-ac24-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'CFES','CTE','COAS','CTECH','CBM',35,0,0,0,0,3,0,0,3,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-09 16:04:06',NULL,'2026-09-09 16:04:06'),('3eee9994-a746-11f1-aa1e-5a57a32df548','2e27870d-a746-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','cfes','coas','cbm',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-03 11:19:06',NULL,'2026-09-03 11:19:06'),('4de89a15-ac0e-11f1-aa1e-5a57a32df548','3fa00659-ac0e-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cs','ds','we','rw','fd',0,0,0,0,0,0,0,0,0,0,0,0,NULL,'2026-09-09 13:27:37.347',NULL,'2026-09-09 13:27:49.364','playing','2026-09-09 13:20:54',NULL,'2026-09-09 13:20:54'),('533c109c-945d-11f1-aca4-94bb43285cf3','2b04e859-945d-11f1-aca4-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'Ctech','Cte','Coas','Cbm','esmiringhoy',17,0,0,0,0,0,0,0,0,0,1,0,NULL,NULL,NULL,NULL,'finished','2026-08-10 09:46:07','2026-08-10 09:51:29','2026-08-10 09:46:07'),('5dd08a79-ac0b-11f1-aa1e-5a57a32df548','4c19c56a-ac0b-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','cfes','ctech','coas','cbm',0,0,0,0,0,0,0,0,0,0,0,0,NULL,'2026-09-09 13:09:19.820','2026-09-09 13:09:21.849','2026-09-09 13:09:10.433','playing','2026-09-09 12:59:53',NULL,'2026-09-09 12:59:52'),('63008562-aa50-11f1-aa1e-5a57a32df548','df1ec6e2-aa4f-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','coas','cbm','cfes',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-07 08:09:02',NULL,'2026-09-07 08:09:01'),('6354b28f-acbe-11f1-976f-94bb43285cf3','fa28865f-acbc-11f1-976f-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'hhe','fdffdf','fdde','dfd','ggg',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-10 10:21:54',NULL,'2026-09-10 10:21:53'),('63f4c564-9300-11f1-aca4-94bb43285cf3','38cda292-9300-11f1-aca4-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'fdf','ff','dd','dfdf','dfd',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-08-08 16:08:27',NULL,'2026-08-08 16:08:26'),('6f1fb7e5-945e-11f1-aca4-94bb43285cf3','52358677-945e-11f1-aca4-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'cte','ctech','coas','cbm','cfes',17,0,0,9,0,0,0,1,1,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-08-10 09:54:04',NULL,'2026-08-10 09:54:03'),('70ec54a5-9a04-11f1-aca4-94bb43285cf3','5a22a4ae-9a04-11f1-aca4-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'dddd','ssss','wwww','qqqq','aaaaq',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-08-17 14:24:34',NULL,'2026-08-17 14:24:34'),('74fa1d8d-ac19-11f1-aa1e-5a57a32df548','6693b4ad-ac19-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'asd','asdas',NULL,NULL,NULL,0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-09 14:40:44',NULL,'2026-09-09 14:40:44'),('831442de-aa53-11f1-aa1e-5a57a32df548','a2f9ba43-aa52-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','cbm','coas','cfes',56,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'finished','2026-09-07 08:31:24','2026-09-07 08:33:11','2026-09-07 08:31:23'),('8318dab0-ac24-11f1-aa1e-5a57a32df548','6b4c826a-ac24-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'CFES','COAS','CBM','CTECH','CTE',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-09 15:59:53',NULL,'2026-09-09 15:59:52'),('8a1e19de-ac27-11f1-aa1e-5a57a32df548','6b4c826a-ac24-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'CFES','CTE','COAS','CTECH','CBM',99,0,0,12,3,0,1,0,1,0,2,0,NULL,'2026-09-09 16:39:28.594','2026-09-09 16:33:10.431','2026-09-09 16:44:41.260','finished','2026-09-09 16:21:33','2026-09-09 16:48:15','2026-09-09 16:21:32'),('8b1274e3-9a06-11f1-aca4-94bb43285cf3','7ad7ff51-9a06-11f1-aca4-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'ddsd','sdd','ccccgg','ggggk','kklkk',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-08-17 14:39:37',NULL,'2026-08-17 14:39:37'),('92bf84e5-acb9-11f1-976f-94bb43285cf3','763a5f31-acb9-11f1-976f-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'ddd','fff','ggg','hhh','jjj',40,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-10 09:47:26',NULL,'2026-09-10 09:47:25'),('95fa4eaf-aa55-11f1-aa1e-5a57a32df548','80d9f2d1-aa55-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','cfes','cbm','coas',17,0,0,0,0,0,0,0,0,0,0,0,NULL,'2026-09-07 08:47:21.461','2026-09-07 09:05:56.394','2026-09-07 08:47:36.394','playing','2026-09-07 08:46:15',NULL,'2026-09-07 08:46:14'),('a6e0439f-aa5c-11f1-aa1e-5a57a32df548','9541eab0-aa5c-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','cbm','cfes','coas',12,0,0,0,0,0,0,0,0,0,0,0,NULL,'2026-09-07 09:50:10.476','2026-09-07 09:50:41.249','2026-09-07 09:47:43.133','playing','2026-09-07 09:36:49',NULL,'2026-09-07 09:36:49'),('a8db59ec-aa50-11f1-aa1e-5a57a32df548','df1ec6e2-aa4f-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','cbm','cfes','coas',9,0,0,0,0,0,0,1,1,0,0,0,NULL,NULL,NULL,NULL,'paused','2026-09-07 08:10:59',NULL,'2026-09-07 08:10:58'),('c7a4904f-9a09-11f1-aca4-94bb43285cf3','b60367c8-9a09-11f1-aca4-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'dfd','xccx','saas','hguhyj','tyty',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-08-17 15:02:47',NULL,'2026-08-17 15:02:47'),('cd4f88ab-aa52-11f1-aa1e-5a57a32df548','a2f9ba43-aa52-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','cbm','coas','cfes',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-07 08:26:19',NULL,'2026-09-07 08:26:18'),('d1871237-9a98-11f1-aac1-306e96a67c7b','bd3f7683-9a98-11f1-aac1-306e96a67c7b',NULL,NULL,NULL,NULL,NULL,'cccc','vvvv','bbb','nnn','rrr',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-08-18 08:07:35',NULL,'2026-08-18 08:07:34'),('d7e5c1b6-aa5e-11f1-aa1e-5a57a32df548','9541eab0-aa5c-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','cbm','cfes','coas',0,0,0,0,0,0,0,0,0,0,0,0,NULL,'2026-09-07 09:56:42.396','2026-09-07 09:56:53.131','2026-09-07 09:56:44.481','playing','2026-09-07 09:52:31',NULL,'2026-09-07 09:52:30'),('e11fc02d-ac1c-11f1-aa1e-5a57a32df548','bc8332fa-ac1c-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cfes','coas','cbm','ctech','cte',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-09 15:05:14',NULL,'2026-09-09 15:05:14'),('e6be8eb9-92fd-11f1-aca4-94bb43285cf3','c9510383-92fd-11f1-aca4-94bb43285cf3',NULL,NULL,NULL,NULL,NULL,'Alpha','Beta',NULL,NULL,NULL,10,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-08-08 15:50:38',NULL,'2026-08-08 15:50:37'),('f301e6c9-aa4f-11f1-aa1e-5a57a32df548','df1ec6e2-aa4f-11f1-aa1e-5a57a32df548',NULL,NULL,NULL,NULL,NULL,'cte','ctech','cbm','cfes','coas',0,0,0,0,0,0,0,0,0,0,0,0,NULL,NULL,NULL,NULL,'playing','2026-09-07 08:05:54',NULL,'2026-09-07 08:05:54');

/*Table structure for table `sf_questions` */

DROP TABLE IF EXISTS `sf_questions`;

CREATE TABLE `sf_questions` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `game_set_id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `question` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `order_index` int(11) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_questions_game_set_order` (`game_set_id`,`order_index`),
  CONSTRAINT `fk_sf_questions_game_sets` FOREIGN KEY (`game_set_id`) REFERENCES `sf_game_sets` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `sf_questions` */

insert  into `sf_questions`(`id`,`game_set_id`,`question`,`order_index`,`created_at`) values ('2b09aaf9-945d-11f1-aca4-94bb43285cf3','2b04e859-945d-11f1-aca4-94bb43285cf3','hahabdhwueidksdnd?',1,'2026-08-10 09:44:59'),('2b0d45bf-945d-11f1-aca4-94bb43285cf3','2b04e859-945d-11f1-aca4-94bb43285cf3','fgdgdg?',2,'2026-08-10 09:44:59'),('2e2c21e3-a746-11f1-aa1e-5a57a32df548','2e27870d-a746-11f1-aa1e-5a57a32df548','zxvfdf',1,'2026-09-03 11:18:37'),('38d40432-9300-11f1-aca4-94bb43285cf3','38cda292-9300-11f1-aca4-94bb43285cf3','nigga',1,'2026-08-08 16:07:14'),('3fa0ca23-ac0e-11f1-aa1e-5a57a32df548','3fa00659-ac0e-11f1-aa1e-5a57a32df548','samel',1,'2026-09-09 13:20:30'),('4c1c0b6f-ac0b-11f1-aa1e-5a57a32df548','4c19c56a-ac0b-11f1-aa1e-5a57a32df548','saeraerwawerw',1,'2026-09-09 12:59:22'),('5236572a-945e-11f1-aca4-94bb43285cf3','52358677-945e-11f1-aca4-94bb43285cf3','Kinsay kina palaotogan sa bisu?',1,'2026-08-10 09:53:15'),('5238730c-945e-11f1-aca4-94bb43285cf3','52358677-945e-11f1-aca4-94bb43285cf3','Kinsay pinaka pogi sa bisu?',2,'2026-08-10 09:53:15'),('5a29ce96-9a04-11f1-aca4-94bb43285cf3','5a22a4ae-9a04-11f1-aca4-94bb43285cf3','fuck',1,'2026-08-17 14:23:56'),('6694473b-ac19-11f1-aa1e-5a57a32df548','6693b4ad-ac19-11f1-aa1e-5a57a32df548','efsdf',1,'2026-09-09 14:40:20'),('6b4d1e58-ac24-11f1-aa1e-5a57a32df548','6b4c826a-ac24-11f1-aa1e-5a57a32df548','Magbigay ng isang superhero mula sa Marvel Cinematic Universe.',1,'2026-09-09 15:59:12'),('6b510cf1-ac24-11f1-aa1e-5a57a32df548','6b4c826a-ac24-11f1-aa1e-5a57a32df548','Magbigay ng isang bagay na laging dala ng isang taong \'street smart.',2,'2026-09-09 15:59:12'),('6b51bd1e-ac24-11f1-aa1e-5a57a32df548','6b4c826a-ac24-11f1-aa1e-5a57a32df548','Ayon sa mga tao, ano ang \'tama\' kay Thanos?',3,'2026-09-09 15:59:12'),('763bf86e-acb9-11f1-976f-94bb43285cf3','763a5f31-acb9-11f1-976f-94bb43285cf3','Name something you find in a classroom',1,'2026-09-10 09:46:37'),('763d77fc-acb9-11f1-976f-94bb43285cf3','763a5f31-acb9-11f1-976f-94bb43285cf3','Name a programming language',2,'2026-09-10 09:46:37'),('7ad9ce47-9a06-11f1-aca4-94bb43285cf3','7ad7ff51-9a06-11f1-aca4-94bb43285cf3','banga',1,'2026-08-17 14:39:09'),('80dae6dc-aa55-11f1-aa1e-5a57a32df548','80d9f2d1-aa55-11f1-aa1e-5a57a32df548','asdfasd',1,'2026-09-07 08:45:39'),('95453d36-aa5c-11f1-aa1e-5a57a32df548','9541eab0-aa5c-11f1-aa1e-5a57a32df548','asdfasdfs',1,'2026-09-07 09:36:19'),('a2f9f467-aa52-11f1-aa1e-5a57a32df548','a2f9ba43-aa52-11f1-aa1e-5a57a32df548','dfgsdvs',1,'2026-09-07 08:25:07'),('b605ae52-9a09-11f1-aca4-94bb43285cf3','b60367c8-9a09-11f1-aca4-94bb43285cf3','banga test',1,'2026-08-17 15:02:17'),('bc86986e-ac1c-11f1-aa1e-5a57a32df548','bc8332fa-ac1c-11f1-aa1e-5a57a32df548','Halimbawa ng water sport',1,'2026-09-09 15:04:13'),('bc8d9b96-ac1c-11f1-aa1e-5a57a32df548','bc8332fa-ac1c-11f1-aa1e-5a57a32df548','Bukod sa Libro ano pa ang kadalasan makikita sa Library ',2,'2026-09-09 15:04:13'),('bc90cfeb-ac1c-11f1-aa1e-5a57a32df548','bc8332fa-ac1c-11f1-aa1e-5a57a32df548','Mga alagang hayop na exotic',3,'2026-09-09 15:04:13'),('bc918180-ac1c-11f1-aa1e-5a57a32df548','bc8332fa-ac1c-11f1-aa1e-5a57a32df548','Parte ng katawan na may letter \"e\"',4,'2026-09-09 15:04:13'),('bc91fbf5-ac1c-11f1-aa1e-5a57a32df548','bc8332fa-ac1c-11f1-aa1e-5a57a32df548','Pagkain na dahilan ng allergy ng tao',5,'2026-09-09 15:04:13'),('bd407d97-9a98-11f1-aac1-306e96a67c7b','bd3f7683-9a98-11f1-aac1-306e96a67c7b','dsfgs',1,'2026-08-18 08:07:00'),('c9520972-92fd-11f1-aca4-94bb43285cf3','c9510383-92fd-11f1-aca4-94bb43285cf3','Name something you might find in a kitchen',1,'2026-08-08 15:49:48'),('c954d873-92fd-11f1-aca4-94bb43285cf3','c9510383-92fd-11f1-aca4-94bb43285cf3','Name a popular vacation destination',2,'2026-08-08 15:49:48'),('df2106e4-aa4f-11f1-aa1e-5a57a32df548','df1ec6e2-aa4f-11f1-aa1e-5a57a32df548','sdsdsdsd',1,'2026-09-07 08:05:20'),('fa2b172e-acbc-11f1-976f-94bb43285cf3','fa28865f-acbc-11f1-976f-94bb43285cf3','Name something you find in a classroom',1,'2026-09-10 10:11:47'),('fa2ec002-acbc-11f1-976f-94bb43285cf3','fa28865f-acbc-11f1-976f-94bb43285cf3','Name a programming language',2,'2026-09-10 10:11:47');

/*Table structure for table `sf_teams` */

DROP TABLE IF EXISTS `sf_teams`;

CREATE TABLE `sf_teams` (
  `id` char(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `color` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'blue',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_teams_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

/*Data for the table `sf_teams` */

insert  into `sf_teams`(`id`,`name`,`color`,`created_at`) values ('c94e8b96-92fd-11f1-aca4-94bb43285cf3','Team Red','red','2026-08-08 15:49:48'),('c94f2cac-92fd-11f1-aca4-94bb43285cf3','Team Blue','blue','2026-08-08 15:49:48'),('c94f8c21-92fd-11f1-aca4-94bb43285cf3','Team Green','green','2026-08-08 15:49:48'),('c94fcce4-92fd-11f1-aca4-94bb43285cf3','Team Yellow','yellow','2026-08-08 15:49:48'),('c95009c1-92fd-11f1-aca4-94bb43285cf3','Team Purple','purple','2026-08-08 15:49:48');

/* Procedure structure for procedure `sp_add_team_strike` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_add_team_strike` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_add_team_strike`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_create_answer` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_create_answer` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_create_answer`(
  IN p_question_id CHAR(36),
  IN p_text VARCHAR(200),
  IN p_points INT,
  IN p_order_index INT
)
BEGIN
  INSERT INTO `sf_answers` (`id`, `question_id`, `text`, `points`, `order_index`)
  VALUES (UUID(), p_question_id, p_text, p_points, p_order_index);
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_create_game` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_create_game` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_create_game`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_create_game_set` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_create_game_set` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_create_game_set`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_create_game_with_custom_names` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_create_game_with_custom_names` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_create_game_with_custom_names`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_create_question` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_create_question` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_create_question`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_finish_game` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_finish_game` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_finish_game`(IN p_id CHAR(36))
BEGIN
  UPDATE `sf_games`
  SET `finished_at` = COALESCE(`finished_at`, CURRENT_TIMESTAMP)
  WHERE `id` = p_id;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_all_game_sets` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_all_game_sets` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_all_game_sets`()
BEGIN
  SELECT *
  FROM `sf_game_sets`
  WHERE `is_active` = 1
  ORDER BY `created_at` DESC;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_game_by_id` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_game_by_id` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_game_by_id`(IN p_id CHAR(36))
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_game_set_by_code` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_game_set_by_code` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_game_set_by_code`(IN p_code VARCHAR(20))
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_game_state` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_game_state` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_game_state`(
  IN p_id VARCHAR(64)
)
BEGIN
  SELECT `state`
  FROM `game_state`
  WHERE `id` = p_id
  LIMIT 1;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_latest_game_by_game_set` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_latest_game_by_game_set` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_latest_game_by_game_set`(IN p_game_set_id CHAR(36))
BEGIN
  SELECT *
  FROM `sf_games`
  WHERE `game_set_id` = p_game_set_id
  ORDER BY `created_at` DESC
  LIMIT 1;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_questions` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_questions` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_questions`()
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_questions_with_answers` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_questions_with_answers` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_questions_with_answers`()
BEGIN
  SELECT
    q.`id` AS `question_id`,
    q.`question`,
    q.`round`,
    a.`id` AS `answer_id`,
    a.`answer`,
    a.`points`
  FROM `questions` q
  LEFT JOIN `answers` a
    ON a.`question_id` = q.`id`
    AND a.`is_active` = 1
  WHERE q.`is_active` = 1
  ORDER BY q.`sort_order`, q.`id`, a.`sort_order`, a.`points` DESC, a.`id`;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_revealed_answers` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_revealed_answers` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_revealed_answers`(IN p_game_id CHAR(36))
BEGIN
  SELECT `answer_id`
  FROM `sf_game_answers`
  WHERE `game_id` = p_game_id
  ORDER BY `revealed_at`;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_get_teams` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_get_teams` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_get_teams`()
BEGIN
  SELECT * FROM `sf_teams` ORDER BY `name`;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_reset_game_state` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_reset_game_state` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_reset_game_state`()
BEGIN
  DELETE FROM `game_state` WHERE `id` = 'main';
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_reveal_answer` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_reveal_answer` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_reveal_answer`(
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
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_save_game_state` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_save_game_state` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_save_game_state`(
  IN p_id VARCHAR(64),
  IN p_state JSON
)
BEGIN
  INSERT INTO `game_state` (`id`, `state`)
  VALUES (p_id, p_state)
  ON DUPLICATE KEY UPDATE
    `state` = VALUES(`state`),
    `updated_at` = CURRENT_TIMESTAMP;
END */$$
DELIMITER ;

/* Procedure structure for procedure `sp_update_game` */

/*!50003 DROP PROCEDURE IF EXISTS  `sp_update_game` */;

DELIMITER $$

/*!50003 CREATE DEFINER=`scimath_db`@`localhost` PROCEDURE `sp_update_game`(
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
  IN p_show_strike_animation_at DATETIME(3),
  IN p_play_intense_sound_at DATETIME(3),
  IN p_play_winning_sound_at DATETIME(3),
  IN p_stop_sounds_at DATETIME(3),
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
END */$$
DELIMITER ;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
