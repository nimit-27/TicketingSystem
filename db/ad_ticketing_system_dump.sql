CREATE DATABASE  IF NOT EXISTS `ticketing_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ticketing_system`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ticketing_system
-- ------------------------------------------------------
-- Server version	8.0.43

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `assignment_history`
--

DROP TABLE IF EXISTS `assignment_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `assignment_history` (
  `id` varchar(36) NOT NULL,
  `ticket_id` varchar(36) NOT NULL,
  `assigned_by` varchar(100) NOT NULL,
  `assigned_to` varchar(100) NOT NULL,
  `level_id` varchar(20) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ticket_assignment_history` (`ticket_id`),
  CONSTRAINT `fk_ticket_assignment_history` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `assignment_history`
--

LOCK TABLES `assignment_history` WRITE;
/*!40000 ALTER TABLE `assignment_history` DISABLE KEYS */;
/*!40000 ALTER TABLE `assignment_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_event`
--

DROP TABLE IF EXISTS `calendar_event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_event` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `start_at` datetime NOT NULL,
  `end_at` datetime NOT NULL,
  `is_all_day` tinyint(1) NOT NULL DEFAULT '0',
  `background_color` varchar(16) DEFAULT NULL,
  `text_color` varchar(16) DEFAULT NULL,
  `meta` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_calendar_event_start` (`start_at`),
  KEY `idx_calendar_event_end` (`end_at`),
  KEY `idx_calendar_event_all_day` (`is_all_day`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_event`
--

LOCK TABLES `calendar_event` WRITE;
/*!40000 ALTER TABLE `calendar_event` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendar_event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_holiday`
--

DROP TABLE IF EXISTS `calendar_holiday`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_holiday` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `holiday_date` date NOT NULL,
  `name` varchar(128) NOT NULL,
  `region` varchar(64) NOT NULL DEFAULT 'IN-WB-Kolkata',
  `is_optional` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_calendar_holiday_date_region` (`holiday_date`,`region`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_holiday`
--

LOCK TABLES `calendar_holiday` WRITE;
/*!40000 ALTER TABLE `calendar_holiday` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendar_holiday` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_source`
--

DROP TABLE IF EXISTS `calendar_source`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_source` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `provider_code` varchar(64) NOT NULL,
  `base_url` varchar(255) NOT NULL,
  `api_key` varchar(255) DEFAULT NULL,
  `enabled` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_calendar_source_provider` (`provider_code`),
  KEY `idx_calendar_source_enabled` (`enabled`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_source`
--

LOCK TABLES `calendar_source` WRITE;
/*!40000 ALTER TABLE `calendar_source` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendar_source` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_working_hours`
--

DROP TABLE IF EXISTS `calendar_working_hours`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_working_hours` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `timezone` varchar(64) NOT NULL DEFAULT 'Asia/Kolkata',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_calendar_working_hours_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_working_hours`
--

LOCK TABLES `calendar_working_hours` WRITE;
/*!40000 ALTER TABLE `calendar_working_hours` DISABLE KEYS */;
INSERT INTO `calendar_working_hours` VALUES (1,'13:00:00','13:50:00','Asia/Kolkata',1);
/*!40000 ALTER TABLE `calendar_working_hours` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `calendar_working_hours_exception`
--

DROP TABLE IF EXISTS `calendar_working_hours_exception`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calendar_working_hours_exception` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `scope` varchar(16) NOT NULL,
  `target_date` date DEFAULT NULL,
  `weekday` tinyint DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `start_time` time DEFAULT NULL,
  `end_time` time DEFAULT NULL,
  `is_closed` tinyint(1) NOT NULL DEFAULT '0',
  `priority` int NOT NULL DEFAULT '0',
  `note` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_calendar_working_hours_exception_scope` (`scope`),
  KEY `idx_calendar_working_hours_exception_date` (`target_date`),
  KEY `idx_calendar_working_hours_exception_weekday` (`weekday`),
  KEY `idx_calendar_working_hours_exception_range` (`start_date`,`end_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `calendar_working_hours_exception`
--

LOCK TABLES `calendar_working_hours_exception` WRITE;
/*!40000 ALTER TABLE `calendar_working_hours_exception` DISABLE KEYS */;
/*!40000 ALTER TABLE `calendar_working_hours_exception` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` varchar(36) NOT NULL,
  `category` varchar(100) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) DEFAULT NULL,
  `is_active` enum('Y','N') NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('1','System Issues','teaml1','2025-08-20 04:57:28','2025-08-20 04:57:28',NULL,'Y'),('10','Any other issues related to Anna Darpan only',NULL,'2025-08-20 04:57:28','2025-08-20 04:57:28',NULL,'Y'),('2','Single User Access','bhavyar','2025-06-10 11:21:58','2025-08-20 04:57:28',NULL,'Y'),('3','Data Management','chirags','2025-06-10 11:21:58','2025-08-20 04:57:28',NULL,'Y'),('4','Mobile Application related issues',NULL,NULL,'2025-08-20 04:57:28',NULL,'Y'),('5','System Bug',NULL,NULL,'2025-08-20 04:57:28',NULL,'Y'),('6','Workflow related issue',NULL,NULL,'2025-08-20 04:57:28',NULL,'Y'),('7','Integration & Middleware','alexs','2025-06-24 06:30:00','2025-08-20 04:57:28','alexs','Y'),('8','Reporting & Analytics Tools',NULL,NULL,'2025-08-20 04:57:28',NULL,'Y'),('9','Cosmetic Changes',NULL,NULL,'2025-08-20 04:57:28',NULL,'Y');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employee_levels`
--

DROP TABLE IF EXISTS `employee_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employee_levels` (
  `employee_id` int NOT NULL,
  `level_id` int NOT NULL,
  PRIMARY KEY (`employee_id`,`level_id`),
  KEY `level_id` (`level_id`),
  CONSTRAINT `employee_levels_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`employee_id`),
  CONSTRAINT `employee_levels_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `levels` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employee_levels`
--

LOCK TABLES `employee_levels` WRITE;
/*!40000 ALTER TABLE `employee_levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `employee_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `employees`
--

DROP TABLE IF EXISTS `employees`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `employees` (
  `employee_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email_id` varchar(100) DEFAULT NULL,
  `mobile_no` varchar(15) DEFAULT NULL,
  `office` varchar(100) DEFAULT NULL,
  `user_id` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `faqs`
--

DROP TABLE IF EXISTS `faqs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `faqs` (
  `id` varchar(36) NOT NULL,
  `question_en` text,
  `question_hi` text,
  `answer_en` text,
  `answer_hi` text,
  `keywords` text,
  `created_by` varchar(45) DEFAULT NULL,
  `created_on` datetime DEFAULT NULL,
  `updated_by` varchar(45) DEFAULT NULL,
  `updated_on` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `faqs`
--

LOCK TABLES `faqs` WRITE;
/*!40000 ALTER TABLE `faqs` DISABLE KEYS */;
/*!40000 ALTER TABLE `faqs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `filegator_users`
--

DROP TABLE IF EXISTS `filegator_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filegator_users` (
  `user_id` int NOT NULL,
  `permissions` varchar(200) NOT NULL DEFAULT '',
  `homedir` varchar(2000) NOT NULL DEFAULT '/',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `filegator_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `filegator_users`
--

LOCK TABLES `filegator_users` WRITE;
/*!40000 ALTER TABLE `filegator_users` DISABLE KEYS */;
/*!40000 ALTER TABLE `filegator_users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `helpdesk_support_levels`
--

DROP TABLE IF EXISTS `helpdesk_support_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `helpdesk_support_levels` (
  `hl_id` tinyint unsigned NOT NULL,
  `hl_level` varchar(3) NOT NULL,
  `hl_name` varchar(80) NOT NULL,
  `hl_descriptions` text NOT NULL,
  `st_id` tinyint unsigned DEFAULT NULL,
  `hl_active_flg` enum('Y','N') NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`hl_id`),
  UNIQUE KEY `uq_hl_level` (`hl_level`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `helpdesk_support_levels`
--

LOCK TABLES `helpdesk_support_levels` WRITE;
/*!40000 ALTER TABLE `helpdesk_support_levels` DISABLE KEYS */;
INSERT INTO `helpdesk_support_levels` VALUES (1,'L1','Level 1 – Basic Support','First point of contact for users',1,'Y'),(2,'L2','Level 2 – Technical Support','More in-depth technical assistance',1,'Y'),(3,'L3','Level 3 – Expert Support','Advanced troubleshooting and root cause analysis',1,'Y'),(4,'L4','Level 4 – External Support','Support from external vendors or third-party providers',2,'Y');
/*!40000 ALTER TABLE `helpdesk_support_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_base`
--

DROP TABLE IF EXISTS `knowledge_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_base` (
  `id` varchar(36) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `type` varchar(100) DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_base`
--

LOCK TABLES `knowledge_base` WRITE;
/*!40000 ALTER TABLE `knowledge_base` DISABLE KEYS */;
/*!40000 ALTER TABLE `knowledge_base` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `levels`
--

DROP TABLE IF EXISTS `levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `levels` (
  `level_id` int NOT NULL AUTO_INCREMENT,
  `level_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`level_id`),
  UNIQUE KEY `level_name` (`level_name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `levels`
--

LOCK TABLES `levels` WRITE;
/*!40000 ALTER TABLE `levels` DISABLE KEYS */;
INSERT INTO `levels` VALUES (4,'admin'),(6,'guest'),(5,'Helpdesk'),(1,'L1'),(2,'L2'),(3,'L3');
/*!40000 ALTER TABLE `levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `mode_master`
--

DROP TABLE IF EXISTS `mode_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `mode_master` (
  `mode_id` varchar(10) NOT NULL,
  `mode_label` varchar(50) NOT NULL,
  `mode_code` varchar(50) NOT NULL,
  PRIMARY KEY (`mode_id`),
  UNIQUE KEY `uk_mode_master_code` (`mode_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `mode_master`
--

LOCK TABLES `mode_master` WRITE;
/*!40000 ALTER TABLE `mode_master` DISABLE KEYS */;
INSERT INTO `mode_master` VALUES ('1','Self','SELF'),('2','Call','CALL'),('3','Email','EMAIL');
/*!40000 ALTER TABLE `mode_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `notification_id` bigint NOT NULL AUTO_INCREMENT,
  `type_id` int NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text,
  `data` json DEFAULT NULL,
  `ticket_id` varchar(36) DEFAULT NULL,
  `created_by` int DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`notification_id`),
  KEY `fk_notification_type` (`type_id`),
  KEY `fk_notification_created_by` (`created_by`),
  KEY `idx_notification_ticket` (`ticket_id`),
  KEY `idx_notification_created_at` (`created_at`),
  CONSTRAINT `fk_notification_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_notification_type` FOREIGN KEY (`type_id`) REFERENCES `notification_master` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_ticket_id` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_master`
--

DROP TABLE IF EXISTS `notification_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_master` (
  `id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(64) NOT NULL,
  `name` varchar(128) NOT NULL,
  `description` varchar(512) DEFAULT NULL,
  `default_title_tpl` varchar(256) DEFAULT NULL,
  `default_message_tpl` text,
  `email_template` varchar(128) DEFAULT NULL,
  `sms_template` varchar(128) DEFAULT NULL,
  `inapp_template` varchar(128) DEFAULT NULL,
  `default_channels` json DEFAULT NULL,
  `is_active` bit(1) NOT NULL DEFAULT b'1',
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `isx_notification_master_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_master`
--

LOCK TABLES `notification_master` WRITE;
/*!40000 ALTER TABLE `notification_master` DISABLE KEYS */;
INSERT INTO `notification_master` VALUES (1,'TICKET_CREATED','Ticket Created','Triggered when a new ticket is logged in the system.','Ticket {{ticketId}} created','Hello {{recipientName}}, ticket {{ticketId}} has been created by {{initiatorName}}.','ticket_created_email.html',NULL,'ticket_created_inapp.html','[\"EMAIL\", \"IN_APP\"]',_binary '','2025-01-10 09:00:00.000000','2025-09-29 03:44:59.270447'),(2,'TICKET_STATUS_UPDATE','Ticket Status Updated','Alerts requestors when ticket status changes.','Ticket {{ticketId}} status updated','Ticket {{ticketNumber}} changed from {{oldStatus}} to {{newStatus}} by {{actorName}}.','ticket_status_update_email.html','TKT_STATUS_UPDATE','ticket_status_update_inapp.html','[\"EMAIL\", \"SMS\", \"IN_APP\"]',_binary '','2025-01-10 09:05:00.000000','2025-09-29 03:44:59.275253'),(3,'TICKET_FEEDBACK_REMINDER','Ticket Feedback Reminder','Reminder to share feedback after resolution.','Feedback pending for ticket {{ticketId}}','Hi {{recipientName}}, please provide feedback for ticket {{ticketNumber}} resolved on {{resolvedDate}}.',NULL,NULL,'ticket_feedback_inapp.html','[\"IN_APP\"]',_binary '','2025-01-10 09:10:00.000000','2025-09-29 03:44:59.277083'),(4,'TICKET_ASSIGNED','Ticket Assigned','Notifies the assignee when a ticket is assigned to them.','Ticket {{ticketId}} assigned to you','Ticket {{ticketId}} has been assigned to you by {{assignedBy}}.','ticket_assigned_email.html',NULL,'ticket_assigned_inapp.html','[\"IN_APP\"]',_binary '','2025-01-10 09:15:00.000000','2025-09-29 03:44:59.278193'),(5,'TICKET_UPDATED','Ticket Updated','Alerts requestors when key ticket details are updated, such as assignment changes.','Ticket {{ticketId}} updated','Ticket {{ticketNumber}} has been updated. {{updateMessage}}',NULL,NULL,'ticket_updated_inapp.html','[\"IN_APP\"]',_binary '','2025-01-10 09:20:00.000000','2025-09-29 03:44:59.279186'),(6,'TICKET_SLA_BREACHED','Ticket SLA Breached','Alerts assignees when an assigned ticket breaches its SLA.','Ticket {{ticketId}} breached SLA','Ticket {{ticketNumber}} has breached its SLA by {{breachedByMinutes}} minutes. Please review and take corrective action.','ticket_sla_breached_email.html',NULL,'ticket_sla_breached_inapp.html','[\"IN_APP\"]',_binary '','2025-01-10 09:25:00.000000','2025-09-29 03:44:59.280145'),(7,'TICKET_ASSIGNED_REQUESTER','Ticket Assigned - Requester','Notifies the requester when their ticket assignment is updated.','Ticket {{ticketId}} assigned to {{assigneeName}}','Hello {{recipientName}}, your ticket {{ticketId}} has been assigned to {{assigneeName}} by {{assignedBy}}.','ticket_assigned_requester_email.html',NULL,'ticket_assigned_requester_inapp.html','[\"EMAIL\", \"IN_APP\"]',_binary '','2025-01-10 09:30:00.000000','2025-09-29 03:44:59.281083');
/*!40000 ALTER TABLE `notification_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification_recipient`
--

DROP TABLE IF EXISTS `notification_recipient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_recipient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notification_id` bigint NOT NULL,
  `recipient_user_id` int NOT NULL,
  `is_read` bit(1) DEFAULT b'0',
  `read_at` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  `soft_deleted` bit(1) DEFAULT b'0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uq_nr_notification_user` (`notification_id`,`recipient_user_id`),
  KEY `idx_nr_inbox` (`recipient_user_id`,`is_read`,`created_at`),
  CONSTRAINT `fk_nr_notification` FOREIGN KEY (`notification_id`) REFERENCES `notification` (`notification_id`) ON DELETE CASCADE ON UPDATE RESTRICT,
  CONSTRAINT `fk_nr_user` FOREIGN KEY (`recipient_user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=111 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification_recipient`
--

LOCK TABLES `notification_recipient` WRITE;
/*!40000 ALTER TABLE `notification_recipient` DISABLE KEYS */;
/*!40000 ALTER TABLE `notification_recipient` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `priority_master`
--

DROP TABLE IF EXISTS `priority_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `priority_master` (
  `tp_id` varchar(2) NOT NULL,
  `tp_level` varchar(80) NOT NULL,
  `tp_description` text NOT NULL,
  `tp_weightage` tinyint unsigned NOT NULL,
  `tp_active_flg` enum('Y','N') NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`tp_id`),
  UNIQUE KEY `uq_ticket_priority_level` (`tp_level`),
  CONSTRAINT `ck_tp_weightage` CHECK ((`tp_weightage` between 1 and 10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `priority_master`
--

LOCK TABLES `priority_master` WRITE;
/*!40000 ALTER TABLE `priority_master` DISABLE KEYS */;
INSERT INTO `priority_master` VALUES ('P1','P1 | Urgent (Impacting 100% users)','Needs immediate attention; business operations halted',4,'Y'),('P2','P2 | High (Impacting more than 50% users)','Needs quick resolution; affects multiple users or processes',3,'Y'),('P3','P3 | Medium (Impacting 25% to 50% users)','Can be scheduled; affects limited users',2,'Y'),('P4','P4 | Low (Impacting single user)','No immediate impact; informational or enhancement request',1,'Y');
/*!40000 ALTER TABLE `priority_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `recommended_severity_flow`
--

DROP TABLE IF EXISTS `recommended_severity_flow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `recommended_severity_flow` (
  `recommended_severity_flow_id` bigint NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(36) NOT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `recommended_severity` varchar(50) DEFAULT NULL,
  `severity_recommended_by` varchar(100) DEFAULT NULL,
  `recommended_severity_status` varchar(50) DEFAULT NULL,
  `severity_approved_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`recommended_severity_flow_id`),
  KEY `fk_ticket_recommended_severity_flow` (`ticket_id`),
  CONSTRAINT `fk_ticket_recommended_severity_flow` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `recommended_severity_flow`
--

LOCK TABLES `recommended_severity_flow` WRITE;
/*!40000 ALTER TABLE `recommended_severity_flow` DISABLE KEYS */;
INSERT INTO `recommended_severity_flow` VALUES (1,'843d91cc-8ee6-4407-89b2-9dd9ac8b2be8','S2','Medium - S3','rnoharshv','APPROVED','itmjd'),(2,'843d91cc-8ee6-4407-89b2-9dd9ac8b2be8','S3','S4','rnoharshv','APPROVED','itmjd'),(3,'843d91cc-8ee6-4407-89b2-9dd9ac8b2be8','S4','S2','rnoharshv','PENDING',NULL),(4,'TKT-1-202510-00009','S4','S1','rnoharshv','APPROVED','itmjd'),(5,'TKT-1-202510-00008','S3','S3','rnoharshv','PENDING',NULL),(6,'TKT-1-202510-00007','S1','S4','rnoharshv','APPROVED','itmjd'),(7,'TKT-1-202510-00006','S1','S3','rnoharshv','APPROVED','itmjd'),(8,'TKT-1-202510-00011','S3','S4','rnoharshv','APPROVED','itmjd');
/*!40000 ALTER TABLE `recommended_severity_flow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `requestors`
--

DROP TABLE IF EXISTS `requestors`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requestors` (
  `requestor_id` varchar(36) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email_id` varchar(100) DEFAULT NULL,
  `mobile_no` varchar(15) DEFAULT NULL,
  `stakeholder_type` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`requestor_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `requestors`
--

LOCK TABLES `requestors` WRITE;
/*!40000 ALTER TABLE `requestors` DISABLE KEYS */;
/*!40000 ALTER TABLE `requestors` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_level`
--

DROP TABLE IF EXISTS `role_level`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_level` (
  `role_id` int NOT NULL,
  `level_ids` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`role_id`),
  CONSTRAINT `role_level_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role_permission_config` (`role_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_level`
--

LOCK TABLES `role_level` WRITE;
/*!40000 ALTER TABLE `role_level` DISABLE KEYS */;
INSERT INTO `role_level` VALUES (3,'L1'),(5,NULL),(6,NULL),(7,'L1'),(8,'L2|L3');
/*!40000 ALTER TABLE `role_level` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_permission_config`
--

DROP TABLE IF EXISTS `role_permission_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission_config` (
  `role` varchar(100) NOT NULL,
  `permissions` json NOT NULL,
  `updated_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `allowed_status_action_ids` varchar(50) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `role_id` int NOT NULL AUTO_INCREMENT,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission_config`
--

LOCK TABLES `role_permission_config` WRITE;
/*!40000 ALTER TABLE `role_permission_config` DISABLE KEYS */;
INSERT INTO `role_permission_config` VALUES ('A','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowassignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": false, \"children\": {\"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": false, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}',NULL,'2025-07-29 04:11:39',NULL,'201',1,NULL,NULL,1),('ADMIN','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowassignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": false, \"children\": {\"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": false, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-07-29 04:29:06',NULL,'201',NULL,1,NULL,NULL,2),('Helpdesk Agent','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": false, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": false, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": false, \"children\": {\"viewRCAButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": true, \"children\": {\"ticketsTable\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": true, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": true, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41','2025-08-18 06:00:31','SYSTEM','Team Lead Name 1',0,'2|3|4|5|8|9|10|15|16|18|19','Support staff mapped to L1 level',3),('Regional Nodal Officer','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": false, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": true, \"children\": {\"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": false, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41','2025-08-18 06:03:26','SYSTEM','Team Lead Name 1',0,'11|22','FCI Employee',4),('Requestor','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"children\": {\"addQnAButton\": {\"show\": true, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": true, \"children\": {\"viewRCAButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": true, \"children\": {\"ticketsTable\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": true, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41',NULL,'SYSTEM',NULL,0,'6|7|19','Person who raises a ticket',5),('System Administrator','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": false, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": false, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": false, \"children\": {\"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": false, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41',NULL,'SYSTEM',NULL,0,NULL,'System Administrator',6),('Team Lead','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"children\": {\"addQnAButton\": {\"show\": true, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": true, \"children\": {\"viewRCAButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": true, \"children\": {\"ticketsTable\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": true, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41',NULL,'SYSTEM',NULL,0,'1|2|3|4|8|9|10|15|16|17|18|19|20|21|26|27|28','Team Lead / L1 Lead',7),('Technical Team','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": false, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": false, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": false, \"children\": {\"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": true, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": true, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41','2025-08-18 06:02:41','SYSTEM','Team Lead Name 1',0,'2|3|4|5|8|9|10|15|16|18|19','Subject Matter Expert, mapped to L2 / L3 Levels',8),('IT Manager','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": false, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": false, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": false, \"children\": {\"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": false, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41','2025-09-11 09:33:16','SYSTEM',NULL,0,'12','Will approve escalation',9),('Dummy','{\"pages\": {\"show\": false, \"children\": {\"faq\": {\"show\": false, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": false, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": false, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": false, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": false, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": false, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": false, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": false, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": false, \"children\": {\"columns\": {\"show\": false, \"children\": {\"email\": {\"show\": false, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": false, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": false, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": false, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": false, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": false, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": false, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": false, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": false, \"children\": {\"comments\": {\"show\": false, \"children\": {\"editButton\": {\"show\": false, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": false, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": false, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": false, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": false, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": false, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": false, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": false, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": false, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": false, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": false, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": false, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": false, \"selectedImpact\": false, \"recommendedSeverity\": false}, \"assignedToLevel\": {\"show\": false, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": false, \"children\": {\"mode\": {\"show\": false, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": false, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": false, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": false, \"children\": {\"role\": {\"show\": false, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": false, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": false, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": false, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": false, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": false, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": false, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": false, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": false, \"children\": {\"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": false, \"children\": {\"Status History Tab\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": false, \"children\": {\"faq\": {\"show\": false, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": false, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": false, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41','2025-09-01 10:16:47','SYSTEM','Team Lead Name 1',0,'1|2|3|4|5|8|9|10|11|15|16|17|18','Dummy Role for testing',10),('Master','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"children\": {\"addQnAButton\": {\"show\": true, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": true, \"children\": {\"viewRCAButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": true, \"children\": {\"ticketsTable\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": true, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": true, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:44','2024-01-01 00:00:00','216','SYSTEM',0,'','Master template role',11),('D','{\"pages\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"children\": {\"addQnAButton\": {\"show\": false, \"metadata\": {\"name\": \"Add QnA Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"FAQ\", \"type\": \"page\"}}, \"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"page\"}}, \"myWorkload\": {\"show\": false, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"dateFilter\": {\"show\": true, \"metadata\": {\"name\": \"Date Filter\", \"type\": \"filter\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"ticketsTable\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}, \"Allow Assignment\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"allowAssignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Workload\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"severity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Severity\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"recommendSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommend Severity\"}}, \"recommendedSeverity\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Recommended Severity\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"ticketView\": {\"show\": true, \"children\": {\"viewRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"View RCA Button\"}}, \"submitRCAButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Submit RCA Button\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket View\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}, \"rootCauseAnalysis\": {\"show\": false, \"children\": {\"ticketsTable\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Tickets Table\"}}}, \"metadata\": {\"name\": \"Root Cause Analysis\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"rca\": {\"show\": false, \"metadata\": {\"name\": \"Root Cause Analysis\", \"type\": \"menu\"}}, \"addUser\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Add User\", \"type\": \"menu\"}}, \"dashboard\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Dashboard\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"myWorkload\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"My Workload\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-10-30 07:06:41','2025-10-24 09:31:25','SYSTEM','Team Lead Name 1',0,'2','D',12);
/*!40000 ALTER TABLE `role_permission_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` varchar(100) NOT NULL,
  `role_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES ('admin','Admin'),('helpdesk','Helpdesk'),('master','Master');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `root_cause_analysis`
--

DROP TABLE IF EXISTS `root_cause_analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `root_cause_analysis` (
  `rca_id` varchar(36) NOT NULL,
  `ticket_id` varchar(36) NOT NULL,
  `severity_id` varchar(10) DEFAULT NULL,
  `description_of_cause` text,
  `resolution_description` text,
  `attachment_paths` text,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rca_id`),
  UNIQUE KEY `uk_root_cause_ticket` (`ticket_id`),
  CONSTRAINT `fk_root_cause_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `root_cause_analysis`
--

LOCK TABLES `root_cause_analysis` WRITE;
/*!40000 ALTER TABLE `root_cause_analysis` DISABLE KEYS */;
/*!40000 ALTER TABLE `root_cause_analysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `severity_master`
--

DROP TABLE IF EXISTS `severity_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `severity_master` (
  `ts_id` varchar(2) NOT NULL,
  `ts_level` varchar(40) NOT NULL,
  `ts_description` text NOT NULL,
  `ts_weightage` tinyint unsigned NOT NULL,
  `ts_active_flg` enum('Y','N') NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`ts_id`),
  UNIQUE KEY `uq_ticket_severity_level` (`ts_level`),
  CONSTRAINT `ck_ts_weightage` CHECK ((`ts_weightage` between 1 and 10))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `severity_master`
--

LOCK TABLES `severity_master` WRITE;
/*!40000 ALTER TABLE `severity_master` DISABLE KEYS */;
INSERT INTO `severity_master` VALUES ('S1','Critical - S1','Complete system outage or major functionality failure affecting business continuity',4,'Y'),('S2','High - S2','Major functionality impacted, but workaround exists',3,'Y'),('S3','Medium - S3','Partial functionality affected, minimal business impact',2,'Y'),('S4','Low - S4','Minor issue, cosmetic or informational',1,'Y');
/*!40000 ALTER TABLE `severity_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sla_config`
--

DROP TABLE IF EXISTS `sla_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sla_config` (
  `sla_id` varchar(36) NOT NULL,
  `severity_level` varchar(10) NOT NULL,
  `response_minutes` bigint DEFAULT NULL,
  `resolution_minutes` bigint DEFAULT NULL,
  PRIMARY KEY (`sla_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sla_config`
--

LOCK TABLES `sla_config` WRITE;
/*!40000 ALTER TABLE `sla_config` DISABLE KEYS */;
INSERT INTO `sla_config` VALUES ('SLA-S1','S1',30,10),('SLA-S2','S2',60,8),('SLA-S3','S3',120,4),('SLA-S4','S4',180,2);
/*!40000 ALTER TABLE `sla_config` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholder`
--

DROP TABLE IF EXISTS `stakeholder`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stakeholder` (
  `stakeholder_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) NOT NULL,
  `sg_id` int NOT NULL,
  `is_active` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`stakeholder_id`),
  KEY `fk_stakeholder_group` (`sg_id`),
  CONSTRAINT `fk_stakeholder_group` FOREIGN KEY (`sg_id`) REFERENCES `stakeholder_group` (`sg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholder`
--

LOCK TABLES `stakeholder` WRITE;
/*!40000 ALTER TABLE `stakeholder` DISABLE KEYS */;
INSERT INTO `stakeholder` VALUES (1,'FCI Users',1,'Y'),(2,'Contractors',2,'Y'),(3,'Millers',2,'Y'),(4,'Farmer',2,'Y'),(5,'State Agencies',2,'Y'),(6,'Helpdesk Support',3,'Y'),(7,'Helpdesk Admin',3,'Y');
/*!40000 ALTER TABLE `stakeholder` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stakeholder_group`
--

DROP TABLE IF EXISTS `stakeholder_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stakeholder_group` (
  `sg_id` int NOT NULL AUTO_INCREMENT,
  `description` varchar(100) NOT NULL,
  `is_active` char(1) NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`sg_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stakeholder_group`
--

LOCK TABLES `stakeholder_group` WRITE;
/*!40000 ALTER TABLE `stakeholder_group` DISABLE KEYS */;
INSERT INTO `stakeholder_group` VALUES (1,'Internal','Y'),(2,'External','Y'),(3,'Helpdesk','Y');
/*!40000 ALTER TABLE `stakeholder_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status_history`
--

DROP TABLE IF EXISTS `status_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_history` (
  `status_history_id` varchar(36) NOT NULL,
  `ticket_id` varchar(36) NOT NULL,
  `updated_by` varchar(100) NOT NULL,
  `previous_status` varchar(50) DEFAULT NULL,
  `current_status` varchar(50) DEFAULT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  `sla_flag` tinyint DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`status_history_id`),
  KEY `fk_ticket_status_history` (`ticket_id`),
  CONSTRAINT `fk_ticket_status_history` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_history`
--

LOCK TABLES `status_history` WRITE;
/*!40000 ALTER TABLE `status_history` DISABLE KEYS */;
INSERT INTO `status_history` VALUES ('f89c529e-cac0-4acb-9601-34dfa165ec98','TKT-1-202510-00001','teaml1',NULL,'1','2025-10-30 11:51:28',0,NULL);
/*!40000 ALTER TABLE `status_history` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `status_master`
--

DROP TABLE IF EXISTS `status_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `status_master` (
  `status_id` int NOT NULL,
  `status_name` varchar(100) DEFAULT NULL,
  `label` varchar(50) DEFAULT NULL,
  `status_code` varchar(50) DEFAULT NULL,
  `sla_flag` tinyint(1) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `color` varchar(7) DEFAULT NULL,
  PRIMARY KEY (`status_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `status_master`
--

LOCK TABLES `status_master` WRITE;
/*!40000 ALTER TABLE `status_master` DISABLE KEYS */;
INSERT INTO `status_master` VALUES (1,'Open (New)','Open','OPEN',0,'The ticket has been created but not yet assigned','#2196F3'),(2,'Assigned (In Progress)','Assigned','ASSIGNED',1,'The ticket has been assigned to a support agent or team','#9C27B0'),(3,'On Hold (Pending with Requester)','On Hold','PENDING_WITH_REQUESTER',0,'Waiting for additional information from the requester','#FFC107'),(4,'On Hold (Pending with Service Provider)','On Hold','PENDING_WITH_SERVICE_PROVIDER',1,'Waiting for additional information/ resolution from the third-party service provider','#FF9800'),(5,'On Hold (Pending with FCI)','On Hold','PENDING_WITH_FCI',0,'Waiting for resolution from FCI or its empanelled vendors','#FFB74D'),(6,'Awaiting Escalation Approval','Awaiting Approval','AWAITING_ESCALATION_APPROVAL',0,'Resolution or action requires managerial approval before proceeding','#E91E63'),(7,'Resolved','Resolved','RESOLVED',0,'The issue has been fixed, but the ticket remains open for confirmation from the requester','#4CAF50'),(8,'Closed','Closed','CLOSED',0,'The ticket has been resolved and confirmed by the requester or automatically closed after a period of inactivity','#607D8B'),(9,'Cancelled','Cancelled','CANCELLED',0,'The ticket was withdrawn by the requester or deemed invalid','#F44336'),(10,'Reopened','Reopened','REOPENED',0,'A previously resolved ticket has been reopened due to recurrence or incomplete resolution','#3F51B5'),(11,'Escalated','Escalated','ESCALATED',0,'New severity can be recommended by some designated users','#FF5722');
/*!40000 ALTER TABLE `status_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_categories`
--

DROP TABLE IF EXISTS `sub_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_categories` (
  `sub_category_id` varchar(36) NOT NULL,
  `sub_category` varchar(100) NOT NULL,
  `description` text,
  `created_by` varchar(100) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category_id` varchar(36) DEFAULT NULL,
  `severity_id` varchar(3) DEFAULT 'S4',
  `is_active` enum('Y','N') NOT NULL DEFAULT 'Y',
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`sub_category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `sub_categories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_categories`
--

LOCK TABLES `sub_categories` WRITE;
/*!40000 ALTER TABLE `sub_categories` DISABLE KEYS */;
INSERT INTO `sub_categories` VALUES ('10001','<Given By User>','<Given By User>',NULL,'2025-08-20 05:03:57','10','S4','Y','2025-08-20 05:03:57',NULL),('1001','Entire application not available','Entire application not available',NULL,'2025-08-20 05:03:57','1','S1','Y','2025-08-20 05:03:57',NULL),('1002','SMS gateway not working','SMS gateway not working',NULL,'2025-08-20 05:03:57','1','S2','Y','2025-08-20 05:03:57',NULL),('1003','E-Mail gateway not working','E-Mail gateway not working',NULL,'2025-08-20 05:03:57','1','S2','Y','2025-08-20 05:03:57',NULL),('1004','System Slow response','System Slow response',NULL,'2025-08-20 05:03:57','1','S3','Y','2025-08-20 05:03:57',NULL),('2001','Login Issues','Login Issues',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('2002','Mail not received while resetting Password','Mail not received while resetting Password',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('2003','OTP not received during login','OTP not received during login',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('2004','Account Locked','Account Locked',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('2005','Password Reset Issue','Password Reset Issue',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('2006','Role-based access (Role assignment issue)','Role-based access (Role assignment issue)',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('2007','Incorrect Permissions','Incorrect Permissions',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('2008','MFA (Multi-Factor Authentication) Problems','MFA (Multi-Factor Authentication) Problems',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('2009','SSO Authentication Problem','SSO Authentication Problem',NULL,'2025-08-20 05:03:57','2','S4','Y','2025-08-20 05:03:57',NULL),('3001','Data Entry Errors','Data Entry Errors',NULL,'2025-08-20 05:03:57','3','S4','Y','2025-08-20 05:03:57',NULL),('3002','Data loss/corruption','Data loss/corruption',NULL,'2025-08-20 05:03:57','3','S1','Y','2025-08-20 05:03:57',NULL),('3003','Data Synchronization Issues','Data Synchronization Issues',NULL,'2025-08-20 05:03:57','3','S2','Y','2025-08-20 05:03:57',NULL),('4001','Mobile android application downloading issue','Mobile android application downloading issue',NULL,'2025-08-20 05:03:57','4','S3','Y','2025-08-20 05:03:57',NULL),('4002','Mobile IOS application downloading issue','Mobile IOS application downloading issue',NULL,'2025-08-20 05:03:57','4','S3','Y','2025-08-20 05:03:57',NULL),('4003','Unable to login in Mobile application','Unable to login in Mobile application',NULL,'2025-08-20 05:03:57','4','S4','Y','2025-08-20 05:03:57',NULL),('5001','Unable to generate Token','Unable to generate Token',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5002','Unable to generate Gatepass','Unable to generate Gatepass',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5003','Weighbridge is integrated but unable to record the weight','Weighbridge is integrated but unable to record the weight',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5004','Unable to record quality parameters','Unable to record quality parameters',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5005','Unable to record no. of bags/weight (during unloading)','Unable to record no. of bags/weight (during unloading)',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5006','Unable to record no. of bags/weight (during loading)','Unable to record no. of bags/weight (during loading)',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5007','System displaying wrong calculations','System displaying wrong calculations',NULL,'2025-08-20 05:03:57','5','S1','Y','2025-08-20 05:03:57',NULL),('5008','Unable to generate WCM','Unable to generate WCM',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5009','Unable to generate Truckchit','Unable to generate Truckchit',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5010','Unable to generate Release Order (RO)','Unable to generate Release Order (RO)',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5011','Not able to view Release Order (RO)','Not able to view Release Order (RO)',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('5012','Unable to view or download the report','Unable to view or download the report',NULL,'2025-08-20 05:03:57','5','S3','Y','2025-08-20 05:03:57',NULL),('6001','Workflows not functioning as desired','Workflows not functioning as desired',NULL,'2025-08-20 05:03:57','6','S1','Y','2025-08-20 05:03:57',NULL),('7001','API Failures','API Failures',NULL,'2025-08-20 05:03:57','7','S1','Y','2025-08-20 05:03:57',NULL),('7002','Data Mapping Errors','Data Mapping Errors',NULL,'2025-08-20 05:03:57','7','S1','Y','2025-08-20 05:03:57',NULL),('7003','Sync Delays Between Systems','Sync Delays Between Systems',NULL,'2025-08-20 05:03:57','7','S2','Y','2025-08-20 05:03:57',NULL),('7004','Data Sync Problems','Data Sync Problems',NULL,'2025-08-20 05:03:57','7','S1','Y','2025-08-20 05:03:57',NULL),('7005','Certificate Expiry or Authentication Failures','Certificate Expiry or Authentication Failures',NULL,'2025-08-20 05:03:57','7','S1','Y','2025-08-20 05:03:57',NULL),('8001','Dashboard Not Loading','Dashboard Not Loading',NULL,'2025-08-20 05:03:57','8','S3','Y','2025-08-20 05:03:57',NULL),('8002','Data Discrepancies','Data Discrepancies',NULL,'2025-08-20 05:03:57','8','S1','Y','2025-08-20 05:03:57',NULL),('8003','Report Scheduling Failures','Report Scheduling Failures',NULL,'2025-08-20 05:03:57','8','S3','Y','2025-08-20 05:03:57',NULL),('8004','KPI Calculation Errors','KPI Calculation Errors',NULL,'2025-08-20 05:03:57','8','S1','Y','2025-08-20 05:03:57',NULL),('9001','Error message is not clear','Error message is not clear',NULL,'2025-08-20 05:03:57','9','S4','Y','2025-08-20 05:03:57',NULL),('9002','usability improvement','usability improvement',NULL,'2025-08-20 05:03:57','9','S4','Y','2025-08-20 05:03:57',NULL),('9003','Minor change on User Interace (UI)','Minor change on User Interace (UI)',NULL,'2025-08-20 05:03:57','9','S4','Y','2025-08-20 05:03:57',NULL);
/*!40000 ALTER TABLE `sub_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sync_metadata`
--

DROP TABLE IF EXISTS `sync_metadata`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sync_metadata` (
  `key` varchar(100) NOT NULL,
  `value` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sync_metadata`
--

LOCK TABLES `sync_metadata` WRITE;
/*!40000 ALTER TABLE `sync_metadata` DISABLE KEYS */;
/*!40000 ALTER TABLE `sync_metadata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_categories`
--

DROP TABLE IF EXISTS `ticket_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_categories` (
  `id` varchar(36) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_categories`
--

LOCK TABLES `ticket_categories` WRITE;
/*!40000 ALTER TABLE `ticket_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_comments`
--

DROP TABLE IF EXISTS `ticket_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_comments` (
  `id` varchar(36) NOT NULL,
  `comment` text,
  `created_at` datetime DEFAULT NULL,
  `ticket_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `ticket_id_idx` (`ticket_id`),
  CONSTRAINT `ticket_comments_ibfk` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_comments`
--

LOCK TABLES `ticket_comments` WRITE;
/*!40000 ALTER TABLE `ticket_comments` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_feedback`
--

DROP TABLE IF EXISTS `ticket_feedback`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_feedback` (
  `feedback_id` bigint NOT NULL AUTO_INCREMENT,
  `ticket_id` varchar(36) NOT NULL,
  `submitted_by` varchar(36) DEFAULT NULL,
  `submitted_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `overall_satisfaction` tinyint NOT NULL,
  `resolution_effectiveness` tinyint NOT NULL,
  `communication_support` tinyint NOT NULL,
  `timeliness` tinyint NOT NULL,
  `comments` text,
  PRIMARY KEY (`feedback_id`),
  UNIQUE KEY `uq_ticket_feedback_one_per_ticket` (`ticket_id`),
  CONSTRAINT `fk_feedback_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`) ON DELETE CASCADE,
  CONSTRAINT `chk_feedback_range_comm_support` CHECK ((`communication_support` between 1 and 5)),
  CONSTRAINT `chk_feedback_range_overall` CHECK ((`overall_satisfaction` between 1 and 5)),
  CONSTRAINT `chk_feedback_range_resolution_effective` CHECK ((`resolution_effectiveness` between 1 and 5)),
  CONSTRAINT `chk_feedback_range_timeliness` CHECK ((`timeliness` between 1 and 5))
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_feedback`
--

LOCK TABLES `ticket_feedback` WRITE;
/*!40000 ALTER TABLE `ticket_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_feedback` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_sequences`
--

DROP TABLE IF EXISTS `ticket_sequences`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_sequences` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `mode_id` varchar(50) NOT NULL,
  `sequence_date` date NOT NULL,
  `last_value` bigint NOT NULL DEFAULT '0',
  `version` bigint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_ticket_sequences_mode_date` (`mode_id`,`sequence_date`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_sequences`
--

LOCK TABLES `ticket_sequences` WRITE;
/*!40000 ALTER TABLE `ticket_sequences` DISABLE KEYS */;
INSERT INTO `ticket_sequences` VALUES (4,'GLOBAL','2025-10-01',1,0);
/*!40000 ALTER TABLE `ticket_sequences` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_sla`
--

DROP TABLE IF EXISTS `ticket_sla`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_sla` (
  `ticket_sla_id` varchar(36) NOT NULL,
  `ticket_id` varchar(36) NOT NULL,
  `sla_id` varchar(36) NOT NULL,
  `due_at` datetime DEFAULT NULL,
  `actual_due_at` datetime DEFAULT NULL,
  `due_at_after_escalation` datetime DEFAULT NULL,
  `resolution_time_minutes` bigint DEFAULT NULL,
  `elapsed_time_minutes` bigint DEFAULT NULL,
  `response_time_minutes` bigint DEFAULT NULL,
  `breached_by_minutes` bigint DEFAULT NULL,
  `idle_time_minutes` bigint DEFAULT NULL,
  PRIMARY KEY (`ticket_sla_id`),
  KEY `fk_ticket_sla_ticket` (`ticket_id`),
  KEY `fk_ticket_sla_sla` (`sla_id`),
  CONSTRAINT `fk_ticket_sla_sla` FOREIGN KEY (`sla_id`) REFERENCES `sla_config` (`sla_id`),
  CONSTRAINT `fk_ticket_sla_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_sla`
--

LOCK TABLES `ticket_sla` WRITE;
/*!40000 ALTER TABLE `ticket_sla` DISABLE KEYS */;
INSERT INTO `ticket_sla` VALUES ('c2c04f5a-24f2-45b3-8290-eb3055fd5708','TKT-1-202510-00001','SLA-S1','2025-10-30 13:10:00','2025-10-30 13:10:00',NULL,0,0,0,-10,0);
/*!40000 ALTER TABLE `ticket_sla` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_status_workflow`
--

DROP TABLE IF EXISTS `ticket_status_workflow`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_status_workflow` (
  `TSW_Id` int NOT NULL,
  `TSW_Action` varchar(255) DEFAULT NULL,
  `TSW_Current_Status` int DEFAULT NULL,
  `TSW_Next_Status` int DEFAULT NULL,
  PRIMARY KEY (`TSW_Id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_status_workflow`
--

LOCK TABLES `ticket_status_workflow` WRITE;
/*!40000 ALTER TABLE `ticket_status_workflow` DISABLE KEYS */;
INSERT INTO `ticket_status_workflow` VALUES (1,'Assign',1,2),(2,'Cancel/ Reject',1,9),(3,'Assign Further',2,2),(4,'On Hold (Pending with Requester)',2,3),(5,'Resolve',2,7),(6,'Close',7,8),(7,'Reopen',7,10),(8,'Assign',10,2),(9,'Assign / Assign Further',3,2),(10,'Assign / Assign Further',4,2),(11,'Recommend Escalation',2,6),(12,'Approve Escalation',6,11),(15,'On Hold (Pending with Service Provider)',2,4),(16,'On Hold (Pending with FCI)',2,5),(17,'Assign',11,2),(18,'Assign / Assign Further',7,2),(19,'Resume',3,2),(20,'Resume',4,2),(21,'Resume',5,2),(22,'Recommend Escalation',1,6),(23,'On Hold (Pending with Requester)',1,3),(24,'On Hold (Pending with Service Provider)',1,4),(25,'On Hold (Pending with FCI)',1,5),(26,'Resume',3,1),(27,'Resume',4,1),(28,'Resume',5,1);
/*!40000 ALTER TABLE `ticket_status_workflow` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `ticket_id` varchar(36) NOT NULL,
  `reported_date` datetime DEFAULT NULL,
  `mode` enum('Email','Self','Call') DEFAULT NULL,
  `mode_id` varchar(10) DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `requestor_name` varchar(100) DEFAULT NULL,
  `requestor_email_id` varchar(100) DEFAULT NULL,
  `requestor_mobile_no` varchar(15) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `sub_category` varchar(100) DEFAULT NULL,
  `priority` enum('Critical','High','Medium','Low','P1','P2','P3','P4') NOT NULL,
  `is_master` tinyint(1) DEFAULT NULL,
  `master_id` varchar(36) DEFAULT NULL,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT NULL,
  `assigned_to_level` varchar(20) DEFAULT NULL,
  `level_id` varchar(20) DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `assigned_by` varchar(50) DEFAULT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `recommended_severity` varchar(50) DEFAULT NULL,
  `severity_recommended_by` varchar(100) DEFAULT NULL,
  `impact` varchar(50) DEFAULT NULL,
  `stakeholder` varchar(50) DEFAULT NULL,
  `status_id` varchar(36) DEFAULT NULL,
  `resolved_at` datetime DEFAULT NULL,
  `feedback_status` enum('PENDING','PROVIDED','NOT_PROVIDED') DEFAULT 'PENDING',
  `updated_by` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `idx_tickets_mode_id` (`mode_id`),
  KEY `master_id` (`master_id`),
  CONSTRAINT `fk_tickets_mode_master` FOREIGN KEY (`mode_id`) REFERENCES `mode_master` (`mode_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`master_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES ('TKT-1-202510-00001','2025-10-30 11:51:27','Self','1','216','teaml1','team.lead1@example.com','1212121212','Testing ','Db on 10.0.78.54\r\n ','1','1001','P1',0,NULL,'2025-10-30 06:21:27','OPEN',NULL,NULL,NULL,'teaml1','S1',NULL,NULL,NULL,'6|7','1',NULL,NULL,'teaml1');
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `uploaded_files`
--

DROP TABLE IF EXISTS `uploaded_files`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `uploaded_files` (
  `uploaded_file_id` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_extension` varchar(50) DEFAULT NULL,
  `relative_path` varchar(512) NOT NULL,
  `uploaded_by` varchar(100) DEFAULT NULL,
  `ticket_id` varchar(36) NOT NULL,
  `uploaded_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_active` enum('Y','N') NOT NULL DEFAULT 'Y',
  PRIMARY KEY (`uploaded_file_id`),
  KEY `fk_uploaded_files_ticket` (`ticket_id`),
  CONSTRAINT `fk_uploaded_files_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `uploaded_files`
--

LOCK TABLES `uploaded_files` WRITE;
/*!40000 ALTER TABLE `uploaded_files` DISABLE KEYS */;
/*!40000 ALTER TABLE `uploaded_files` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_levels`
--

DROP TABLE IF EXISTS `user_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_levels` (
  `user_id` int NOT NULL,
  `level_id` int NOT NULL,
  `level_ids` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`user_id`,`level_id`),
  KEY `level_id` (`level_id`),
  CONSTRAINT `fk_user_levels_level_str` FOREIGN KEY (`level_id`) REFERENCES `levels` (`level_id`),
  CONSTRAINT `user_levels_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`),
  CONSTRAINT `user_levels_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `levels` (`level_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_levels`
--

LOCK TABLES `user_levels` WRITE;
/*!40000 ALTER TABLE `user_levels` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` int NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email_id` varchar(100) DEFAULT NULL,
  `mobile_no` varchar(15) DEFAULT NULL,
  `office` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `roles` varchar(255) DEFAULT NULL,
  `stakeholder` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (201,'Arjun Mehta','arjun.mehta@example.com','9123456780',NULL,'arjunm','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','ADMIN','7'),(202,'Bhavya Rao','bhavya.rao@example.com','9123456781',NULL,'bhavyar','admin123','2','6'),(203,'Chirag Shah','chirag.shah@example.com','9123456782',NULL,'chirags','admin123','5','2'),(204,'Divya Kapoor','divya.kapoor@example.com','9123456783',NULL,'divyak','admin123','2','6'),(205,'Esha Singh','esha.singh@example.com','9123456784',NULL,'eshas','admin123','5','2'),(206,'Farhan Ali','farhan.ali@example.com','9123456785',NULL,'farhana','admin123','1','6'),(207,'Garima Jain','garima.jain@example.com','9123456786',NULL,'garimaj','admin123','3','6'),(208,'RNO Harsh Verma','harsh.verma@example.com','9123456787',NULL,'rnoharshv','admin123','4','6'),(209,'Ishaan Malhotra','ishaan.m@example.com','9123456788',NULL,'ishaanm','admin123','6','6'),(210,'Jaya Nair','jaya.nair@example.com','9123456789',NULL,'jayan','admin123','5|7','6|7'),(211,'Guest Account','guest@example.com','6135712345',NULL,'guest','admin123','5','1'),(212,'Kevin Brooks','kevin.brooks@example.com','9123456790',NULL,'kevinb','admin123','8','6'),(213,'Lara Singh','lara.singh@example.com','9123456791',NULL,'laras','admin123','5|7|8','6|7'),(214,'Mohan Kumar','mohan.kumar@example.com','9123456792',NULL,'mohank','admin123','ADMIN','7'),(215,'User Name','user.name@example.com','1111111111',NULL,'usern','admin123','USER','1'),(216,'Team Lead Name 1','team.lead1@example.com','1212121212',NULL,'teaml1','admin123','5|7','6|7'),(217,'ITM John Doe','itm.johndoe@example.com','2222222222',NULL,'itmjd','admin123','9','6'),(301,'fci Aditi Sharma','fci.aditi.sharma@example.com','9123000001','New Delhi','fciaditi','admin123','USER','1'),(302,'fci Bharat Kumar','fci.bharat.kumar@example.com','9123000002','Lucknow','fcibharat','admin123','USER','1'),(303,'fci Charu Patel','fci.charu.patel@example.com','9123000003','Chandigarh','fcicharu','admin123','USER','1'),(304,'fci Deepak Verma','fci.deepak.verma@example.com','9123000004','Hyderabad','fcideepak','admin123','USER','1');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `users_view`
--

DROP TABLE IF EXISTS `users_view`;
/*!50001 DROP VIEW IF EXISTS `users_view`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `users_view` AS SELECT 
 1 AS `id`,
 1 AS `username`,
 1 AS `name`,
 1 AS `role`,
 1 AS `password`,
 1 AS `permissions`,
 1 AS `homedir`*/;
SET character_set_client = @saved_cs_client;

--
-- Final view structure for view `users_view`
--

/*!50001 DROP VIEW IF EXISTS `users_view`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `users_view` AS select `e`.`user_id` AS `id`,`e`.`username` AS `username`,`e`.`name` AS `name`,(select `l`.`level_name` from (`user_levels` `el` join `levels` `l` on(((`el`.`level_id` = `l`.`level_id`) and (`el`.`user_id` = `e`.`user_id`)))) order by `l`.`level_id` desc limit 1) AS `role`,`e`.`password` AS `password`,`fu`.`permissions` AS `permissions`,`fu`.`homedir` AS `homedir` from (`users` `e` join `filegator_users` `fu` on((`fu`.`user_id` = `e`.`user_id`))) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-30 14:19:34
