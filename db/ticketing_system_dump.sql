CREATE DATABASE  IF NOT EXISTS `ticketing_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ticketing_system`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ticketing_system
-- ------------------------------------------------------
-- Server version	8.0.42

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
INSERT INTO `assignment_history` VALUES ('015996d6-14a5-4776-a16c-7d32dfddeb56','100','teaml1','eshas',NULL,'2025-08-05 17:19:38',NULL),('1','1','admin','agent1',NULL,'2025-06-24 12:00:00',NULL),('14c4a238-517c-4f42-9b67-4a849a150b4d','110','teaml1','harshv',NULL,'2025-08-01 15:37:18',NULL),('23a3d665-0642-4d3a-a814-b85a260f2543','1','teaml1','farhana',NULL,'2025-08-01 15:07:48',NULL),('26a1257a-0e5a-4ead-943c-c94b7f0fabcd','22','teaml1','bhavyar',NULL,'2025-08-13 15:43:26','Remark assigned to BR'),('2831f822-f2c8-4daa-8c1f-8dc00f8c6802','102','teaml1','kevinb',NULL,'2025-07-31 17:47:25',NULL),('2a4464d2-94a4-4720-94fc-9768adb81cbb','17','teaml1','eshas',NULL,'2025-08-01 15:29:49',NULL),('30d0d379-0234-42b6-814f-494bef139dd7','17','teaml1','farhana',NULL,'2025-08-01 12:03:39',NULL),('3c22b9a9-e4a6-4d37-a0fa-55cd99f1ce46','23','teaml1','bhavyar',NULL,'2025-08-13 15:44:46','Br'),('5150438d-f073-4197-a47f-04fa2a1e528a','100','teaml1','harshv',NULL,'2025-08-14 15:27:12','Resolving'),('6817ea08-a044-407d-a7ec-3248a73a9093','26','teaml1','guest',NULL,'2025-08-01 15:35:22',NULL),('6c2ca1fd-c785-4ddc-baa6-b878eabf9d5d','1','chirags','divyak',NULL,'2025-07-31 17:28:07',NULL),('6ce7c026-3db5-4bd3-ad3a-ea908201c9da','106','teaml1','garimaj',NULL,'2025-08-01 15:20:23',NULL),('7395f4af-f15e-4151-8f73-b39cf8e6078a','14','teaml1','garimaj',NULL,'2025-08-01 15:08:01',NULL),('74376933-4dc0-450f-b9ac-003f5fa2dcf1','18','teaml1','mohank',NULL,'2025-08-01 12:32:45',NULL),('7ddaa420-4f78-40ec-a5fd-fe2a4c51e797','15','teaml1','garimaj',NULL,'2025-08-01 15:39:27',NULL),('8206ef92-9211-4be4-93ec-7a1a8f76bacf','101','teaml1','jayan',NULL,'2025-08-01 13:18:14',NULL),('958c6748-e190-4cbe-9a16-5dc640039ea9','103','teaml1','mohank',NULL,'2025-07-31 17:50:06',NULL),('afbba220-04cb-44ef-994a-fa37d91e7508','16','teaml1','arjunm',NULL,'2025-08-13 14:16:02','.'),('b3b48cfa-1af8-4229-add8-0dd5978c914e','1','teaml1','eshas',NULL,'2025-08-01 12:03:18',NULL),('b718957c-e3ba-47c2-845b-49539c2021b7','100','teaml1','harshv',NULL,'2025-08-13 14:56:26','.'),('b7b4b28d-5cf2-40e7-b43f-37d9e58fb316','13','teaml1','jayan',NULL,'2025-08-01 15:24:31',NULL),('ba57546c-457f-4d8e-9205-544fd94fc977','1','teaml1','kevinb',NULL,'2025-08-01 15:23:39',NULL),('bd24282e-baad-42c7-a25b-3e96a08762a9','ddb183d7-f4a9-45ad-8600-a77c59aa7069','teaml1','kevinb',NULL,'2025-08-01 16:24:33',NULL),('cb92939e-27ac-43c5-9d13-a05b904afeb0','1','teaml1','farhana',NULL,'2025-08-01 11:48:24',NULL),('cc7c200e-a520-4eb1-a671-282cc99fe514','1','teaml1','eshas',NULL,'2025-08-01 15:09:30',NULL),('ce36543d-8ab8-404a-83b5-c16c7bfb4a56','23','teaml1','arjunm',NULL,'2025-08-13 15:48:51','Arjun mehta now'),('d96f1b58-91ef-466b-abe4-5b302580a3c0','109','teaml1','ishaanm',NULL,'2025-08-01 12:22:54',NULL),('db019657-9ad0-40e0-8995-21349f8bc42e','2','teaml1','harshv',NULL,'2025-08-01 16:19:30',NULL),('eb38ca3b-342f-4ee7-839d-95f3759fa510','14','teaml1','jayan',NULL,'2025-08-01 15:43:37',NULL),('eb51c342-fc5a-416e-9209-a6d462b65df2','1','teaml1','eshas',NULL,'2025-08-05 17:01:30',NULL),('f335b9ba-0ede-4c78-8207-4eea84a147ed','105','teaml1','arjunm',NULL,'2025-08-05 16:13:54',NULL),('fbd94e45-6d0e-4922-9634-4b29190222bc','12','teaml1','divyak',NULL,'2025-08-01 12:30:16',NULL),('fe6da3a9-bfa1-40b7-808c-a5a3ccbdc545','102','teaml1','laras',NULL,'2025-07-31 17:49:21',NULL);
/*!40000 ALTER TABLE `assignment_history` ENABLE KEYS */;
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
INSERT INTO `employee_levels` VALUES (205,1),(203,3),(204,3),(201,4),(202,4),(211,6);
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
INSERT INTO `employees` VALUES (201,'Arjun Mehta','arjun.mehta@example.com','9123456780','Delhi','arjunm','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm'),(202,'Bhavya Rao','bhavya.rao@example.com','9123456781','Mumbai','bhavyar',NULL),(203,'Chirag Shah','chirag.shah@example.com','9123456782','Bangalore','chirags',NULL),(204,'Divya Kapoor','divya.kapoor@example.com','9123456783','Hyderabad','divyak',NULL),(205,'Esha Singh','esha.singh@example.com','9123456784','Chennai','eshas',NULL),(206,'Farhan Ali','farhan.ali@example.com','9123456785','Pune','farhana',NULL),(207,'Garima Jain','garima.jain@example.com','9123456786','Delhi','garimaj',NULL),(208,'Harsh Verma','harsh.verma@example.com','9123456787','Bangalore','harshv',NULL),(209,'Ishaan Malhotra','ishaan.m@example.com','9123456788','Mumbai','ishaanm',NULL),(210,'Jaya Nair','jaya.nair@example.com','9123456789','Kolkata','jayan',NULL),(211,'Guest Account',NULL,NULL,NULL,'guest','admin123');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
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
INSERT INTO `filegator_users` VALUES (201,'','/'),(202,'','/helpdesk'),(203,'','/admin'),(211,'write','/guest');
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
INSERT INTO `knowledge_base` VALUES ('1','Java Basics','Introduction to Java programming','Tutorial','/files/java_basics.pdf'),('2','Spring Boot Guide','Comprehensive guide to Spring Boot','Documentation','/files/spring_boot_guide.pdf'),('3','REST API Design','Best practices for RESTful APIs','Article','/files/rest_api_design.pdf'),('4','Docker Overview','Introduction to Docker containers','Tutorial','/files/docker_overview.pdf'),('5','Microservices Architecture','Designing microservices systems','Whitepaper','/files/microservices_architecture.pdf');
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
INSERT INTO `requestors` VALUES ('1','Test User','user@example.com','9000000000','Farmer'),('2','Test User 2','user2@example.com','9000000002','Miller');
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
  CONSTRAINT `role_level_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `role_permission_config` (`role_id`)
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
  `role_id` int NOT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission_config`
--

LOCK TABLES `role_permission_config` WRITE;
/*!40000 ALTER TABLE `role_permission_config` DISABLE KEYS */;
INSERT INTO `role_permission_config` VALUES ('A','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}',NULL,'2025-07-29 04:11:39',NULL,'201',1,NULL,NULL,1),('ADMIN','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-07-29 04:29:06',NULL,'201',NULL,1,NULL,NULL,2),('Helpdesk Agent','{\"pages\": {}, \"sidebar\": {}}','2025-08-18 06:00:31','2025-08-18 06:00:31','Team Lead Name 1','Team Lead Name 1',0,'1|2|3|4|8','Support staff mapped to L1 level',3),('Regional Nodal Officer','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": false, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": false, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": false, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-08-18 06:03:26','2025-08-18 06:03:26','Team Lead Name 1','Team Lead Name 1',0,'5',NULL,4),('Requestor','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": false, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": false, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": false, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": false, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": false, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-08-18 11:03:48',NULL,'216',NULL,0,'2|6|7|19','Person who raises a ticket',5),('System Administrator','{\"pages\": {}, \"sidebar\": {}}','2025-07-24 05:03:50',NULL,'SYSTEM',NULL,0,NULL,'System Administrator',6),('Team Lead','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-08-18 08:58:40',NULL,'216',NULL,0,'1|2|3|7|8|9|10|17|18','Team Lead / L1 Lead',7),('Technical Team','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-08-18 06:02:41','2025-08-18 06:02:41','Team Lead Name 1','Team Lead Name 1',0,'1|2|3|4|5|8|9|10|11|15|16|17|18','Subject Matter Expert, mapped to L2 / L3 Levels',8);
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
INSERT INTO `roles` VALUES ('admin','Admin'),('helpdesk','Helpdesk');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
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
INSERT INTO `status_history` VALUES ('00a9f573-77fd-46dd-b6e7-5d631bef1f40','100','teaml1','4','2','2025-08-13 14:56:26',1,'.'),('05b55e58-0f1d-4604-b38c-4e3ac6cd87cb','15','teaml1','1','2','2025-08-01 15:39:27',1,NULL),('1','1','arjunm','PENDING','ON_HOLD','2025-06-09 10:00:00',NULL,NULL),('139e47b0-ee5a-4d7f-97d2-ea2335dd2af0','17','teaml1','1','2','2025-08-01 12:03:39',1,NULL),('17131af1-55d5-4f7c-86fb-d7e000a885b7','100','teaml1','2','4','2025-08-06 14:52:08',1,NULL),('1a78a330-6aae-43e2-97d8-285df2dc2816','8afd1dfe-6539-4e5b-8a8b-b86755f96e9f','216',NULL,'OPEN','2025-07-30 14:44:52',NULL,NULL),('1fbdc1ea-ba16-403a-a5bb-ae9e131926a0','100','teaml1','7','10','2025-08-05 17:16:03',0,NULL),('2','5','helpdesk.user','ON_HOLD','CLOSED','2025-06-09 10:05:00',NULL,NULL),('293680f3-b52d-4873-a258-584aa1f644c9','13','teaml1','1','2','2025-08-01 15:24:31',1,NULL),('2d22d17a-0cd2-4f01-b038-3b6f6af15902','102','teaml1','1','2','2025-07-31 17:47:26',1,NULL),('3','6','eshas','PENDING','REOPENED','2025-06-09 10:10:00',NULL,NULL),('31103d98-09b5-4459-adac-013eda520cc5','105','teaml1','1','2','2025-08-05 16:13:54',1,NULL),('31bd176d-8fb3-44f6-88e4-5576ad736966','106','teaml1','1','2','2025-08-01 15:20:23',1,NULL),('350ddc38-cabb-429e-99c3-36f6fa5b281c','23','teaml1','1','2','2025-08-13 15:44:46',1,'Br'),('3519bbaf-b0ff-43af-b18b-0789c6eefbd3','100','teaml1','2','7','2025-08-05 17:10:40',0,NULL),('38285d7c-d815-44f3-a0cf-0c0b4fc1ffa5','18','teaml1','1','2','2025-08-01 12:32:45',1,NULL),('3e04fc16-624f-415f-9e33-386e0b9e29a3','c514ffa1-7e56-4539-a111-f6f69b3e4915','teaml1',NULL,'1','2025-08-24 14:16:13',0,NULL),('3e637e64-1f78-4985-8ed0-7cf518326a6d','109','teaml1','2','2','2025-08-01 12:22:54',1,NULL),('4','1','admin','ON_HOLD','RESOLVED','2025-06-24 12:05:00',NULL,NULL),('4045758f-f893-4780-8cc5-b15a03e112e1','1','teaml1','10','2','2025-08-05 17:01:30',1,NULL),('43ff9691-c25b-41d2-8303-3c1ae83d3747','759c863b-3f7e-43f6-8071-4cddd86594c9','teaml1',NULL,'1','2025-08-24 14:22:59',0,NULL),('4843ade3-65fb-4581-9218-4636d002d480','100','teaml1','2','7','2025-08-14 15:27:12',0,'Resolving'),('56c37330-4425-4db2-b362-6e67a96d12f8','100','teaml1','10','2','2025-08-05 17:19:38',1,NULL),('60436c16-43fd-46fa-a54d-f56973d29037','110','teaml1','1','2','2025-08-01 15:37:18',1,NULL),('6921c2cc-530c-4137-8193-2028feadf0b8','98a742db-0f6d-47a1-9c4f-33548bddb833','216',NULL,'1','2025-07-31 12:56:14',0,NULL),('702f7c71-b12f-4d6b-b809-6c8211f7d7bc','1','teaml1','7','10','2025-08-05 16:14:39',0,NULL),('7d571ad9-f26d-4dcc-9734-26e0d06ec97f','1','teaml1','2','7','2025-08-05 16:14:24',0,NULL),('877de6b6-4f7e-41b6-8de1-d51993e436d3','14','teaml1','1','2','2025-08-01 15:08:01',1,NULL),('9b3ceedc-02de-4313-9870-662ed7c22f7d','4d912f6c-9733-4703-9b31-70015fe22951','216',NULL,'1','2025-07-31 12:27:48',0,NULL),('9b72da1e-8b17-4988-8b6d-f9c80c14dd08','4688183b-fbe0-41f3-81e3-3b2f0c76c7e7','teaml1',NULL,'1','2025-08-24 14:33:04',0,NULL),('a72d29a4-0d0b-40ea-929f-075b146c1df1','12','teaml1','1','2','2025-08-01 12:30:16',1,NULL),('b45d32ea-706f-4039-9831-13515115d868','103','teaml1','1','2','2025-07-31 17:50:06',1,NULL),('b9755e8a-39a2-4a20-8e2b-376bdb46c628','059308db-942e-4bbd-a760-2c408b7db8b4','teaml1',NULL,'1','2025-08-24 14:25:42',0,NULL),('bdf6cd9f-87be-40a8-b069-9a08f631bf74','16','teaml1','1','9','2025-08-13 10:05:24',0,'Checking remark for cancel'),('c6d0d52f-23dd-4977-bed1-9910cae5d917','24','teaml1','1','9','2025-08-13 15:00:46',0,'Cancel'),('c71e5dd5-3062-411f-b5e2-2c282f628690','16','teaml1','9','2','2025-08-13 14:16:02',1,'.'),('c8d6e80a-688f-476e-b5e0-fcaed13a3fbd','104','teaml1','1','9','2025-08-05 16:12:59',0,NULL),('cbddc18e-ef8b-432e-aabc-7d7c0f54551d','88d8314f-faa3-4462-9d0a-1d329b7b14e9','216',NULL,'1','2025-07-31 11:58:09',0,NULL),('cc47943d-75c8-4ccc-8a36-0f68cb5d070f','ddb183d7-f4a9-45ad-8600-a77c59aa7069','216',NULL,'1','2025-07-31 12:54:30',0,NULL),('d0dc73cb-b8af-4aab-b71a-7b11bafabbef','1','teaml1','2','7','2025-08-05 17:39:03',0,NULL),('d2036d03-aa56-483c-838a-5657ad0d5f5a','101','teaml1','2','3','2025-08-05 17:14:08',0,NULL),('d61c6e7a-3143-4af8-8175-0443348a4056','c97d56bb-fcbd-4d36-a070-daf1fe8b612f','teaml1',NULL,'1','2025-08-24 14:07:37',0,NULL),('da47df63-41e5-409a-a8c1-813ec5496d25','26','teaml1','1','2','2025-08-01 15:35:22',1,NULL),('dc7a61e1-5eb5-4da5-8495-1c465ec6da0e','2','teaml1','1','2','2025-08-01 16:19:30',1,NULL),('e8ed092a-f3d4-46bd-ab65-38ce5c969328','46ef0f9f-6647-46e6-ba57-d367c101901c','teaml1',NULL,'1','2025-07-31 15:45:54',0,NULL),('f005b8fc-4011-40a6-bf4d-4f3204230af6','22','teaml1','1','2','2025-08-13 15:43:26',1,'Remark assigned to BR'),('fbd5655a-62ea-47f7-9fd1-97d72c7a9bde','ddb183d7-f4a9-45ad-8600-a77c59aa7069','teaml1','1','2','2025-08-01 16:24:33',1,NULL);
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
INSERT INTO `status_master` VALUES (1,'Open (New)','OPEN',0,'The ticket has been created but not yet assigned','#2196F3'),(2,'Assigned (In Progress)','ASSIGNED',1,'The ticket has been assigned to a support agent or team','#9C27B0'),(3,'On Hold (Pending with Requester)','PENDING_WITH_REQUESTER',0,'Waiting for additional information from the requester','#FFC107'),(4,'On Hold (Pending with Service Provider)','PENDING_WITH_SERVICE_PROVIDER',1,'Waiting for additional information/ resolution from the third-party service provider','#FF9800'),(5,'On Hold (Pending with FCI)','PENDING_WITH_FCI',0,'Waiting for resolution from FCI or its empanelled vendors','#FFB74D'),(6,'Awaiting Escalation Approval','AWAITING_ESCALATION_APPROVAL',0,'Resolution or action requires managerial approval before proceeding','#E91E63'),(7,'Resolved','RESOLVED',0,'The issue has been fixed, but the ticket remains open for confirmation from the requester','#4CAF50'),(8,'Closed','CLOSED',0,'The ticket has been resolved and confirmed by the requester or automatically closed after a period of inactivity','#607D8B'),(9,'Cancelled','CANCELLED',0,'The ticket was withdrawn by the requester or deemed invalid','#F44336'),(10,'Reopened','REOPENED',0,'A previously resolved ticket has been reopened due to recurrence or incomplete resolution','#3F51B5'),(11,'Escalated','ESCALATED',0,'New severity can be recommended by some designated users','#FF5722');
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
  `severity_id` varchar(3) NOT NULL DEFAULT 'S4',
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
INSERT INTO `sync_metadata` VALUES ('last_sync_time','2025-06-17T00:45:29.776317700',NULL);
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
INSERT INTO `ticket_categories` VALUES ('1','Software','Bug'),('2','Software','Feature Request'),('3','Hardware','Replacement'),('4','HR','Leave Request'),('5','Finance','Reimbursement'),('6','Operations','Logistics');
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
INSERT INTO `ticket_comments` VALUES ('2','Acknowledgment from support teams','2025-06-09 10:20:21','101'),('3','User confirmed issue is resolved.','2025-06-09 10:21:02','101'),('4','Closing ticket with resolution notes.','2025-06-09 10:11:02','101'),('5','Reported again after facing same problem.','2025-06-09 10:21:03','101'),('6','Waiting for update from development team.','2025-06-09 09:51:03','101'),('7','First comment','2025-06-09 10:23:48','101'),('8','abc','2025-06-09 18:02:07','101');
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_feedback`
--

LOCK TABLES `ticket_feedback` WRITE;
/*!40000 ALTER TABLE `ticket_feedback` DISABLE KEYS */;
/*!40000 ALTER TABLE `ticket_feedback` ENABLE KEYS */;
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
INSERT INTO `ticket_status_workflow` VALUES (1,'Assign',1,2),(2,'Cancel/ Reject',1,9),(3,'Assign Further',2,2),(4,'On Hold (Pending with Requester)',2,3),(5,'Resolve',2,7),(6,'Close',7,8),(7,'Reopen',7,10),(8,'Assign',10,2),(9,'Assign / Assign Further',3,2),(10,'Assign / Assign Further',4,2),(11,'Recommend Escalation',2,6),(12,'Approve Escalation',6,11),(15,'On Hold (Pending with Service Provider)',2,4),(16,'On Hold (Pending with FCI)',2,5),(17,'Assign',11,2),(18,'Assign / Assign Further',7,2),(19,'Resume',3,2);
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
  `reported_date` date DEFAULT NULL,
  `mode` enum('Email','Self','Call') DEFAULT NULL,
  `user_id` varchar(36) DEFAULT NULL,
  `requestor_name` varchar(100) DEFAULT NULL,
  `requestor_email_id` varchar(100) DEFAULT NULL,
  `requestor_mobile_no` varchar(15) DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `sub_category` varchar(100) DEFAULT NULL,
  `priority` enum('Critical','High','Medium','Low','P1','P2','P3','P4') NOT NULL,
  `attachment_path` varchar(512) DEFAULT NULL,
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
  KEY `master_id` (`master_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`master_id`) REFERENCES `tickets` (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES 
('059308db-942e-4bbd-a760-2c408b7db8b4','2025-08-24','Self','216','laras','team.lead1@example.com','1212121212','Testing creation 7','Testing Go to My Tickets page button','6','6001','P4',NULL,'0',NULL,NULL,'OPEN',NULL,NULL,NULL,'teaml1',NULL,NULL,NULL,NULL,NULL,'1',NULL,NULL,'teaml1'),
('1','2025-04-08','Call',NULL,'ishaanm','team@lead.com','1212121212','Can\'t change password','Issue related to password reset. Please assist.','8','8004','P3',NULL,'0','1','2025-08-24 08:35:57','CLOSED',NULL,NULL,'eshas',NULL,NULL,NULL,NULL,NULL,NULL,'8',NULL,'PENDING',NULL),
('100','2025-06-05','Call',NULL,'laras',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','4','4002','P1','','0',NULL,'2025-08-24 08:35:57','CLOSED','L2',NULL,'harshv',NULL,NULL,NULL,NULL,NULL,NULL,'8','2025-08-14 15:27:11','PENDING','teaml1'),
('101','2025-06-05','Call',NULL,'kevinb',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','9','9001','P1','','0',NULL,'2025-08-24 08:35:57','PENDING_WITH_REQUESTER','L1',NULL,'jayan',NULL,NULL,NULL,NULL,NULL,NULL,'3',NULL,'PENDING',NULL),
('102','2025-06-05','Call',NULL,'eshas',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','4','4001','P1','','1',NULL,'2025-08-24 08:35:57','ASSIGNED','L3',NULL,'laras',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('103','2025-06-05','Call',NULL,'divyak',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','9','9002','P1','','1',NULL,'2025-08-24 08:35:57','ASSIGNED','L1',NULL,'mohank',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('104','2025-06-05','Call',NULL,'eshas',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','4','4001','P1','','1',NULL,'2025-08-24 08:35:57','CANCELLED','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'9',NULL,'PENDING',NULL),
('105','2025-06-05','Call',NULL,'chirags',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','5','5008','P1','','1',NULL,'2025-08-24 08:35:57','ASSIGNED','L3',NULL,'arjunm',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('106','2025-06-08','Call',NULL,'divyak',NULL,NULL,'T!','D!','5','5007','P2',NULL,'0',NULL,'2025-08-24 08:35:57','ASSIGNED','L2',NULL,'garimaj',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('107','2025-06-12','Self','201','guest',NULL,NULL,'s1','d1','9','9003','P3',NULL,'0',NULL,'2025-08-24 08:35:57','ON_HOLD','',NULL,'201','nimit.jain',NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('108','2025-06-12','Self','201','garimaj',NULL,NULL,'s1','d1','8','8004','P3',NULL,'1',NULL,'2025-08-24 08:35:57','ON_HOLD','',NULL,'201','nimit.jain',NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('109','2025-06-12','Self','201','usern',NULL,NULL,'s1','d1','8','8003','P3',NULL,'1',NULL,'2025-08-24 08:35:57','ASSIGNED','1',NULL,'ishaanm','nimit.jain',NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('11','2025-04-11','Call',NULL,'bhavyar',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','8','8001','P2','','0','11','2025-08-24 08:35:57','ASSIGNED','L1',NULL,'bhavyar',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('110','2025-06-16','Email','201','chirags',NULL,NULL,'Ticket created by IT','Need to check this description box','6','6001','P3',NULL,'0',NULL,'2025-08-24 08:35:57','ASSIGNED',NULL,NULL,'harshv','helpdesk.user',NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('111','2025-06-17','Call',NULL,'teaml1','john@doe.com','12341234','T created by Farmer','Description input text allignment wrong','5','5004','P3',NULL,'0',NULL,'2025-08-24 08:35:57','PENDING','L1',NULL,'arjunm','helpdesk.user',NULL,NULL,NULL,NULL,'Farmer','2',NULL,'PENDING',NULL),
('112','2025-06-24','Email','212','guest','kevin.brooks@example.com','9123456790','System Crash','System crash when saving data','1','1002','P1','/files/log.txt','0',NULL,'2025-08-24 08:35:57','PENDING','L1',NULL,'Kevin Brooks','admin','HIGH','HIGH','admin','Critical','Management','2',NULL,'PENDING',NULL),
('12','2025-04-06','Self',NULL,'harshv',NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','3','3001','P4','','1','11','2025-08-24 08:36:57','ASSIGNED','L3',NULL,'divyak',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('13','2025-05-23','Self',NULL,'usern',NULL,NULL,'Outlook crashes on launch','Issue related to outlook. Please assist.','1','1001','P2','','0','11','2025-08-24 08:35:57','ASSIGNED','L1',NULL,'jayan',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('14','2025-04-26','Call',NULL,'guest',NULL,NULL,'Internet not working','Issue related to connectivity. Please assist.','8','8004','P2','','1','11','2025-08-24 08:35:57','ASSIGNED','L2',NULL,'jayan',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('15','2025-05-21','Self',NULL,'divyak',NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','4','4003','P4','','0','11','2025-08-24 08:36:57','ASSIGNED','L3',NULL,'garimaj',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('16','2025-05-05','Call',NULL,'jayan',NULL,NULL,'Stuck at login screen','Issue related to login. Please assist.','1','1003','P4','','1','11','2025-08-24 08:36:57','ASSIGNED','L2',NULL,'arjunm',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('17','2025-05-10','Email',NULL,'garimaj',NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','9','9003','P4','','0','11','2025-08-24 08:36:57','ASSIGNED','L1',NULL,'eshas',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('18','2025-04-16','Email',NULL,'jayan',NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','7','7001','P4','','1','11','2025-08-24 08:36:57','ASSIGNED','L3',NULL,'mohank',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('2','2025-06-03','Self',NULL,'laras',NULL,NULL,'Forgot my password','Issue related to password reset. Please assist.','5','5010','P1','','1','1','2025-08-24 08:35:57','ASSIGNED','L2',NULL,'harshv',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('21','2025-05-20','Call',NULL,'harshv',NULL,NULL,'Blue screen error','Issue related to system crash. Please assist.','4','4001','P3','','0','21','2025-08-24 08:35:57','CANCELLED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'9',NULL,'PENDING',NULL),
('22','2025-05-25','Self',NULL,'garimaj',NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','2','2001','P3','','1','21','2025-08-24 08:35:57','ASSIGNED','L2',NULL,'bhavyar',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('23','2025-04-18','Email',NULL,'ishaanm',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','7','7001','P1','','0','21','2025-08-24 08:35:57','ASSIGNED','L1',NULL,'arjunm',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('24','2025-04-26','Call',NULL,'chirags',NULL,NULL,'Email stuck in outbox','Issue related to outlook. Please assist.','2','2003','P4','','1','21','2025-08-24 08:36:57','CANCELLED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'9',NULL,'PENDING',NULL),
('25','2025-04-05','Email','118','bhavyar',NULL,NULL,'Forgot my password','Issue related to password reset. Please assist.','1','1004','P2','','0','21','2025-08-24 08:35:57','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('26','2025-05-21','Self',NULL,'ishaanm',NULL,NULL,'System crashes on boot','Issue related to system crash. Please assist.','8','8002','P2','','1','21','2025-08-24 08:35:57','ASSIGNED','L2',NULL,'guest',NULL,NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('27','2025-05-06','Call','100','garimaj',NULL,NULL,'Outlook crashes on launch','Issue related to outlook. Please assist.','9','9002','P1','','0','21','2025-08-24 08:35:57','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('3','2025-04-16','Call','100','ishaanm',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','7','7004','P2','','0','1','2025-08-24 08:35:57','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('31','2025-05-14','Self','168','kevinb',NULL,NULL,'VPN fails during connection','Issue related to vpn. Please assist.','1','1003','P4','','0','31','2025-08-24 08:36:57','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('32','2025-04-20','Call','176','divyak',NULL,NULL,'Outlook not opening','Issue related to outlook. Please assist.','7','7005','P3','','1','31','2025-08-24 08:35:57','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('33','2025-05-31','Call','197','guest',NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','3','3001','P1','','0','31','2025-08-24 08:35:57','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('34','2025-05-04','Self','188','arjunm',NULL,NULL,'Outlook not opening','Issue related to outlook. Please assist.','4','4001','P4','','1','31','2025-08-24 08:36:57','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('35','2025-05-10','Email','124','harshv',NULL,NULL,'False positive alerts','Issue related to antivirus. Please assist.','5','5003','P2','','0','31','2025-08-24 08:35:57','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('36','2025-05-02','Call','142','guest',NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','6','6001','P1','','1','31','2025-08-24 08:35:57','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('4','2025-04-15','Self','153','divyak',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','2','2004','P3','','1','1','2025-08-24 08:35:57','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('41','2025-05-19','Self','141','bhavyar',NULL,NULL,'Unable to login','Issue related to login. Please assist.','9','9003','P3','','0','41','2025-08-24 08:35:57','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('42','2025-06-02','Self','149','chirags',NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','10','10001','P2','','1','41','2025-08-24 08:35:57','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('43','2025-04-17','Email','140','garimaj',NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','9','9003','P1','','0','41','2025-08-24 08:35:57','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('44','2025-05-29','Email','128','divyak',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','6','6001','P2','','1','41','2025-08-24 08:35:57','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('45','2025-05-31','Self','148','kevinb',NULL,NULL,'Can\'t print documents','Issue related to printer. Please assist.','1','1001','P4','','0','41','2025-08-24 08:36:57','CLOSED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('4688183b-fbe0-41f3-81e3-3b2f0c76c7e7','2025-08-24','Self','216','arjunm','team.lead1@example.com','1212121212','Testing creation 8','Testing Raise New Ticket button','3','3001','P1',NULL,'0',NULL,NULL,'OPEN',NULL,NULL,NULL,'teaml1',NULL,NULL,NULL,NULL,NULL,'1',NULL,NULL,'teaml1'),
('46ef0f9f-6647-46e6-ba57-d367c101901c','2025-07-31','Self','216','divyak','team.lead1@example.com','1212121212','Testing status 1','Status is OPEN only','7','7002','P3',NULL,'0',NULL,'2025-08-24 08:35:57','OPEN',NULL,NULL,NULL,'teaml1',NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('4d912f6c-9733-4703-9b31-70015fe22951','2025-07-31','Call','202','bhavyar','bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','10','10001','P3',NULL,'0',NULL,'2025-08-24 08:35:57','OPEN',NULL,NULL,NULL,'216',NULL,NULL,NULL,NULL,'Farmer','1',NULL,'PENDING',NULL),
('5','2025-04-10','Call','191','divyak',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','4','4001','P1','','0','1','2025-08-24 08:35:57','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('51','2025-05-17','Call','125','harshv',NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','1','1003','P1','','0','51','2025-08-24 08:35:57','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('52','2025-05-21','Email','131','kevinb',NULL,NULL,'Can\'t send email','Issue related to outlook. Please assist.','6','6001','P1','','1','51','2025-08-24 08:35:57','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('53','2025-05-05','Self','118','bhavyar',NULL,NULL,'Stuck at login screen','Issue related to login. Please assist.','8','8004','P3','','0','51','2025-08-24 08:35:57','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('54','2025-04-08','Self','149','bhavyar',NULL,NULL,'Printer showing error code','Issue related to printer. Please assist.','9','9001','P3','','1','51','2025-08-24 08:35:57','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('6','2025-04-25','Call','195','laras',NULL,NULL,'VPN fails during connection','Issue related to vpn. Please assist.','3','3002','P2','','1','1','2025-08-24 08:35:57','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('61','2025-05-31','Email','126','kevinb',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','7','7005','P3','','0','61','2025-08-24 08:35:57','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('62','2025-04-12','Self','164','farhana',NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','3','3001','P1','','1','61','2025-08-24 08:35:57','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('63','2025-05-19','Email','172','farhana',NULL,NULL,'Login page not loading','Issue related to login. Please assist.','2','2006','P3','','0','61','2025-08-24 08:35:57','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('7','2025-05-30','Email','186','ishaanm',NULL,NULL,'Can\'t connect to VPN','Issue related to vpn. Please assist.','1','1004','P3','','0','1','2025-08-24 08:35:57','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('71','2025-04-21','Self','112','farhana',NULL,NULL,'Email not syncing','Issue related to outlook. Please assist.','10','10001','P3','','0','71','2025-08-24 08:35:57','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('72','2025-04-17','Call','155','mohank',NULL,NULL,'VPN disconnects randomly','Issue related to vpn. Please assist.','9','9003','P3','','1','71','2025-08-24 08:35:57','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('759c863b-3f7e-43f6-8071-4cddd86594c9','2025-08-24','Self','216','jayan','team.lead1@example.com','1212121212','Testing creation 6','Testing buttons on successful modal','5','5007','P3',NULL,'0',NULL,NULL,'OPEN',NULL,NULL,NULL,'teaml1',NULL,NULL,NULL,NULL,NULL,'1',NULL,NULL,'teaml1'),
('8','2025-04-23','Email','127','ishaanm',NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','2','2009','P3','','1','1','2025-08-24 08:35:57','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('81','2025-06-02','Email','160','arjunm',NULL,NULL,'VPN disconnects randomly','Issue related to vpn. Please assist.','7','7001','P3','','0','81','2025-08-24 08:35:57','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('88d8314f-faa3-4462-9d0a-1d329b7b14e9','2025-07-31','Call','202','guest','bhavya.rao@example.com','9123456781','Testing Creation 2','Creating + Assigning','10','10001','P3',NULL,'0',NULL,'2025-08-24 08:35:57','OPEN','1',NULL,NULL,'216',NULL,NULL,NULL,NULL,'Farmer','1',NULL,'PENDING',NULL),
('8afd1dfe-6539-4e5b-8a8b-b86755f96e9f','2025-07-30','Call','202','eshas','bhavya.rao@example.com','9123456781','Testing creation 1','Status at the time of creation should be Open','3','3002','P3',NULL,'0',NULL,'2025-08-24 08:35:57','OPEN',NULL,NULL,NULL,'216',NULL,NULL,NULL,NULL,'Farmer','1',NULL,'PENDING',NULL),
('9','2025-04-26','Call','161','kevinb',NULL,NULL,'Can\'t access my account','Issue related to login. Please assist.','9','9002','P1','','0','1','2025-08-24 08:35:57','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('96','2025-06-05','Email','1024','kevinb',NULL,NULL,'Unable to access internal portal','The intranet portal shows a 403 forbidden error since morning.','9','9003','P1','','0',NULL,'2025-08-24 08:35:57','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('97','2025-06-05','Email','1014','eshas',NULL,NULL,'Cannot access internal portal','The intranet portal shows a 403 forbidden error since morning.','4','4002','P1','','0',NULL,'2025-08-24 08:35:57','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('98','2025-06-05','Call','1111','mohank',NULL,NULL,'Cannot access internal portal','The intranet portal shows a 403 forbidden error since morning.','1','1001','P1','','0',NULL,'2025-08-24 08:35:57','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('98a742db-0f6d-47a1-9c4f-33548bddb833','2025-07-31','Call','202','garimaj','bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','5','5003','P3',NULL,'0',NULL,'2025-08-24 08:35:57','OPEN',NULL,NULL,NULL,'216',NULL,NULL,NULL,NULL,'Farmer','1',NULL,'PENDING',NULL),
('99','2025-06-05','Call','1112','harshv',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','3','3003','P1','','0',NULL,'2025-08-24 08:35:57','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),
('c514ffa1-7e56-4539-a111-f6f69b3e4915','2025-08-24','Self','216','usern','team.lead1@example.com','1212121212','Testing creation 5','Testing closing of successful modal','6','6001','P2',NULL,'0',NULL,NULL,'OPEN',NULL,NULL,NULL,'teaml1',NULL,NULL,NULL,NULL,NULL,'1',NULL,NULL,'teaml1'),
('c97d56bb-fcbd-4d36-a070-daf1fe8b612f','2025-08-24','Self','216','bhavyar','team.lead1@example.com','1212121212','Testing creation 4','Cat, subCat, Priority saved by id.','6','6001','P1',NULL,'0',NULL,NULL,'OPEN',NULL,NULL,NULL,'teaml1',NULL,NULL,NULL,NULL,NULL,'1',NULL,NULL,'teaml1'),
('d85e3fbc-0e03-40c4-951b-22d0b4130f9f','2025-07-17','Self','201','bhavyar','arjun.mehta@example.com','9123456780','S1','D1','2','2008','P3',NULL,'0',NULL,'2025-08-24 08:35:57',NULL,'L1',NULL,'205','201',NULL,NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),
('ddb183d7-f4a9-45ad-8600-a77c59aa7069','2025-07-31','Call','202','chirags','bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','4','4003','P3',NULL,'0',NULL,'2025-08-24 08:35:57','ASSIGNED',NULL,NULL,'kevinb','216',NULL,NULL,NULL,NULL,'Farmer','2',NULL,'PENDING',NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
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
INSERT INTO `user_levels` VALUES (207,1,'L1'),(212,1,'L2|L3'),(213,1,'L2');
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
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (201,'Arjun Mehta','arjun.mehta@example.com','9123456780','Delhi','arjunm','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','ADMIN'),(202,'Bhavya Rao','bhavya.rao@example.com','9123456781','Mumbai','bhavyar',NULL,'2'),(203,'Chirag Shah','chirag.shah@example.com','9123456782','Bangalore','chirags',NULL,'2'),(204,'Divya Kapoor','divya.kapoor@example.com','9123456783','Hyderabad','divyak',NULL,'2'),(205,'Esha Singh','esha.singh@example.com','9123456784','Chennai','eshas','admin123','5'),(206,'Farhan Ali','farhan.ali@example.com','9123456785','Pune','farhana',NULL,'1'),(207,'Garima Jain','garima.jain@example.com','9123456786','Delhi','garimaj',NULL,'3'),(208,'Harsh Verma','harsh.verma@example.com','9123456787','Bangalore','harshv',NULL,'4'),(209,'Ishaan Malhotra','ishaan.m@example.com','9123456788','Mumbai','ishaanm',NULL,'6'),(210,'Jaya Nair','jaya.nair@example.com','9123456789','Kolkata','jayan',NULL,'5|7'),(211,'Guest Account',NULL,NULL,NULL,'guest','admin123','5'),(212,'Kevin Brooks','kevin.brooks@example.com','9123456790','Delhi','kevinb','password123','8'),(213,'Lara Singh','lara.singh@example.com','9123456791','Chandigarh','laras','securepass','5|7|8'),(214,'Mohan Kumar','mohan.kumar@example.com','9123456792','Jaipur','mohank','pass1234','ADMIN'),(215,'User Name','user.name@example.com','1111111111','Delhi','usern','admin123','USER'),(216,'Team Lead Name 1','team.lead1@example.com','1212121212','Delhi','teaml1','admin123','5|7');
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
-- Dumping events for database 'ticketing_system'
--

--
-- Dumping routines for database 'ticketing_system'
--

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

-- Dump completed on 2025-08-25  0:12:58
