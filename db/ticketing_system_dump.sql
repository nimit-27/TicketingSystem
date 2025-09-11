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
INSERT INTO `assignment_history` VALUES ('015996d6-14a5-4776-a16c-7d32dfddeb56','100','teaml1','eshas',NULL,'2025-08-05 17:19:38',NULL),('02744bc9-930c-448e-bcb5-e5818d5ee992','2f07b1d7-3abe-4a55-a902-dcdd2021c14c','guest','kevinb','L2','2025-09-02 14:59:15','I am finally closing the ticket'),('1','1','admin','agent1',NULL,'2025-06-24 12:00:00',NULL),('14c4a238-517c-4f42-9b67-4a849a150b4d','110','teaml1','harshv',NULL,'2025-08-01 15:37:18',NULL),('1532b02f-6891-4b5b-a551-fb4445ed8e96','050f176d-30ad-4144-a6cb-3741c141ab32','laras','laras','L2','2025-09-03 04:49:03','Step 3'),('1b10eff2-504c-4e46-a9b1-0a16aaae3f65','15','garimaj','garimaj',NULL,'2025-08-26 14:49:09','Resolved'),('23a3d665-0642-4d3a-a814-b85a260f2543','1','teaml1','farhana',NULL,'2025-08-01 15:07:48',NULL),('240a93c8-a726-4c9a-9656-51a7fa154076','0ca90721-8cc0-481f-9aa7-e63634765409','kevinb','kevinb','L2','2025-09-03 15:05:14','Testing to see feedback'),('26a1257a-0e5a-4ead-943c-c94b7f0fabcd','22','teaml1','bhavyar',NULL,'2025-08-13 15:43:26','Remark assigned to BR'),('2831f822-f2c8-4daa-8c1f-8dc00f8c6802','102','teaml1','kevinb',NULL,'2025-07-31 17:47:25',NULL),('2a4464d2-94a4-4720-94fc-9768adb81cbb','17','teaml1','eshas',NULL,'2025-08-01 15:29:49',NULL),('2ab71f31-3bf7-44ab-a139-4f176344035b','37a74fc1-eef5-4254-9abb-75df3d0b0528','teaml1','211',NULL,'2025-09-03 22:51:01','Step 2'),('30d0d379-0234-42b6-814f-494bef139dd7','17','teaml1','farhana',NULL,'2025-08-01 12:03:39',NULL),('3c22b9a9-e4a6-4d37-a0fa-55cd99f1ce46','23','teaml1','bhavyar',NULL,'2025-08-13 15:44:46','Br'),('3cf03376-7b4c-4f52-8bc5-af2989b59854','0ca90721-8cc0-481f-9aa7-e63634765409','teaml1','kevinb','L2','2025-08-29 14:05:35','2nd assignee'),('3d6301ff-9803-4918-83b4-d9f4bf69cac2','101','teaml1','jayan',NULL,'2025-08-26 17:13:49','Yes'),('4f4aa8b1-18b9-45cc-8a6c-5068daf29cbf','ddb183d7-f4a9-45ad-8600-a77c59aa7069','chirags','kevinb',NULL,'2025-09-03 16:05:10','Closing to test Feedback form'),('501ec324-3f0a-4aa1-b1b6-f3c6d76dbb95','37a74fc1-eef5-4254-9abb-75df3d0b0528','teaml1','211',NULL,'2025-09-11 11:43:56','Developing recommend severity flow'),('50f5de1c-0724-47a5-a073-ecfddc56c9a1','0ca90721-8cc0-481f-9aa7-e63634765409','teaml1','garimaj','L1','2025-08-29 14:05:18','Yes'),('5150438d-f073-4197-a47f-04fa2a1e528a','100','teaml1','harshv',NULL,'2025-08-14 15:27:12','Resolving'),('54a22003-5fe1-47dc-9720-b86c33723273','050f176d-30ad-4144-a6cb-3741c141ab32','laras','laras','L2','2025-09-03 04:48:48','Step 2'),('5fc2bdd6-4edf-4437-9cda-562232cbc322','78eb40f6-a118-4719-a47c-9b6ca9cb4e88','teaml1','garimaj','L1','2025-08-29 14:44:11','Yes'),('6817ea08-a044-407d-a7ec-3248a73a9093','26','teaml1','guest',NULL,'2025-08-01 15:35:22',NULL),('6c2ca1fd-c785-4ddc-baa6-b878eabf9d5d','1','chirags','divyak',NULL,'2025-07-31 17:28:07',NULL),('6ce7c026-3db5-4bd3-ad3a-ea908201c9da','106','teaml1','garimaj',NULL,'2025-08-01 15:20:23',NULL),('7395f4af-f15e-4151-8f73-b39cf8e6078a','14','teaml1','garimaj',NULL,'2025-08-01 15:08:01',NULL),('74376933-4dc0-450f-b9ac-003f5fa2dcf1','18','teaml1','mohank',NULL,'2025-08-01 12:32:45',NULL),('7ddaa420-4f78-40ec-a5fd-fe2a4c51e797','15','teaml1','garimaj',NULL,'2025-08-01 15:39:27',NULL),('8206ef92-9211-4be4-93ec-7a1a8f76bacf','101','teaml1','jayan',NULL,'2025-08-01 13:18:14',NULL),('82ebcd91-774d-45db-a535-1144de78e623','ddb183d7-f4a9-45ad-8600-a77c59aa7069','kevinb','kevinb',NULL,'2025-09-03 15:55:54','testing submit button'),('958c6748-e190-4cbe-9a16-5dc640039ea9','103','teaml1','mohank',NULL,'2025-07-31 17:50:06',NULL),('961fb8b3-24ab-45b3-a2c0-f7e28de90ae8','050f176d-30ad-4144-a6cb-3741c141ab32','teaml1','laras','L2','2025-09-03 03:59:56','Step 1'),('9bedb8e0-37ab-4f61-bc9b-a9d4ee1358a2','2f07b1d7-3abe-4a55-a902-dcdd2021c14c','teaml1','garimaj','L1','2025-09-02 12:44:18','Yes'),('a23d76ca-b166-4438-85ce-7bc237c13c49','2f07b1d7-3abe-4a55-a902-dcdd2021c14c','garimaj','kevinb','L2','2025-09-02 14:11:10','Yes'),('a28ca25f-677f-46e4-9517-365e01866d1d','37a74fc1-eef5-4254-9abb-75df3d0b0528','guest','211',NULL,'2025-09-03 22:53:12','Submitting back'),('a870574a-a91b-410d-87b5-cd0302a8f2cc','2f07b1d7-3abe-4a55-a902-dcdd2021c14c','kevinb','kevinb','L2','2025-09-02 14:55:32','Testing has been resolved'),('afbba220-04cb-44ef-994a-fa37d91e7508','16','teaml1','arjunm',NULL,'2025-08-13 14:16:02','.'),('b3b48cfa-1af8-4229-add8-0dd5978c914e','1','teaml1','eshas',NULL,'2025-08-01 12:03:18',NULL),('b718957c-e3ba-47c2-845b-49539c2021b7','100','teaml1','harshv',NULL,'2025-08-13 14:56:26','.'),('b7b4b28d-5cf2-40e7-b43f-37d9e58fb316','13','teaml1','jayan',NULL,'2025-08-01 15:24:31',NULL),('ba57546c-457f-4d8e-9205-544fd94fc977','1','teaml1','kevinb',NULL,'2025-08-01 15:23:39',NULL),('bd24282e-baad-42c7-a25b-3e96a08762a9','ddb183d7-f4a9-45ad-8600-a77c59aa7069','teaml1','kevinb',NULL,'2025-08-01 16:24:33',NULL),('cb92939e-27ac-43c5-9d13-a05b904afeb0','1','teaml1','farhana',NULL,'2025-08-01 11:48:24',NULL),('cc7c200e-a520-4eb1-a671-282cc99fe514','1','teaml1','eshas',NULL,'2025-08-01 15:09:30',NULL),('ce36543d-8ab8-404a-83b5-c16c7bfb4a56','23','teaml1','arjunm',NULL,'2025-08-13 15:48:51','Arjun mehta now'),('ced94148-e004-40ee-bbc8-4c4b3aa1be47','78eb40f6-a118-4719-a47c-9b6ca9cb4e88','teaml1','laras','L2','2025-08-29 14:43:51',NULL),('d96f1b58-91ef-466b-abe4-5b302580a3c0','109','teaml1','ishaanm',NULL,'2025-08-01 12:22:54',NULL),('db019657-9ad0-40e0-8995-21349f8bc42e','2','teaml1','harshv',NULL,'2025-08-01 16:19:30',NULL),('e2069414-6c86-4ef0-bd1a-ec6c5bf76044','0ca90721-8cc0-481f-9aa7-e63634765409','kevinb','rnoharshv','L2','2025-09-03 16:43:52','Assigning to FCI'),('eb38ca3b-342f-4ee7-839d-95f3759fa510','14','teaml1','jayan',NULL,'2025-08-01 15:43:37',NULL),('eb51c342-fc5a-416e-9209-a6d462b65df2','1','teaml1','eshas',NULL,'2025-08-05 17:01:30',NULL),('f335b9ba-0ede-4c78-8207-4eea84a147ed','105','teaml1','arjunm',NULL,'2025-08-05 16:13:54',NULL),('fbd94e45-6d0e-4922-9634-4b29190222bc','12','teaml1','divyak',NULL,'2025-08-01 12:30:16',NULL),('fe6da3a9-bfa1-40b7-808c-a5a3ccbdc545','102','teaml1','laras',NULL,'2025-07-31 17:49:21',NULL);
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
INSERT INTO `faqs` VALUES ('1','How do I reset my password?','मेरा पासवर्ड कैसे रीसेट करें?','Click on the \'Forgot password\' link on the login page and follow the instructions.','लॉगिन पृष्ठ पर \"पासवर्ड भूल गए\" लिंक पर क्लिक करें और निर्देशों का पालन करें.','password|reset|account','system','2024-01-01 10:00:00',NULL,NULL),('2','How can I create a ticket?','मैं टिकट कैसे बना सकता हूँ?','Navigate to the create ticket page and fill out the required details.','टिकट बनाने वाले पृष्ठ पर जाएँ और आवश्यक विवरण भरें.','ticket|create|help','system','2024-01-01 10:05:00',NULL,NULL);
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
INSERT INTO `role_permission_config` VALUES ('A','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}',NULL,'2025-07-29 04:11:39',NULL,'201',1,NULL,NULL,1),('ADMIN','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-07-29 04:29:06',NULL,'201',NULL,1,NULL,NULL,2),('Helpdesk Agent','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status Id\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status Label\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": true, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-08-26 10:07:33','2025-08-18 06:00:31','216','Team Lead Name 1',0,'2|3|4|5|8|9|10|15|16|17|18|19','Support staff mapped to L1 level',3),('Regional Nodal Officer','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}, \"Link to Master Ticket Modal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-09-09 05:11:02','2025-08-18 06:03:26','216','Team Lead Name 1',0,'21','FCI Employee',4),('Requestor','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"children\": {\"allowAssignment\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Allow Assignment\"}}}, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"linkToMasterTicketModal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"linkToMasterTicketButton\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}, \"Link to Master Ticket Modal\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"allTickets\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"All Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-09-09 05:10:34',NULL,'216',NULL,0,'19','Person who raises a ticket',5),('System Administrator','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-07-24 05:03:50',NULL,'SYSTEM',NULL,0,NULL,'System Administrator',6),('Team Lead','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"statusLabel\": {\"show\": true, \"metadata\": {\"name\": \"Status Label\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"My Tickets\"}}, \"allTickets\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"All Tickets\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-08-26 20:08:33',NULL,'216',NULL,0,'1|2|3|4|8|9|10|15|16|17|18|19','Team Lead / L1 Lead',7),('Technical Team','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"children\": {\"call\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Call\"}}, \"self\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Self\"}}, \"email\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Email\"}}}, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": false, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": true, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-09-02 08:45:50','2025-08-18 06:02:41','212','Team Lead Name 1',0,'2|3|4|5|8|9|10|15|16|17|18|19','Subject Matter Expert, mapped to L2 / L3 Levels',8),('Dummy','{\"pages\": {}, \"sidebar\": {}}','2025-09-01 10:16:47','2025-09-01 10:16:47','Team Lead Name 1','Team Lead Name 1',0,'1|2|3|4|5|8|9|10|11|15|16|17|18','Dummy Role for testing',10);
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
INSERT INTO `sla_config` VALUES ('SLA-S1','S1',30,240),('SLA-S2','S2',60,480),('SLA-S3','S3',120,720),('SLA-S4','S4',180,1440);
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
INSERT INTO `status_history` VALUES ('00a9f573-77fd-46dd-b6e7-5d631bef1f40','100','teaml1','4','2','2025-08-13 14:56:26',1,'.'),('0263eda0-85ab-4245-9e5e-c702313a47c1','101','teaml1','3','2','2025-08-26 17:13:49',1,'Yes'),('02ab8909-b090-4056-93be-0ac4116dcbb1','050f176d-30ad-4144-a6cb-3741c141ab32','guest',NULL,'1','2025-09-03 03:56:56',0,NULL),('05b55e58-0f1d-4604-b38c-4e3ac6cd87cb','15','teaml1','1','2','2025-08-01 15:39:27',1,NULL),('069a6a95-977f-430c-b7a6-3db23b98617b','0ca90721-8cc0-481f-9aa7-e63634765409','teaml1','1','2','2025-08-29 14:05:18',1,'Yes'),('08a558ef-d7af-4632-b6d6-72d03b49b066','c49a82a7-de77-4ae2-8426-00155c30945a','teaml1',NULL,'1','2025-08-27 17:42:20',0,NULL),('0ac9b24e-b95b-4624-901d-793eb8ea1102','4fc4b944-86bd-4098-acc6-e0515b54fee8','teaml1',NULL,'1','2025-09-03 22:29:43',0,NULL),('1','1','arjunm','PENDING','ON_HOLD','2025-06-09 10:00:00',NULL,NULL),('10f53c2f-6afb-4491-b7a1-e4c7b31bfc3c','784398da-b7ca-4a55-85e8-c83ffd5744d0','teaml1',NULL,'1','2025-08-29 00:02:41',0,NULL),('11494c97-4dfc-4878-a468-d8ee60b0cf37','0c202644-1915-42e8-9a66-233cab462ae3','teaml1',NULL,'1','2025-08-28 17:25:18',0,NULL),('139e47b0-ee5a-4d7f-97d2-ea2335dd2af0','17','teaml1','1','2','2025-08-01 12:03:39',1,NULL),('17131af1-55d5-4f7c-86fb-d7e000a885b7','100','teaml1','2','4','2025-08-06 14:52:08',1,NULL),('1a78a330-6aae-43e2-97d8-285df2dc2816','8afd1dfe-6539-4e5b-8a8b-b86755f96e9f','216',NULL,'OPEN','2025-07-30 14:44:52',NULL,NULL),('1d630cfb-d84b-4a81-ae19-ac60e7e107e1','050f413c-78d1-4bdf-9943-8940773249f8','teaml1',NULL,'1','2025-08-28 16:10:46',0,NULL),('1db10ede-340e-4778-bcab-e6445b0f62f4','d17e02c2-7b29-4a78-93e1-c9b1b53c1fda','teaml1',NULL,'1','2025-08-28 23:27:29',0,NULL),('1fbdc1ea-ba16-403a-a5bb-ae9e131926a0','100','teaml1','7','10','2025-08-05 17:16:03',0,NULL),('2','5','helpdesk.user','ON_HOLD','CLOSED','2025-06-09 10:05:00',NULL,NULL),('20735df9-c429-479e-9d64-fda374e5698e','d396ca71-e577-464a-a468-e6dd4204d24f','teaml1',NULL,'1','2025-08-26 16:51:31',0,NULL),('293680f3-b52d-4873-a258-584aa1f644c9','13','teaml1','1','2','2025-08-01 15:24:31',1,NULL),('2d22d17a-0cd2-4f01-b038-3b6f6af15902','102','teaml1','1','2','2025-07-31 17:47:26',1,NULL),('2e0f8de8-a347-4d69-be39-a1846079cc39','d1ba2f3d-f548-49e8-8ad0-37c39282638a','guest',NULL,'1','2025-09-01 10:02:49',0,NULL),('3','6','eshas','PENDING','REOPENED','2025-06-09 10:10:00',NULL,NULL),('305c3fcf-d031-44c2-8689-d2c805a09452','4260d88a-5bf9-4e27-841f-1bc016bc5f60','teaml1',NULL,'1','2025-08-28 23:55:27',0,NULL),('31103d98-09b5-4459-adac-013eda520cc5','105','teaml1','1','2','2025-08-05 16:13:54',1,NULL),('31bd176d-8fb3-44f6-88e4-5576ad736966','106','teaml1','1','2','2025-08-01 15:20:23',1,NULL),('32bad3d5-2c26-4d1a-b30b-600019a2375d','78eb40f6-a118-4719-a47c-9b6ca9cb4e88','teaml1','1','2','2025-08-29 14:43:51',1,NULL),('350ddc38-cabb-429e-99c3-36f6fa5b281c','23','teaml1','1','2','2025-08-13 15:44:46',1,'Br'),('3519bbaf-b0ff-43af-b18b-0789c6eefbd3','100','teaml1','2','7','2025-08-05 17:10:40',0,NULL),('35a50dd0-7028-45a1-80a1-a4c872ef132a','78eb40f6-a118-4719-a47c-9b6ca9cb4e88','teaml1',NULL,'1','2025-08-29 14:43:51',0,NULL),('38285d7c-d815-44f3-a0cf-0c0b4fc1ffa5','18','teaml1','1','2','2025-08-01 12:32:45',1,NULL),('393036f5-5ae5-4335-8d8d-94c74fbff42f','df615e2b-5197-482f-a832-db8f39d35133','guest',NULL,'1','2025-09-01 10:02:25',0,NULL),('3e04fc16-624f-415f-9e33-386e0b9e29a3','c514ffa1-7e56-4539-a111-f6f69b3e4915','teaml1',NULL,'1','2025-08-24 14:16:13',0,NULL),('3e637e64-1f78-4985-8ed0-7cf518326a6d','109','teaml1','2','2','2025-08-01 12:22:54',1,NULL),('4','1','admin','ON_HOLD','RESOLVED','2025-06-24 12:05:00',NULL,NULL),('4045758f-f893-4780-8cc5-b15a03e112e1','1','teaml1','10','2','2025-08-05 17:01:30',1,NULL),('43ff9691-c25b-41d2-8303-3c1ae83d3747','759c863b-3f7e-43f6-8071-4cddd86594c9','teaml1',NULL,'1','2025-08-24 14:22:59',0,NULL),('47016d43-2bcc-40f6-8284-eb4cf45eae97','e65acebe-c2e9-4480-b0c7-4d9dcf9f62fd','teaml1',NULL,'1','2025-08-28 23:45:50',0,NULL),('4843ade3-65fb-4581-9218-4636d002d480','100','teaml1','2','7','2025-08-14 15:27:12',0,'Resolving'),('4b1558ce-cae8-4e91-b3cd-7c515c5913b8','050f176d-30ad-4144-a6cb-3741c141ab32','laras','2','7','2025-09-03 04:48:48',0,'Step 2'),('4ea13ead-cc06-45ae-ba92-851196a6ae6e','8fb1d6a2-2638-4f34-af3d-8d6f5003dfd3','teaml1',NULL,'1','2025-08-28 16:40:16',0,NULL),('5356eb8a-0caa-43c6-aa59-42433df10101','2f07b1d7-3abe-4a55-a902-dcdd2021c14c','guest','7','8','2025-09-02 14:59:15',0,'I am finally closing the ticket'),('56c37330-4425-4db2-b362-6e67a96d12f8','100','teaml1','10','2','2025-08-05 17:19:38',1,NULL),('5cb25a8d-38b8-4db2-b142-046913ae692c','22c3ca64-8798-4a67-84c2-e22ffe408109','teaml1',NULL,'1','2025-08-28 12:24:39',0,NULL),('60436c16-43fd-46fa-a54d-f56973d29037','110','teaml1','1','2','2025-08-01 15:37:18',1,NULL),('63714033-113b-4fe0-84d1-f2b0fb3c0788','050f176d-30ad-4144-a6cb-3741c141ab32','teaml1','1','2','2025-09-03 03:59:56',1,'Step 1'),('64f1101e-d8d2-41a4-a9d1-5123a4056f02','e6d5be7d-82c9-4fd0-9828-b38e2f33f84c','teaml1',NULL,'1','2025-08-27 11:25:59',0,NULL),('651668dd-73e8-494e-a88d-33752882240d','9ee8971e-03cb-4474-bd0e-98b5e36c1dac','rnoharshv',NULL,'1','2025-09-09 10:38:47',0,NULL),('65abafa5-72d0-42c4-a279-70a63cba58d7','43dfdb61-8b56-4503-b94e-3744f496beec','guest',NULL,'1','2025-09-09 18:40:22',0,NULL),('6921c2cc-530c-4137-8193-2028feadf0b8','98a742db-0f6d-47a1-9c4f-33548bddb833','216',NULL,'1','2025-07-31 12:56:14',0,NULL),('6d3808e1-3bc4-4206-9158-cb0b91aaf485','31929fa2-ed38-4eda-9701-ca827964682e','guest',NULL,'1','2025-09-09 18:11:00',0,NULL),('6ec3f92d-c6e6-4267-b931-a6f82bf079eb','dddb4214-1c40-433f-962f-1add1e55718f','teaml1',NULL,'1','2025-08-28 13:02:26',0,NULL),('702f7c71-b12f-4d6b-b809-6c8211f7d7bc','1','teaml1','7','10','2025-08-05 16:14:39',0,NULL),('72f16252-4b88-45d2-9cc4-e272b1dc6872','5920ff8b-0a96-46d1-a78a-d981813b2975','teaml1',NULL,'1','2025-08-28 16:09:02',0,NULL),('7362af5b-dda5-4d4e-95ef-b0171f6cf24a','e5d14449-3959-4f0a-996c-d1a270ff7808','teaml1',NULL,'1','2025-08-29 00:01:48',0,NULL),('76dbcb7f-66e5-4cbf-b54d-f2c85aa03211','016ad004-f2bd-4534-9469-bdf74bcafdef','teaml1',NULL,'1','2025-08-28 16:12:31',0,NULL),('7d571ad9-f26d-4dcc-9734-26e0d06ec97f','1','teaml1','2','7','2025-08-05 16:14:24',0,NULL),('7dfdc21b-528c-4e17-8c80-abd3f32652e0','2f07b1d7-3abe-4a55-a902-dcdd2021c14c','teaml1','1','2','2025-09-02 12:44:19',1,'Yes'),('7e56d135-b5c2-4774-aa21-7facdffc6d20','5cbe7f3a-fdfd-419a-96bc-7c0aa3ade368','teaml1',NULL,'1','2025-08-28 23:41:41',0,NULL),('848fe170-23e0-46a3-9b05-994ff9087227','2f07b1d7-3abe-4a55-a902-dcdd2021c14c','teaml1',NULL,'1','2025-09-02 12:25:10',0,NULL),('84acfd35-1157-4e19-957c-1ddf2106f90c','0ca90721-8cc0-481f-9aa7-e63634765409','kevinb','7','5','2025-09-03 16:43:52',0,'Assigning to FCI'),('877de6b6-4f7e-41b6-8de1-d51993e436d3','14','teaml1','1','2','2025-08-01 15:08:01',1,NULL),('8b34afec-82b9-47e2-bd20-a38243357f71','d54ea9fb-74c1-413a-b14a-feac5a9f1b1f','teaml1',NULL,'1','2025-08-28 16:45:04',0,NULL),('8d0555fe-7782-4231-924b-5dfe8a66b97c','1f44f974-b6c6-48ca-beb6-e00b0d24d1eb','teaml1',NULL,'1','2025-08-28 13:07:29',0,NULL),('8e4eb6d0-50bb-4761-b3b4-e17ba481e191','1a638018-5a97-4c5e-83cb-ca0b8ea16b35','teaml1',NULL,'1','2025-08-28 17:17:25',0,NULL),('8e7b6e30-9e2d-4f41-b859-0e4aebb3d383','37a74fc1-eef5-4254-9abb-75df3d0b0528','teaml1',NULL,'1','2025-09-03 22:50:12',0,NULL),('92084ad6-1bc2-4335-b954-bdcb4592ec72','37a74fc1-eef5-4254-9abb-75df3d0b0528','teaml1','2','5','2025-09-11 11:43:56',0,'Developing recommend severity flow'),('9b3ceedc-02de-4313-9870-662ed7c22f7d','4d912f6c-9733-4703-9b31-70015fe22951','216',NULL,'1','2025-07-31 12:27:48',0,NULL),('9b72da1e-8b17-4988-8b6d-f9c80c14dd08','4688183b-fbe0-41f3-81e3-3b2f0c76c7e7','teaml1',NULL,'1','2025-08-24 14:33:04',0,NULL),('9bdb3c50-c8e7-4479-b459-8eb19044c24c','1a18dd03-405e-4de9-8e14-d9ec9d2e3c8b','teaml1',NULL,'1','2025-08-28 23:27:40',0,NULL),('a26c8016-852c-4fe8-9eb4-676e099437d6','fcde0444-8169-4bdb-b1f1-7041a4505339','guest',NULL,'1','2025-09-10 22:55:05',0,NULL),('a5621af7-f466-47ea-b3af-a6fb24b1865f','97870ee1-fd11-40c8-a936-39fb4f658c68','guest',NULL,'1','2025-09-10 15:38:06',0,NULL),('a5d13530-bccd-4256-97fc-c54099847867','d80c88c9-ac59-447d-9930-b999e7525738','teaml1',NULL,'1','2025-09-02 10:09:00',0,NULL),('a72d29a4-0d0b-40ea-929f-075b146c1df1','12','teaml1','1','2','2025-08-01 12:30:16',1,NULL),('a8961ebf-0d87-43f3-a606-dd51e1bc0649','fe6fea66-64ed-441d-b93c-1eebed31f966','teaml1',NULL,'1','2025-08-28 23:26:22',0,NULL),('a9511d04-054e-48ec-bcd9-20b87d0a5b1d','a610c6d5-5136-4e2a-b619-5aeab16620c8','guest',NULL,'1','2025-09-01 10:07:30',0,NULL),('aac59796-689d-4d09-8aff-7314e2379c5c','27fae96b-3ffc-476d-b548-c2576bba52fc','guest',NULL,'1','2025-09-09 18:40:22',0,NULL),('ab1aa7f4-941f-414e-8cd8-7c95edc2c1b2','97520aef-fd4a-4013-af83-657130809aa0','teaml1',NULL,'1','2025-08-28 11:55:52',0,NULL),('adffe6de-fec1-4d00-a182-4f9a39901516','15','garimaj','2','7','2025-08-26 14:49:08',0,'Resolved'),('ae72f7a9-78d6-477f-9376-75ba88dcbff3','0ca90721-8cc0-481f-9aa7-e63634765409','teaml1',NULL,'1','2025-08-29 14:03:57',0,NULL),('b45d32ea-706f-4039-9831-13515115d868','103','teaml1','1','2','2025-07-31 17:50:06',1,NULL),('b9755e8a-39a2-4a20-8e2b-376bdb46c628','059308db-942e-4bbd-a760-2c408b7db8b4','teaml1',NULL,'1','2025-08-24 14:25:42',0,NULL),('bdf6cd9f-87be-40a8-b069-9a08f631bf74','16','teaml1','1','9','2025-08-13 10:05:24',0,'Checking remark for cancel'),('c1169ed4-8745-4403-8486-768970cbe0a0','59012c34-f3f2-4c50-87a4-bae91e429e56','teaml1',NULL,'1','2025-09-02 12:00:29',0,NULL),('c2402a5f-6248-4b78-9380-26e3bf363383','ddb183d7-f4a9-45ad-8600-a77c59aa7069','kevinb','2','7','2025-09-03 15:55:54',0,'testing submit button'),('c5da36d2-7e23-49d2-b0ac-d134c519454c','cee697aa-6d22-4250-bbb9-ce5367ad7ee4','guest',NULL,'1','2025-09-01 03:16:22',0,NULL),('c6d0d52f-23dd-4977-bed1-9910cae5d917','24','teaml1','1','9','2025-08-13 15:00:46',0,'Cancel'),('c71e5dd5-3062-411f-b5e2-2c282f628690','16','teaml1','9','2','2025-08-13 14:16:02',1,'.'),('c8d6e80a-688f-476e-b5e0-fcaed13a3fbd','104','teaml1','1','9','2025-08-05 16:12:59',0,NULL),('cbddc18e-ef8b-432e-aabc-7d7c0f54551d','88d8314f-faa3-4462-9d0a-1d329b7b14e9','216',NULL,'1','2025-07-31 11:58:09',0,NULL),('cc47943d-75c8-4ccc-8a36-0f68cb5d070f','ddb183d7-f4a9-45ad-8600-a77c59aa7069','216',NULL,'1','2025-07-31 12:54:30',0,NULL),('d0dc73cb-b8af-4aab-b71a-7b11bafabbef','1','teaml1','2','7','2025-08-05 17:39:03',0,NULL),('d2036d03-aa56-483c-838a-5657ad0d5f5a','101','teaml1','2','3','2025-08-05 17:14:08',0,NULL),('d61c6e7a-3143-4af8-8175-0443348a4056','c97d56bb-fcbd-4d36-a070-daf1fe8b612f','teaml1',NULL,'1','2025-08-24 14:07:37',0,NULL),('da47df63-41e5-409a-a8c1-813ec5496d25','26','teaml1','1','2','2025-08-01 15:35:22',1,NULL),('dc7a61e1-5eb5-4da5-8495-1c465ec6da0e','2','teaml1','1','2','2025-08-01 16:19:30',1,NULL),('dd5eba0e-bb80-4928-97f7-f0e170ea9a82','266f2e0f-c8b1-46d6-9752-44bdb6b1c417','teaml1',NULL,'1','2025-08-29 00:07:00',0,NULL),('e07ceef3-18ef-43c3-ae03-92459149fc1f','449a00d3-9ae1-4747-b9da-5dfb88809720','teaml1',NULL,'1','2025-08-28 15:53:42',0,NULL),('e1dee840-f47d-4007-8502-50657728dd67','d80daf25-e76e-407b-a2c0-5e67b8ddfdd1','guest',NULL,'1','2025-09-10 15:39:13',0,NULL),('e2820582-c58f-47ea-8d5b-a12e4c6de328','bcf829d1-0471-46c3-9a34-572a3f890cbf','teaml1',NULL,'1','2025-08-28 23:54:14',0,NULL),('e3bdada5-61c9-42f0-a908-af2c287dc34f','2b2b1934-d264-4b8f-8b55-8bdc214f73df','teaml1',NULL,'1','2025-08-28 16:00:38',0,NULL),('e74c3445-3e7a-48af-919c-3b18d36d1f22','050f176d-30ad-4144-a6cb-3741c141ab32','laras','7','8','2025-09-03 04:49:03',0,'Step 3'),('e8ed092a-f3d4-46bd-ab65-38ce5c969328','46ef0f9f-6647-46e6-ba57-d367c101901c','teaml1',NULL,'1','2025-07-31 15:45:54',0,NULL),('ea9e4497-72a9-4112-91b3-a15c7272bd61','37a74fc1-eef5-4254-9abb-75df3d0b0528','teaml1','1','3','2025-09-03 22:51:01',0,'Step 2'),('eb5d5fc6-b721-4900-9bdf-3fcdcdd2fcb0','2109447d-71b6-4308-beec-b90d25a1715b','guest',NULL,'1','2025-09-10 23:09:05',0,NULL),('ede4ae1f-d666-4e1c-9811-587e83cb29c1','2f07b1d7-3abe-4a55-a902-dcdd2021c14c','kevinb','2','7','2025-09-02 14:55:32',0,'Testing has been resolved'),('f005b8fc-4011-40a6-bf4d-4f3204230af6','22','teaml1','1','2','2025-08-13 15:43:26',1,'Remark assigned to BR'),('f4cd3ad2-8c71-45c3-8537-66fea9cee1a3','42555806-9bc8-4c37-a291-8516c0ac555f','guest',NULL,'1','2025-09-01 10:06:39',0,NULL),('f53e9581-7723-4906-8b16-2076e290d07e','c9abe99e-ea39-4e97-9103-913e1c471a10','teaml1',NULL,'1','2025-08-28 23:24:45',0,NULL),('f563b76d-5fcc-4fa9-808a-00923d6ac925','0ca90721-8cc0-481f-9aa7-e63634765409','kevinb','2','7','2025-09-03 15:05:14',0,'Testing to see feedback'),('f60aca8a-b761-4c1e-a0b2-6794d95c43c0','37a74fc1-eef5-4254-9abb-75df3d0b0528','guest','3','2','2025-09-03 22:53:12',1,'Submitting back'),('fb22af1f-4d59-4370-9246-4ff7a8beac5d','8a72a931-e83b-4c68-a150-ce63d9398e30','teaml1',NULL,'1','2025-08-28 23:21:40',0,NULL),('fbd5655a-62ea-47f7-9fd1-97d72c7a9bde','ddb183d7-f4a9-45ad-8600-a77c59aa7069','teaml1','1','2','2025-08-01 16:24:33',1,NULL),('fd0a8520-e37e-4ea5-b229-65aa4c553e6d','ddb183d7-f4a9-45ad-8600-a77c59aa7069','chirags','7','8','2025-09-03 16:05:10',0,'Closing to test Feedback form');
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_feedback`
--

LOCK TABLES `ticket_feedback` WRITE;
/*!40000 ALTER TABLE `ticket_feedback` DISABLE KEYS */;
INSERT INTO `ticket_feedback` VALUES (1,'050f176d-30ad-4144-a6cb-3741c141ab32','211','2025-09-04 16:37:32',5,3,1,2,'');
/*!40000 ALTER TABLE `ticket_feedback` ENABLE KEYS */;
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
  `resolution_time_minutes` bigint DEFAULT NULL,
  `elapsed_time_minutes` bigint DEFAULT NULL,
  `response_time_minutes` bigint DEFAULT NULL,
  `breached_by_minutes` bigint DEFAULT NULL,
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
INSERT INTO `ticket_sla` VALUES ('acfba5d7-a356-4adb-bb06-a0c9af9082dc','2109447d-71b6-4308-beec-b90d25a1715b','SLA-S2','2025-09-11 01:39:03',0,0,330,-149);
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
INSERT INTO `ticket_status_workflow` VALUES (1,'Assign',1,2),(2,'Cancel/ Reject',1,9),(3,'Assign Further',2,2),(4,'On Hold (Pending with Requester)',2,3),(5,'Resolve',2,7),(6,'Close',7,8),(7,'Reopen',7,10),(8,'Assign',10,2),(9,'Assign / Assign Further',3,2),(10,'Assign / Assign Further',4,2),(11,'Recommend Escalation',2,6),(12,'Approve Escalation',6,11),(15,'On Hold (Pending with Service Provider)',2,4),(16,'On Hold (Pending with FCI)',2,5),(17,'Assign',11,2),(18,'Assign / Assign Further',7,2),(19,'Resume',3,2),(20,'Resume',4,2),(21,'Resume',5,2);
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
INSERT INTO `tickets` VALUES ('016ad004-f2bd-4534-9469-bdf74bcafdef','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 18','Testing fu','1','1002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('050f176d-30ad-4144-a6cb-3741c141ab32','2025-09-02 22:26:56','Self','211','guest','guest@example.com','6135712345','Testing creation 35','Testing full flow','1','1004','P1','050f176d-30ad-4144-a6cb-3741c141ab32/1339080d-6572-4e43-9ca4-c8a8304fdf3a_L shaped Table top.png',0,NULL,'2025-09-09 13:22:35','CLOSED','L2','L2','laras','guest','S3',NULL,NULL,NULL,NULL,'8','2025-09-03 04:49:03','PROVIDED','laras'),('050f413c-78d1-4bdf-9943-8940773249f8','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 18','Testing fu','1','1002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('059308db-942e-4bbd-a760-2c408b7db8b4','2025-08-24 00:00:00','Self','216','laras','team.lead1@example.com','1212121212','Testing creation 7','Testing Go to My Tickets page button','6','6001','P4',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('0c202644-1915-42e8-9a66-233cab462ae3','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 22','testing ','1','1004','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('0ca90721-8cc0-481f-9aa7-e63634765409','2025-08-29 08:33:57','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 29','Testing full raise ticket','1','1001','P1','0ca90721-8cc0-481f-9aa7-e63634765409/6e21620b-d158-4882-b9de-5b3b785fc8b1_dadu.jpg,0ca90721-8cc0-481f-9aa7-e63634765409/4dc1aa31-f9f5-4e32-baaa-bddd56d849cb_L shaped Table top.png',0,NULL,'2025-09-09 13:22:35','PENDING_WITH_FCI','L2','L2','rnoharshv','teaml1','S1',NULL,NULL,NULL,NULL,'5',NULL,'PENDING','kevinb'),('1','2025-04-08 00:00:00','Call',NULL,'ishaanm','team@lead.com','1212121212','Can\'t change password','Issue related to password reset. Please assist.','8','8004','P3',NULL,0,'1','2025-09-09 13:22:35','CLOSED',NULL,NULL,'eshas',NULL,'S1','',NULL,NULL,NULL,'8',NULL,'PENDING','teaml1'),('100','2025-06-05 00:00:00','Call',NULL,'laras',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','4','4002','P1','',0,NULL,'2025-09-09 13:22:35','CLOSED','L2',NULL,'harshv',NULL,'S3',NULL,NULL,NULL,NULL,'8','2025-08-14 15:27:11','PENDING','teaml1'),('101','2025-06-05 00:00:00','Call',NULL,'kevinb',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','9','9001','P1','',0,NULL,'2025-09-09 13:22:35','ASSIGNED','L1',NULL,'jayan',NULL,'S4',NULL,NULL,NULL,NULL,'2',NULL,'PENDING','teaml1'),('102','2025-06-05 00:00:00','Call',NULL,'eshas',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','4','4001','P1','',1,NULL,'2025-09-09 13:22:35','ASSIGNED','L3',NULL,'laras',NULL,'S3',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('103','2025-06-05 00:00:00','Call',NULL,'divyak',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','9','9002','P1','',1,NULL,'2025-09-09 13:22:35','ASSIGNED','L1',NULL,'mohank',NULL,'S4',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('104','2025-06-05 00:00:00','Call',NULL,'eshas',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','4','4001','P1','',1,NULL,'2025-09-09 13:22:35','CANCELLED','L2',NULL,NULL,NULL,'S3',NULL,NULL,NULL,NULL,'9',NULL,'PENDING',NULL),('105','2025-06-05 00:00:00','Call','203','chirags',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','5','5008','P1','',1,NULL,'2025-09-09 13:22:35','ASSIGNED','L3',NULL,'arjunm',NULL,'S3',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('106','2025-06-08 00:00:00','Call',NULL,'divyak',NULL,NULL,'T!','In the sales report, total revenue is not adding up correctly when multiple orders are placed on the same day.','5','5007','P2',NULL,0,NULL,'2025-09-09 13:22:35','ASSIGNED','L2',NULL,'garimaj',NULL,'S1','',NULL,NULL,NULL,'2',NULL,'PENDING','garimaj'),('107','2025-06-12 00:00:00','Self','211','guest',NULL,NULL,'s1','d1','9','9003','P3',NULL,0,NULL,'2025-09-09 13:22:35','ON_HOLD','',NULL,'201','nimit.jain','S4',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('108','2025-06-12 00:00:00','Self','201','garimaj',NULL,NULL,'s1','d1','8','8004','P3',NULL,1,NULL,'2025-09-09 13:22:35','ON_HOLD','',NULL,'201','nimit.jain','S1',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('109','2025-06-12 00:00:00','Self','201','usern',NULL,NULL,'s1','d1','8','8003','P3',NULL,1,NULL,'2025-09-09 13:22:35','ASSIGNED','1',NULL,'ishaanm','nimit.jain','S3',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('11','2025-04-11 00:00:00','Call',NULL,'bhavyar',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','8','8001','P2','',0,'11','2025-09-09 13:22:35','ASSIGNED','L1',NULL,'bhavyar',NULL,'S3',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('110','2025-06-16 00:00:00','Email','203','chirags',NULL,NULL,'Ticket created by IT','Need to check this description box','6','6001','P3',NULL,0,NULL,'2025-09-09 13:22:35','ASSIGNED',NULL,NULL,'harshv','helpdesk.user','S1',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('111','2025-06-17 00:00:00','Call',NULL,'teaml1','john@doe.com','12341234','T created by Farmer','Description input text allignment wrong','5','5004','P3',NULL,0,NULL,'2025-09-09 13:22:35','PENDING','L1',NULL,'arjunm','helpdesk.user','S3',NULL,NULL,NULL,'Farmer','2',NULL,'PENDING',NULL),('112','2025-06-24 00:00:00','Email','211','guest','kevin.brooks@example.com','9123456790','System Crash','System crash when saving data','1','1002','P1','/files/log.txt',0,NULL,'2025-09-09 13:22:35','PENDING','L1',NULL,'Kevin Brooks','admin','S2','HIGH','admin','Critical','Management','2',NULL,'PENDING',NULL),('12','2025-04-06 00:00:00','Self',NULL,'harshv',NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','3','3001','P4','',1,'11','2025-09-09 13:22:35','ASSIGNED','L3',NULL,'divyak',NULL,'S4',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('13','2025-05-23 00:00:00','Self',NULL,'usern',NULL,NULL,'Outlook crashes on launch','Issue related to outlook. Please assist.','1','1001','P2','',0,'11','2025-09-09 13:22:35','ASSIGNED','L1',NULL,'jayan',NULL,'S1',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('14','2025-04-26 00:00:00','Call','211','guest',NULL,NULL,'Internet not working','Issue related to connectivity. Please assist.','8','8004','P2','',1,'11','2025-09-09 13:22:35','ASSIGNED','L2',NULL,'jayan',NULL,'S1',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('15','2025-05-21 00:00:00','Self',NULL,'divyak',NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','4','4003','P4','',0,'11','2025-09-09 13:22:35','RESOLVED','L3',NULL,'garimaj',NULL,'S4',NULL,NULL,NULL,NULL,'7','2025-08-26 14:49:07','PENDING','garimaj'),('16','2025-05-05 00:00:00','Call',NULL,'jayan',NULL,NULL,'Stuck at login screen','Issue related to login. Please assist.','1','1003','P4','',1,'11','2025-09-09 13:22:35','ASSIGNED','L2',NULL,'arjunm',NULL,'S2',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('17','2025-05-10 00:00:00','Email',NULL,'garimaj',NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','9','9003','P4','',0,'11','2025-09-09 13:22:35','ASSIGNED','L1',NULL,'eshas',NULL,'S4',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('18','2025-04-16 00:00:00','Email',NULL,'jayan',NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','7','7001','P4','',1,'11','2025-09-09 13:22:35','ASSIGNED','L3',NULL,'mohank',NULL,'S1',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('1a18dd03-405e-4de9-8e14-d9ec9d2e3c8b','2025-08-28 17:57:40','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 23','Testing uploading files','9','9002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('1a638018-5a97-4c5e-83cb-ca0b8ea16b35','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 21','Testing','1','1003','P4',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('1f44f974-b6c6-48ca-beb6-e00b0d24d1eb','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 15','Testing file upload','1','1003','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('2','2025-06-03 00:00:00','Self',NULL,'laras',NULL,NULL,'Forgot my password','Issue related to password reset. Please assist.','5','5010','P1','',1,'1','2025-09-09 13:22:35','ASSIGNED','L2',NULL,'harshv',NULL,'S3',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('21','2025-05-20 00:00:00','Call',NULL,'harshv',NULL,NULL,'Blue screen error','Issue related to system crash. Please assist.','4','4001','P3','',0,'21','2025-09-09 13:22:35','CANCELLED','L3',NULL,NULL,NULL,'S3',NULL,NULL,NULL,NULL,'9',NULL,'PENDING',NULL),('2109447d-71b6-4308-beec-b90d25a1715b','2025-09-10 17:39:03','Self','211','guest','guest@example.com','6135712345','Testing creation 39','Testing sla','1','1003','P1',NULL,0,NULL,NULL,'OPEN',NULL,NULL,NULL,'guest','S2',NULL,NULL,NULL,NULL,'1',NULL,NULL,'guest'),('22','2025-05-25 00:00:00','Self',NULL,'garimaj',NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','2','2001','P3','',1,'21','2025-09-09 13:22:35','ASSIGNED','L2',NULL,'bhavyar',NULL,'S4',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('22c3ca64-8798-4a67-84c2-e22ffe408109','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 14','Testing file_upload while ticket creation','2','2002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('23','2025-04-18 00:00:00','Email',NULL,'ishaanm',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','7','7001','P1','',0,'21','2025-09-09 13:22:35','ASSIGNED','L1',NULL,'arjunm',NULL,'S1',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('24','2025-04-26 00:00:00','Call','203','chirags',NULL,NULL,'Email stuck in outbox','Issue related to outlook. Please assist.','2','2003','P4','',1,'21','2025-09-09 13:22:35','CANCELLED','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'9',NULL,'PENDING',NULL),('25','2025-04-05 00:00:00','Email','118','bhavyar',NULL,NULL,'Forgot my password','Issue related to password reset. Please assist.','1','1004','P2','',0,'21','2025-09-09 13:22:35','CLOSED','L1',NULL,NULL,NULL,'S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('26','2025-05-21 00:00:00','Self',NULL,'ishaanm',NULL,NULL,'System crashes on boot','Issue related to system crash. Please assist.','8','8002','P2','',1,'21','2025-09-09 13:22:35','ASSIGNED','L2',NULL,'guest',NULL,'S1',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('266f2e0f-c8b1-46d6-9752-44bdb6b1c417','2025-08-28 18:36:59','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 27','Uploading files','3','3001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('27','2025-05-06 00:00:00','Call','100','garimaj',NULL,NULL,'Outlook crashes on launch','Issue related to outlook. Please assist.','9','9002','P1','',0,'21','2025-09-09 13:22:35','PENDING','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('27fae96b-3ffc-476d-b548-c2576bba52fc','2025-09-09 13:10:11','Self','211','guest','guest@example.com','6135712345','Testing creation 37','Testing ticket_sla table updation','2','2001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'guest','S4',NULL,NULL,NULL,NULL,'1',NULL,NULL,'guest'),('2b2b1934-d264-4b8f-8b55-8bdc214f73df','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 17','testing api ','1','1002','P2',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('2f07b1d7-3abe-4a55-a902-dcdd2021c14c','2025-09-02 06:55:09','Call','211','guest','guest@example.com','6135712345','Testing creation 35','Testing Raise Ticket via Call','1','1004','P4','2f07b1d7-3abe-4a55-a902-dcdd2021c14c/d5b4ae30-46d8-45f3-a854-18a5d1197a4b_L shaped Table top.png',0,NULL,'2025-09-09 13:22:35','CLOSED','L2','L2','kevinb','teaml1','S3',NULL,NULL,NULL,NULL,'8','2025-09-02 14:55:32','PENDING','guest'),('3','2025-04-16 00:00:00','Call','100','ishaanm',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','7','7004','P2','',0,'1','2025-09-09 13:22:35','PENDING','L3',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('31','2025-05-14 00:00:00','Self','168','kevinb',NULL,NULL,'VPN fails during connection','Issue related to vpn. Please assist.','1','1003','P4','',0,'31','2025-09-09 13:22:35','PENDING','L1',NULL,NULL,NULL,'S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('31929fa2-ed38-4eda-9701-ca827964682e','2025-09-09 12:41:00','Self','211','guest','guest@example.com','6135712345','Testing creation 37','Testing ticket_sla table updation','2','2001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'guest','S4',NULL,NULL,NULL,NULL,'1',NULL,NULL,'guest'),('32','2025-04-20 00:00:00','Call','176','divyak',NULL,NULL,'Outlook not opening','Issue related to outlook. Please assist.','7','7005','P3','',1,'31','2025-09-09 13:22:35','ON_HOLD','L2',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('33','2025-05-31 00:00:00','Call','211','guest',NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','3','3001','P1','',0,'31','2025-09-09 13:22:35','PENDING','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('34','2025-05-04 00:00:00','Self','188','arjunm',NULL,NULL,'Outlook not opening','Issue related to outlook. Please assist.','4','4001','P4','',1,'31','2025-09-09 13:22:35','PENDING','L2',NULL,NULL,NULL,'S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('35','2025-05-10 00:00:00','Email','124','harshv',NULL,NULL,'False positive alerts','Issue related to antivirus. Please assist.','5','5003','P2','',0,'31','2025-09-09 13:22:35','CLOSED','L1',NULL,NULL,NULL,'S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('36','2025-05-02 00:00:00','Call','211','guest',NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','6','6001','P1','',1,'31','2025-09-09 13:22:35','REOPENED','L3',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('37a74fc1-eef5-4254-9abb-75df3d0b0528','2025-09-03 17:20:11','Call','211','guest','guest@example.com','6135712345','Testing creation 36','Testing On Hold status (Requestor)','1','1003','P1',NULL,0,NULL,'2025-09-09 13:22:35','PENDING_WITH_FCI',NULL,NULL,'211','teaml1','S2',NULL,NULL,NULL,NULL,'5',NULL,'PENDING','teaml1'),('4','2025-04-15 00:00:00','Self','153','divyak',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','2','2004','P3','',1,'1','2025-09-09 13:22:35','ON_HOLD','L2',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('41','2025-05-19 00:00:00','Self','141','bhavyar',NULL,NULL,'Unable to login','Issue related to login. Please assist.','9','9003','P3','',0,'41','2025-09-09 13:22:35','PENDING','L1',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('42','2025-06-02 00:00:00','Self','203','chirags',NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','10','10001','P2','',1,'41','2025-09-09 13:22:35','REOPENED','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('42555806-9bc8-4c37-a291-8516c0ac555f','2025-09-01 04:36:39','Self','211','guest','guest@example.com','6135712345','Testing creation 32','Testing Requestor Raise ticket again','5','5002','P3',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'guest','S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','guest'),('4260d88a-5bf9-4e27-841f-1bc016bc5f60','2025-08-28 18:25:26','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 24','Uploading files','5','5011','P1','4260d88a-5bf9-4e27-841f-1bc016bc5f60/86e87f73-bc3b-49ae-aed4-34090e550d10__2020_PTR_1030102000164007d098a85-0a6c-4e39-b90a-81e877f97d57.pdf',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('43','2025-04-17 00:00:00','Email','140','garimaj',NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','9','9003','P1','',0,'41','2025-09-09 13:22:35','PENDING','L1',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('43dfdb61-8b56-4503-b94e-3744f496beec','2025-09-09 13:10:14','Self','211','guest','guest@example.com','6135712345','Testing creation 37','Testing ticket_sla table updation','2','2001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'guest','S4',NULL,NULL,NULL,NULL,'1',NULL,NULL,'guest'),('44','2025-05-29 00:00:00','Email','128','divyak',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','6','6001','P2','',1,'41','2025-09-09 13:22:35','ON_HOLD','L2',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('449a00d3-9ae1-4747-b9da-5dfb88809720','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 16','Not Testing upload files','2','2002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('45','2025-05-31 00:00:00','Self','148','kevinb',NULL,NULL,'Can\'t print documents','Issue related to printer. Please assist.','1','1001','P4','',0,'41','2025-09-09 13:22:35','CLOSED','L3',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('4688183b-fbe0-41f3-81e3-3b2f0c76c7e7','2025-08-24 00:00:00','Self','216','arjunm','team.lead1@example.com','1212121212','Testing creation 8','Testing Raise New Ticket button','3','3001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('46ef0f9f-6647-46e6-ba57-d367c101901c','2025-07-31 00:00:00','Self','216','divyak','team.lead1@example.com','1212121212','Testing status 1','Status is OPEN only','7','7002','P3',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('4d912f6c-9733-4703-9b31-70015fe22951','2025-07-31 00:00:00','Call','202','bhavyar','bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','10','10001','P3',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'216','S4',NULL,NULL,NULL,'Farmer','1',NULL,'PENDING',NULL),('4fc4b944-86bd-4098-acc6-e0515b54fee8','2025-09-03 16:59:41','Self','216','Team Lead Name 1','team.lead1@example.com','1212121212','Testing creation 36','Dummy description','1','1002','P1','4fc4b944-86bd-4098-acc6-e0515b54fee8/aebf88fe-1eee-40e9-8e25-2d22da35c058_L shaped Table top.png',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('5','2025-04-10 00:00:00','Call','191','divyak',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','4','4001','P1','',0,'1','2025-09-09 13:22:35','CLOSED','L1',NULL,NULL,NULL,'S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('51','2025-05-17 00:00:00','Call','125','harshv',NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','1','1003','P1','',0,'51','2025-09-09 13:22:35','PENDING','L3',NULL,NULL,NULL,'S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('52','2025-05-21 00:00:00','Email','131','kevinb',NULL,NULL,'Can\'t send email','Issue related to outlook. Please assist.','6','6001','P1','',1,'51','2025-09-09 13:22:35','ON_HOLD','L2',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('53','2025-05-05 00:00:00','Self','118','bhavyar',NULL,NULL,'Stuck at login screen','Issue related to login. Please assist.','8','8004','P3','',0,'51','2025-09-09 13:22:35','PENDING','L1',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('54','2025-04-08 00:00:00','Self','149','bhavyar',NULL,NULL,'Printer showing error code','Issue related to printer. Please assist.','9','9001','P3','',1,'51','2025-09-09 13:22:35','REOPENED','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('59012c34-f3f2-4c50-87a4-bae91e429e56','2025-09-02 06:30:21','Self','216','Team Lead Name 1','team.lead1@example.com','1212121212','Testing creation 34','Testing Submit button Raise Ticket','3','3001','P2',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('5920ff8b-0a96-46d1-a78a-d981813b2975','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 18','Testing fu','1','1002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('5cbe7f3a-fdfd-419a-96bc-7c0aa3ade368','2025-08-28 18:11:40','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 23','Testing uploading files','9','9002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('6','2025-04-25 00:00:00','Call','195','laras',NULL,NULL,'VPN fails during connection','Issue related to vpn. Please assist.','3','3002','P2','',1,'1','2025-09-09 13:22:35','REOPENED','L3',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('61','2025-05-31 00:00:00','Email','126','kevinb',NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','7','7005','P3','',0,'61','2025-09-09 13:22:35','PENDING','L1',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('62','2025-04-12 00:00:00','Self','164','farhana',NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','3','3001','P1','',1,'61','2025-09-09 13:22:35','PENDING','L2',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('63','2025-05-19 00:00:00','Email','172','farhana',NULL,NULL,'Login page not loading','Issue related to login. Please assist.','2','2006','P3','',0,'61','2025-09-09 13:22:35','PENDING','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('7','2025-05-30 00:00:00','Email','186','ishaanm',NULL,NULL,'Can\'t connect to VPN','Issue related to vpn. Please assist.','1','1004','P3','',0,'1','2025-09-09 13:22:35','PENDING','L1',NULL,NULL,NULL,'S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('71','2025-04-21 00:00:00','Self','112','farhana',NULL,NULL,'Email not syncing','Issue related to outlook. Please assist.','10','10001','P3','',0,'71','2025-09-09 13:22:35','PENDING','L1',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('72','2025-04-17 00:00:00','Call','155','mohank',NULL,NULL,'VPN disconnects randomly','Issue related to vpn. Please assist.','9','9003','P3','',1,'71','2025-09-09 13:22:35','REOPENED','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('759c863b-3f7e-43f6-8071-4cddd86594c9','2025-08-24 00:00:00','Self','216','jayan','team.lead1@example.com','1212121212','Testing creation 6','Testing buttons on successful modal','5','5007','P3',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('784398da-b7ca-4a55-85e8-c83ffd5744d0','2025-08-28 18:32:41','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 26','uploading files','4','4001','P3','784398da-b7ca-4a55-85e8-c83ffd5744d0/8fb77c43-f182-4ed0-8175-de699c56ec40_Wheat_Free_Flour_Plan_Delhi.pdf',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('78eb40f6-a118-4719-a47c-9b6ca9cb4e88','2025-08-29 09:13:50','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 30','Testing full RT','1','1001','P1','78eb40f6-a118-4719-a47c-9b6ca9cb4e88/5b3d764e-e939-49ac-bab3-bf8a6b49a7e2_dadu.jpg,78eb40f6-a118-4719-a47c-9b6ca9cb4e88/d9bc8445-e73a-40af-aa8b-3a2afda88815_Daksh Jain.jpg,78eb40f6-a118-4719-a47c-9b6ca9cb4e88/a9695044-ae34-475e-8fe0-687098e8924f_L shaped Table top.png',0,NULL,'2025-09-09 13:22:35','ASSIGNED','L1','L1','garimaj','teaml1','S1',NULL,NULL,NULL,NULL,'2',NULL,'PENDING','teaml1'),('8','2025-04-23 00:00:00','Email','127','ishaanm',NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','2','2009','P3','',1,'1','2025-09-09 13:22:35','ON_HOLD','L2',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('81','2025-06-02 00:00:00','Email','160','arjunm',NULL,NULL,'VPN disconnects randomly','Issue related to vpn. Please assist.','7','7001','P3','',0,'81','2025-09-09 13:22:35','PENDING','L3',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('88d8314f-faa3-4462-9d0a-1d329b7b14e9','2025-07-31 00:00:00','Call','211','guest','bhavya.rao@example.com','9123456781','Testing Creation 2','Creating + Assigning','10','10001','P3',NULL,0,NULL,'2025-09-09 13:22:35','OPEN','1',NULL,NULL,'216','S4',NULL,NULL,NULL,'Farmer','1',NULL,'PENDING',NULL),('8a72a931-e83b-4c68-a150-ce63d9398e30','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Sample Issue Subject','This is a sample description for testing purposes.','3','3001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('8afd1dfe-6539-4e5b-8a8b-b86755f96e9f','2025-07-30 00:00:00','Call','202','eshas','bhavya.rao@example.com','9123456781','Testing creation 1','Status at the time of creation should be Open','3','3002','P3',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'216','S1',NULL,NULL,NULL,'Farmer','1',NULL,'PENDING',NULL),('8fb1d6a2-2638-4f34-af3d-8d6f5003dfd3','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 19','Testinh uf','1','1002','P1','8fb1d6a2-2638-4f34-af3d-8d6f5003dfd3/eab5652a-9425-496a-82f0-0dd3e088c0ac_dadu.jpg,8fb1d6a2-2638-4f34-af3d-8d6f5003dfd3/107d4e76-f6b7-44d6-8fd9-aedfe8e06690_Daksh Jain.jpg',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('9','2025-04-26 00:00:00','Call','161','kevinb',NULL,NULL,'Can\'t access my account','Issue related to login. Please assist.','9','9002','P1','',0,'1','2025-09-09 13:22:35','PENDING','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('96','2025-06-05 00:00:00','Email','1024','kevinb',NULL,NULL,'Unable to access internal portal','The intranet portal shows a 403 forbidden error since morning.','9','9003','P1','',0,NULL,'2025-09-09 13:22:35','REOPENED','L3',NULL,NULL,NULL,'S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('97','2025-06-05 00:00:00','Email','1014','eshas',NULL,NULL,'Cannot access internal portal','The intranet portal shows a 403 forbidden error since morning.','4','4002','P1','',0,NULL,'2025-09-09 13:22:35','PENDING','L1',NULL,NULL,NULL,'S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('97520aef-fd4a-4013-af83-657130809aa0','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 13','Testing the uploaded_files table updation','2','2003','P1','97520aef-fd4a-4013-af83-657130809aa0/2f472e7d-0444-46ca-9f43-00063f22abc4_dadu.jpg,97520aef-fd4a-4013-af83-657130809aa0/7cca1117-47c3-43e1-a325-eda6abea96ba_Daksh Jain.jpg',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('97870ee1-fd11-40c8-a936-39fb4f658c68','2025-09-10 10:08:03','Self','211','guest','guest@example.com','6135712345','Testing creation 37','Testing ticket_sla table updation','2','2001','P1',NULL,0,NULL,NULL,'OPEN',NULL,NULL,NULL,'guest',NULL,NULL,NULL,NULL,NULL,'1',NULL,NULL,'guest'),('98','2025-06-05 00:00:00','Call','1111','mohank',NULL,NULL,'Cannot access internal portal','The intranet portal shows a 403 forbidden error since morning.','1','1001','P1','',0,NULL,'2025-09-09 13:22:35','PENDING','L2',NULL,NULL,NULL,'S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('98a742db-0f6d-47a1-9c4f-33548bddb833','2025-07-31 00:00:00','Call','202','garimaj','bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','5','5003','P3',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'216','S3',NULL,NULL,NULL,'Farmer','1',NULL,'PENDING',NULL),('99','2025-06-05 00:00:00','Call','1112','harshv',NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','3','3003','P1','',0,NULL,'2025-09-09 13:22:35','PENDING','L3',NULL,NULL,NULL,'S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING',NULL),('9ee8971e-03cb-4474-bd0e-98b5e36c1dac','2025-09-09 05:08:46','Self','208','rnoharshv','harsh.verma@example.com','9123456787','Testing creation 36','Testing sla table updation','1','1001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'rnoharshv','S1',NULL,NULL,NULL,NULL,'1',NULL,NULL,'rnoharshv'),('a610c6d5-5136-4e2a-b619-5aeab16620c8','2025-09-01 04:37:30','Self','211','guest','guest@example.com','6135712345','Testing creation 33','Testing Raise ticket ofter clicking RaiseTikcet option','7','7003','P2',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'guest','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','guest'),('bcf829d1-0471-46c3-9a34-572a3f890cbf','2025-08-28 18:24:13','Self','216',NULL,'team.lead1@example.com','1212121212','Sample Issue Subject','This is a sample description for testing purposes.','6','6001','P1','bcf829d1-0471-46c3-9a34-572a3f890cbf/465dd6b9-1a2a-46b7-a2a0-29076262db51_Daksh Jain.jpg,bcf829d1-0471-46c3-9a34-572a3f890cbf/e90bd05a-58c6-4f5f-a266-177eb3c83104_dadu.jpg',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('c49a82a7-de77-4ae2-8426-00155c30945a','2025-08-27 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 12','Testing multiple image upload','2','2004','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('c514ffa1-7e56-4539-a111-f6f69b3e4915','2025-08-24 00:00:00','Self','216','usern','team.lead1@example.com','1212121212','Testing creation 5','Testing closing of successful modal','6','6001','P2',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('c97d56bb-fcbd-4d36-a070-daf1fe8b612f','2025-08-24 00:00:00','Self','216','bhavyar','team.lead1@example.com','1212121212','Testing creation 4','Cat, subCat, Priority saved by id.','6','6001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('c9abe99e-ea39-4e97-9103-913e1c471a10','2025-08-28 17:54:44','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 22','This is a sample description for testing purposes.','1','1004','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('cee697aa-6d22-4250-bbb9-ce5367ad7ee4','2025-08-31 21:46:18','Self','211','guest','guest@example.com','6135712345','Testing creation 30','Testing Requestor Raise Form','2','2004','P1','cee697aa-6d22-4250-bbb9-ce5367ad7ee4/861137e8-2077-44c0-9ab5-9317ef3f9924_L shaped Table top.png',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'guest','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','guest'),('d17e02c2-7b29-4a78-93e1-c9b1b53c1fda','2025-08-28 17:57:28','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 23','Testing uploading files','9','9002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('d1ba2f3d-f548-49e8-8ad0-37c39282638a','2025-09-01 04:32:49','Self','211','guest','guest@example.com','6135712345','Testing creation 31','Testing Requestor raise ticket','6','6001','P1','d1ba2f3d-f548-49e8-8ad0-37c39282638a/af49395d-6c36-4995-b1ef-2ac19f887457_Table drawn.PNG',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'guest','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','guest'),('d396ca71-e577-464a-a468-e6dd4204d24f','2025-08-26 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','A','b','1','1004','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('d54ea9fb-74c1-413a-b14a-feac5a9f1b1f','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Ticket created by 20','Testing attachment path','5','5002','P1','d54ea9fb-74c1-413a-b14a-feac5a9f1b1f/6d506b72-be54-45e8-b1a0-ced900ede676_L shaped Table top.png',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('d80c88c9-ac59-447d-9930-b999e7525738','2025-09-02 04:38:59','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 33','Testing Raise Ticket via call','1','1002','P4',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('d80daf25-e76e-407b-a2c0-5e67b8ddfdd1','2025-09-10 10:09:13','Self','211','guest','guest@example.com','6135712345','Testing creation 38','Testing sla','2','2009','P1',NULL,0,NULL,NULL,'OPEN',NULL,NULL,NULL,'guest',NULL,NULL,NULL,NULL,NULL,'1',NULL,NULL,'guest'),('d85e3fbc-0e03-40c4-951b-22d0b4130f9f','2025-07-17 00:00:00','Self','201','bhavyar','arjun.mehta@example.com','9123456780','S1','D1','2','2008','P3',NULL,0,NULL,'2025-09-09 13:22:35',NULL,'L1',NULL,'205','201','S4',NULL,NULL,NULL,NULL,'2',NULL,'PENDING',NULL),('ddb183d7-f4a9-45ad-8600-a77c59aa7069','2025-07-31 00:00:00','Call','203','chirags','bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','4','4003','P3',NULL,0,NULL,'2025-09-09 13:22:35','CLOSED',NULL,NULL,'kevinb','216','S4',NULL,NULL,NULL,'Farmer','8','2025-09-03 16:05:10','PENDING','chirags'),('dddb4214-1c40-433f-962f-1add1e55718f','2025-08-28 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 15','Testing attachments upload ','1','1002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S2',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('df615e2b-5197-482f-a832-db8f39d35133','2025-09-01 04:32:24','Self','211','guest','guest@example.com','6135712345','Testing creation 31','Testing Requestor raise ticket','6','6001','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'guest','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','guest'),('e5d14449-3959-4f0a-996c-d1a270ff7808','2025-08-28 18:31:48','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 25','Uploading files','6','6001','P3',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S1',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('e65acebe-c2e9-4480-b0c7-4d9dcf9f62fd','2025-08-28 18:15:49','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 24','m','1','1004','P1','e65acebe-c2e9-4480-b0c7-4d9dcf9f62fd/54d2c06c-5a57-4c61-9c53-60a9082badc6_Daksh Jain.jpg',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S3',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('e6d5be7d-82c9-4fd0-9828-b38e2f33f84c','2025-08-27 00:00:00','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 10','Testing attachment','2','2001','P1','a113d593-5cf2-401f-b4c0-d84277db0057_L shaped Table top.png,090f7a80-ec8a-4908-86e2-fae9f6563aa1_passport nimit_4.jpg',0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4','',NULL,NULL,NULL,'1',NULL,'PENDING','teaml1'),('fcde0444-8169-4bdb-b1f1-7041a4505339','2025-09-10 17:25:01','Self','211','guest','guest@example.com','6135712345','Testing creation 39','Testing sla','1','1003','P1',NULL,0,NULL,NULL,'OPEN',NULL,NULL,NULL,'guest','High - S2',NULL,NULL,NULL,NULL,'1',NULL,NULL,'guest'),('fe6fea66-64ed-441d-b93c-1eebed31f966','2025-08-28 17:56:21','Self','216',NULL,'team.lead1@example.com','1212121212','Testing creation 23','Testing uploading files','9','9002','P1',NULL,0,NULL,'2025-09-09 13:22:35','OPEN',NULL,NULL,NULL,'teaml1','S4',NULL,NULL,NULL,NULL,'1',NULL,'PENDING','teaml1');
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
INSERT INTO `uploaded_files` VALUES ('0593796b-dc53-4365-b2a5-9d572ef2fce0','Daksh Jain.jpg','jpg','97520aef-fd4a-4013-af83-657130809aa0/7cca1117-47c3-43e1-a325-eda6abea96ba_Daksh Jain.jpg',NULL,'97520aef-fd4a-4013-af83-657130809aa0','2025-08-28 06:30:54','Y'),('06bc73c5-5306-455e-a61c-1fb4813ef1e8','dadu.jpg','jpg','8fb1d6a2-2638-4f34-af3d-8d6f5003dfd3/eab5652a-9425-496a-82f0-0dd3e088c0ac_dadu.jpg',NULL,'8fb1d6a2-2638-4f34-af3d-8d6f5003dfd3','2025-08-28 11:10:19','Y'),('09f1f79c-b747-4d5a-88e6-de0baa9b9ac0','Table drawn.PNG','PNG','78eb40f6-a118-4719-a47c-9b6ca9cb4e88/43d7291b-9093-4c35-8755-9fc31a84d8f3_Table drawn.PNG',NULL,'78eb40f6-a118-4719-a47c-9b6ca9cb4e88','2025-08-29 12:23:05','N'),('11b77a80-e2ca-441c-95d8-927f1887f5aa','_2020_PTR_1030102000164007d098a85-0a6c-4e39-b90a-81e877f97d57.pdf','pdf','4260d88a-5bf9-4e27-841f-1bc016bc5f60/86e87f73-bc3b-49ae-aed4-34090e550d10__2020_PTR_1030102000164007d098a85-0a6c-4e39-b90a-81e877f97d57.pdf',NULL,'4260d88a-5bf9-4e27-841f-1bc016bc5f60','2025-08-28 18:25:27','Y'),('213d4026-4919-4363-bbed-93418d52fc3c','Daksh Jain.jpg','jpg','78eb40f6-a118-4719-a47c-9b6ca9cb4e88/d9bc8445-e73a-40af-aa8b-3a2afda88815_Daksh Jain.jpg',NULL,'78eb40f6-a118-4719-a47c-9b6ca9cb4e88','2025-08-29 09:15:03','Y'),('22d0f67c-7d0a-4ae5-acad-4818eb1e0032','dadu.jpg','jpg','78eb40f6-a118-4719-a47c-9b6ca9cb4e88/5b3d764e-e939-49ac-bab3-bf8a6b49a7e2_dadu.jpg',NULL,'78eb40f6-a118-4719-a47c-9b6ca9cb4e88','2025-08-29 09:13:52','Y'),('2e77c074-3c8e-42a9-a216-9bffc52da886','dadu.jpg','jpg','0ca90721-8cc0-481f-9aa7-e63634765409/6e21620b-d158-4882-b9de-5b3b785fc8b1_dadu.jpg',NULL,'0ca90721-8cc0-481f-9aa7-e63634765409','2025-08-29 08:33:58','Y'),('2f170efb-e86e-40b3-9b89-1652d0c1d922','Table drawn.PNG','PNG','d1ba2f3d-f548-49e8-8ad0-37c39282638a/af49395d-6c36-4995-b1ef-2ac19f887457_Table drawn.PNG',NULL,'d1ba2f3d-f548-49e8-8ad0-37c39282638a','2025-09-01 04:32:49','Y'),('2ff425a6-fcc9-44d8-bc64-7f292c47769f','dadu.jpg','jpg','bcf829d1-0471-46c3-9a34-572a3f890cbf/e90bd05a-58c6-4f5f-a266-177eb3c83104_dadu.jpg',NULL,'bcf829d1-0471-46c3-9a34-572a3f890cbf','2025-08-28 18:24:15','Y'),('449bd985-4b91-4787-a729-9ac5b8161b4c','L shaped Table top.png','png','78eb40f6-a118-4719-a47c-9b6ca9cb4e88/a9695044-ae34-475e-8fe0-687098e8924f_L shaped Table top.png',NULL,'78eb40f6-a118-4719-a47c-9b6ca9cb4e88','2025-08-29 09:15:16','Y'),('5a37f7d5-f5a8-4ae5-b57f-57ef44502d32','Daksh Jain.jpg','jpg','8fb1d6a2-2638-4f34-af3d-8d6f5003dfd3/107d4e76-f6b7-44d6-8fd9-aedfe8e06690_Daksh Jain.jpg',NULL,'8fb1d6a2-2638-4f34-af3d-8d6f5003dfd3','2025-08-28 11:10:19','Y'),('5d738127-4da9-4a39-bbe8-275846a26806','L shaped Table top.png','png','2f07b1d7-3abe-4a55-a902-dcdd2021c14c/d5b4ae30-46d8-45f3-a854-18a5d1197a4b_L shaped Table top.png',NULL,'2f07b1d7-3abe-4a55-a902-dcdd2021c14c','2025-09-02 06:55:13','Y'),('68e7904a-9fac-486a-9d73-57f5fcbc169a','Daksh Jain.jpg','jpg','e65acebe-c2e9-4480-b0c7-4d9dcf9f62fd/54d2c06c-5a57-4c61-9c53-60a9082badc6_Daksh Jain.jpg',NULL,'e65acebe-c2e9-4480-b0c7-4d9dcf9f62fd','2025-08-28 18:15:50','Y'),('69a246e6-4a24-484d-93fd-f382ea5dafb8','dadu.jpg','jpg','97520aef-fd4a-4013-af83-657130809aa0/bfbeaf9f-317d-4649-bd16-a631acde724a_dadu.jpg',NULL,'97520aef-fd4a-4013-af83-657130809aa0','2025-08-28 06:29:29','Y'),('74b13492-e68a-4f1f-a609-7e2c6db03e9b','L shaped Table top.png','png','d54ea9fb-74c1-413a-b14a-feac5a9f1b1f/6d506b72-be54-45e8-b1a0-ced900ede676_L shaped Table top.png',NULL,'d54ea9fb-74c1-413a-b14a-feac5a9f1b1f','2025-08-28 11:15:04','Y'),('891a8b7d-c16d-4c2f-9890-9c62ff735c0a','L shaped Table top.png','png','0ca90721-8cc0-481f-9aa7-e63634765409/4dc1aa31-f9f5-4e32-baaa-bddd56d849cb_L shaped Table top.png',NULL,'0ca90721-8cc0-481f-9aa7-e63634765409','2025-08-29 08:33:58','Y'),('897b266c-0eb4-491a-97b1-c3e82f842f1b','dadu.jpg','jpg','97520aef-fd4a-4013-af83-657130809aa0/2f472e7d-0444-46ca-9f43-00063f22abc4_dadu.jpg',NULL,'97520aef-fd4a-4013-af83-657130809aa0','2025-08-28 06:29:29','Y'),('95a4283b-8987-4fd7-977e-842ca783ff78','L shaped Table top.png','png','78eb40f6-a118-4719-a47c-9b6ca9cb4e88/efa85fbf-28bc-445d-b8d8-c6459dc59b9d_L shaped Table top.png',NULL,'78eb40f6-a118-4719-a47c-9b6ca9cb4e88','2025-08-29 09:15:16','N'),('a8bc875a-d5f3-4b80-aa32-2f6b3c36a391','Daksh Jain.jpg','jpg','bcf829d1-0471-46c3-9a34-572a3f890cbf/465dd6b9-1a2a-46b7-a2a0-29076262db51_Daksh Jain.jpg',NULL,'bcf829d1-0471-46c3-9a34-572a3f890cbf','2025-08-28 18:24:15','Y'),('b68ee45f-5102-40b1-9144-bc23545e7c6f','L shaped Table top.png','png','4fc4b944-86bd-4098-acc6-e0515b54fee8/aebf88fe-1eee-40e9-8e25-2d22da35c058_L shaped Table top.png',NULL,'4fc4b944-86bd-4098-acc6-e0515b54fee8','2025-09-03 16:59:43','Y'),('cd721ba3-8cfd-4adc-9cff-c07c4b105f70','Daksh Jain.jpg','jpg','97520aef-fd4a-4013-af83-657130809aa0/44635454-3c0d-4fd1-9812-7b0fda8a8761_Daksh Jain.jpg',NULL,'97520aef-fd4a-4013-af83-657130809aa0','2025-08-28 06:30:54','Y'),('dd427aaf-59af-4c72-9805-d0883e09dc91','L shaped Table top.png','png','050f176d-30ad-4144-a6cb-3741c141ab32/1339080d-6572-4e43-9ca4-c8a8304fdf3a_L shaped Table top.png',NULL,'050f176d-30ad-4144-a6cb-3741c141ab32','2025-09-02 22:26:56','Y'),('de4ac94e-505d-408b-a926-671ab6155079','L shaped Table top.png','png','cee697aa-6d22-4250-bbb9-ce5367ad7ee4/861137e8-2077-44c0-9ab5-9317ef3f9924_L shaped Table top.png',NULL,'cee697aa-6d22-4250-bbb9-ce5367ad7ee4','2025-08-31 21:46:24','Y'),('e8167a8a-becf-4017-9184-d178659fa184','Daksh Jain.jpg','jpg','78eb40f6-a118-4719-a47c-9b6ca9cb4e88/81060f13-e10b-430d-b3e8-dab302551057_Daksh Jain.jpg',NULL,'78eb40f6-a118-4719-a47c-9b6ca9cb4e88','2025-08-29 09:15:03','N'),('ed8bcb3e-2a1d-4888-a9ad-7d0fe09e118f','Wheat_Free_Flour_Plan_Delhi.pdf','pdf','784398da-b7ca-4a55-85e8-c83ffd5744d0/8fb77c43-f182-4ed0-8175-de699c56ec40_Wheat_Free_Flour_Plan_Delhi.pdf',NULL,'784398da-b7ca-4a55-85e8-c83ffd5744d0','2025-08-28 18:32:41','Y');
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
INSERT INTO `users` VALUES (201,'Arjun Mehta','arjun.mehta@example.com','9123456780','Delhi','arjunm','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','ADMIN'),(202,'Bhavya Rao','bhavya.rao@example.com','9123456781','Mumbai','bhavyar','admin123','2'),(203,'Chirag Shah','chirag.shah@example.com','9123456782','Bangalore','chirags','admin123','5'),(204,'Divya Kapoor','divya.kapoor@example.com','9123456783','Hyderabad','divyak',NULL,'2'),(205,'Esha Singh','esha.singh@example.com','9123456784','Chennai','eshas','admin123','5'),(206,'Farhan Ali','farhan.ali@example.com','9123456785','Pune','farhana',NULL,'1'),(207,'Garima Jain','garima.jain@example.com','9123456786','Delhi','garimaj','admin123','3'),(208,'RNO Harsh Verma','harsh.verma@example.com','9123456787','Bangalore','rnoharshv','admin123','4'),(209,'Ishaan Malhotra','ishaan.m@example.com','9123456788','Mumbai','ishaanm','admin123','6'),(210,'Jaya Nair','jaya.nair@example.com','9123456789','Kolkata','jayan','admin123','5|7'),(211,'Guest Account','guest@example.com','6135712345','Delhi','guest','admin123','5'),(212,'Kevin Brooks','kevin.brooks@example.com','9123456790','Delhi','kevinb','password123','8'),(213,'Lara Singh','lara.singh@example.com','9123456791','Chandigarh','laras','securepass','5|7|8'),(214,'Mohan Kumar','mohan.kumar@example.com','9123456792','Jaipur','mohank','pass1234','ADMIN'),(215,'User Name','user.name@example.com','1111111111','Delhi','usern','admin123','USER'),(216,'Team Lead Name 1','team.lead1@example.com','1212121212','Delhi','teaml1','admin123','5|7');
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

-- Dump completed on 2025-09-11 12:05:02
