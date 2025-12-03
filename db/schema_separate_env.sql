CREATE DATABASE  IF NOT EXISTS `ticketing_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ticketing_system`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: ticketing_system
-- ------------------------------------------------------
-- Server version	8.0.41

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
-- Table structure for table `client_credentials`
--

DROP TABLE IF EXISTS `client_credentials`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_credentials` (
  `id` varchar(36) NOT NULL,
  `client_id` varchar(100) NOT NULL,
  `client_secret_hash` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_credentials_client_id_uindex` (`client_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `client_tokens`
--

DROP TABLE IF EXISTS `client_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_tokens` (
  `id` varchar(36) NOT NULL,
  `client_credential_id` varchar(36) NOT NULL,
  `access_token_hash` varchar(255) NOT NULL,
  `refresh_token_hash` varchar(255) DEFAULT NULL,
  `access_token_expires_at` datetime NOT NULL,
  `refresh_token_expires_at` datetime DEFAULT NULL,
  `issued_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `revoked_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `client_tokens_access_token_hash_uindex` (`access_token_hash`),
  KEY `client_tokens_client_credential_id_index` (`client_credential_id`),
  KEY `client_tokens_refresh_token_hash_index` (`refresh_token_hash`),
  CONSTRAINT `client_tokens_client_credential_id_fk` FOREIGN KEY (`client_credential_id`) REFERENCES `client_credentials` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `district_master`
--

DROP TABLE IF EXISTS `district_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `district_master` (
  `district_code` varchar(10) NOT NULL,
  `district_name` varchar(100) NOT NULL,
  `hrms_reg_code` varchar(10) NOT NULL,
  PRIMARY KEY (`district_code`),
  KEY `idx_district_hrms_reg_code` (`hrms_reg_code`),
  CONSTRAINT `fk_district_region_hrms` FOREIGN KEY (`hrms_reg_code`) REFERENCES `region_master` (`hrms_reg_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `filegator_users`
--

DROP TABLE IF EXISTS `filegator_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `filegator_users` (
  `user_id` varchar(100) NOT NULL,
  `permissions` varchar(200) NOT NULL DEFAULT '',
  `homedir` varchar(2000) NOT NULL DEFAULT '/',
  PRIMARY KEY (`user_id`),
  CONSTRAINT `filegator_users_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `headquarter_master`
--

DROP TABLE IF EXISTS `headquarter_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `headquarter_master` (
  `headquarter_code` varchar(10) NOT NULL,
  `headquarter_name` varchar(100) NOT NULL,
  `hrms_headquarter_code` varchar(10) NOT NULL,
  PRIMARY KEY (`headquarter_code`),
  UNIQUE KEY `uk_headquarter_hrms_code` (`hrms_headquarter_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  PRIMARY KEY (`notification_id`),
  KEY `fk_notification_type` (`type_id`),
  KEY `fk_notification_created_by` (`created_by`),
  KEY `idx_notification_ticket` (`ticket_id`),
  KEY `idx_notification_created_at` (`created_at`),
  CONSTRAINT `fk_notification_created_by` FOREIGN KEY (`created_by`) REFERENCES `users` (`user_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `fk_notification_type` FOREIGN KEY (`type_id`) REFERENCES `notification_master` (`id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `notification_recipient`
--

DROP TABLE IF EXISTS `notification_recipient`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification_recipient` (
  `id` int NOT NULL AUTO_INCREMENT,
  `notification_id` bigint NOT NULL,
  `recipient_user_id` varchar(100) NOT NULL,
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
-- Table structure for table `region_master`
--

DROP TABLE IF EXISTS `region_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `region_master` (
  `region_code` varchar(10) NOT NULL,
  `region_name` varchar(100) NOT NULL,
  `hrms_reg_code` varchar(10) NOT NULL,
  `zone_code` varchar(10) NOT NULL,
  `hrms_zone_code` varchar(10) NOT NULL,
  PRIMARY KEY (`region_code`),
  UNIQUE KEY `uk_region_hrms_code` (`hrms_reg_code`),
  KEY `idx_region_zone_code` (`zone_code`),
  KEY `idx_region_hrms_zone_code` (`hrms_zone_code`),
  CONSTRAINT `fk_region_hrms_zone_code` FOREIGN KEY (`hrms_zone_code`) REFERENCES `zone_master` (`hrms_zone_code`),
  CONSTRAINT `fk_region_zone_code` FOREIGN KEY (`zone_code`) REFERENCES `zone_master` (`zone_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `requester_users`
--

DROP TABLE IF EXISTS `requester_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `requester_users` (
  `requester_user_id` varchar(100) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `email_id` varchar(100) DEFAULT NULL,
  `mobile_no` varchar(15) DEFAULT NULL,
  `office` varchar(100) DEFAULT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `roles` varchar(255) DEFAULT NULL,
  `stakeholder` varchar(50) DEFAULT NULL,
  `first_name` varchar(100) DEFAULT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `last_name` varchar(100) DEFAULT NULL,
  `date_of_joining` datetime DEFAULT NULL,
  `date_of_retirement` datetime DEFAULT NULL,
  `office_type` varchar(20) DEFAULT NULL,
  `office_code` varchar(20) DEFAULT NULL,
  `zone_code` varchar(2) DEFAULT NULL,
  `district_code` varchar(6) DEFAULT NULL,
  `region_code` varchar(3) DEFAULT NULL,
  PRIMARY KEY (`requester_user_id`),
  UNIQUE KEY `requester_username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `rno_appointed_users`
--

DROP TABLE IF EXISTS `rno_appointed_users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rno_appointed_users` (
  `rno_appointed_user_id` varchar(100) NOT NULL,
  `requester_user_id` varchar(100) NOT NULL,
  `office_code` varchar(20) DEFAULT NULL,
  `office_type` varchar(20) DEFAULT NULL,
  `region_code` varchar(3) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_by` varchar(100) DEFAULT NULL,
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`rno_appointed_user_id`),
  KEY `rno_appointed_users_requester_idx` (`requester_user_id`),
  CONSTRAINT `rno_appointed_users_requester_fk` FOREIGN KEY (`requester_user_id`) REFERENCES `requester_users` (`requester_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rno_appointed_users_history`
--

DROP TABLE IF EXISTS `rno_appointed_users_history`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rno_appointed_users_history` (
  `rno_appointed_user_history_id` varchar(100) NOT NULL,
  `rno_appointed_user_id` varchar(100) DEFAULT NULL,
  `requester_user_id` varchar(100) DEFAULT NULL,
  `office_code` varchar(20) DEFAULT NULL,
  `office_type` varchar(20) DEFAULT NULL,
  `region_code` varchar(3) DEFAULT NULL,
  `active` tinyint(1) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_on` datetime DEFAULT NULL,
  `updated_by` varchar(100) DEFAULT NULL,
  `updated_on` datetime DEFAULT NULL,
  `history_recorded_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`rno_appointed_user_history_id`),
  KEY `rno_appointed_users_history_requester_idx` (`requester_user_id`),
  KEY `rno_appointed_users_history_parent_idx` (`rno_appointed_user_id`),
  CONSTRAINT `rno_appointed_users_history_parent_fk` FOREIGN KEY (`rno_appointed_user_id`) REFERENCES `rno_appointed_users` (`rno_appointed_user_id`),
  CONSTRAINT `rno_appointed_users_history_requester_fk` FOREIGN KEY (`requester_user_id`) REFERENCES `requester_users` (`requester_user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
  `office` varchar(100) DEFAULT NULL,
  `office_code` varchar(100) DEFAULT NULL,
  `district_code` varchar(50) DEFAULT NULL,
  `zone_code` varchar(50) DEFAULT NULL,
  `region_code` varchar(50) DEFAULT NULL,
  `region_name` varchar(255) DEFAULT NULL,
  `district_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ticket_id`),
  KEY `idx_tickets_mode_id` (`mode_id`),
  KEY `master_id` (`master_id`),
  CONSTRAINT `fk_tickets_mode_master` FOREIGN KEY (`mode_id`) REFERENCES `mode_master` (`mode_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`master_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

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
-- Table structure for table `user_levels`
--

DROP TABLE IF EXISTS `user_levels`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_levels` (
  `user_id` varchar(100) NOT NULL,
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
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `user_id` varchar(100) NOT NULL,
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
-- Table structure for table `user_refresh_tokens`
--

DROP TABLE IF EXISTS `user_refresh_tokens`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_refresh_tokens` (
  `id` varchar(36) NOT NULL,
  `user_id` varchar(100) NOT NULL,
  `refresh_token_hash` varchar(255) NOT NULL,
  `expires_at` datetime NOT NULL,
  `issued_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_user_refresh_tokens_user` (`user_id`),
  CONSTRAINT `fk_user_refresh_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `zone_master`
--

DROP TABLE IF EXISTS `zone_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `zone_master` (
  `zone_code` varchar(10) NOT NULL,
  `zone_name` varchar(100) NOT NULL,
  `hrms_zone_code` varchar(10) NOT NULL,
  PRIMARY KEY (`zone_code`),
  UNIQUE KEY `uk_zone_hrms_code` (`hrms_zone_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
