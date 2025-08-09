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
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
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
INSERT INTO `assignment_history` VALUES ('015996d6-14a5-4776-a16c-7d32dfddeb56','100','teaml1','eshas','2025-08-05 17:19:38'),('1','1','admin','agent1','2025-06-24 12:00:00'),('14c4a238-517c-4f42-9b67-4a849a150b4d','110','teaml1','harshv','2025-08-01 15:37:18'),('23a3d665-0642-4d3a-a814-b85a260f2543','1','teaml1','farhana','2025-08-01 15:07:48'),('2831f822-f2c8-4daa-8c1f-8dc00f8c6802','102','teaml1','kevinb','2025-07-31 17:47:25'),('2a4464d2-94a4-4720-94fc-9768adb81cbb','17','teaml1','eshas','2025-08-01 15:29:49'),('30d0d379-0234-42b6-814f-494bef139dd7','17','teaml1','farhana','2025-08-01 12:03:39'),('6817ea08-a044-407d-a7ec-3248a73a9093','26','teaml1','guest','2025-08-01 15:35:22'),('6c2ca1fd-c785-4ddc-baa6-b878eabf9d5d','1','chirags','divyak','2025-07-31 17:28:07'),('6ce7c026-3db5-4bd3-ad3a-ea908201c9da','106','teaml1','garimaj','2025-08-01 15:20:23'),('7395f4af-f15e-4151-8f73-b39cf8e6078a','14','teaml1','garimaj','2025-08-01 15:08:01'),('74376933-4dc0-450f-b9ac-003f5fa2dcf1','18','teaml1','mohank','2025-08-01 12:32:45'),('7ddaa420-4f78-40ec-a5fd-fe2a4c51e797','15','teaml1','garimaj','2025-08-01 15:39:27'),('8206ef92-9211-4be4-93ec-7a1a8f76bacf','101','teaml1','jayan','2025-08-01 13:18:14'),('958c6748-e190-4cbe-9a16-5dc640039ea9','103','teaml1','mohank','2025-07-31 17:50:06'),('b3b48cfa-1af8-4229-add8-0dd5978c914e','1','teaml1','eshas','2025-08-01 12:03:18'),('b7b4b28d-5cf2-40e7-b43f-37d9e58fb316','13','teaml1','jayan','2025-08-01 15:24:31'),('ba57546c-457f-4d8e-9205-544fd94fc977','1','teaml1','kevinb','2025-08-01 15:23:39'),('bd24282e-baad-42c7-a25b-3e96a08762a9','ddb183d7-f4a9-45ad-8600-a77c59aa7069','teaml1','kevinb','2025-08-01 16:24:33'),('cb92939e-27ac-43c5-9d13-a05b904afeb0','1','teaml1','farhana','2025-08-01 11:48:24'),('cc7c200e-a520-4eb1-a671-282cc99fe514','1','teaml1','eshas','2025-08-01 15:09:30'),('d96f1b58-91ef-466b-abe4-5b302580a3c0','109','teaml1','ishaanm','2025-08-01 12:22:54'),('db019657-9ad0-40e0-8995-21349f8bc42e','2','teaml1','harshv','2025-08-01 16:19:30'),('eb38ca3b-342f-4ee7-839d-95f3759fa510','14','teaml1','jayan','2025-08-01 15:43:37'),('eb51c342-fc5a-416e-9209-a6d462b65df2','1','teaml1','eshas','2025-08-05 17:01:30'),('f335b9ba-0ede-4c78-8207-4eea84a147ed','105','teaml1','arjunm','2025-08-05 16:13:54'),('fbd94e45-6d0e-4922-9634-4b29190222bc','12','teaml1','divyak','2025-08-01 12:30:16'),('fe6da3a9-bfa1-40b7-808c-a5a3ccbdc545','102','teaml1','laras','2025-07-31 17:49:21');
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
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES ('2','Payment Problems','bhavyar','2025-06-10 16:51:58','2025-06-10 16:51:58',NULL),('3','Bug Reports','chirags','2025-06-10 16:51:58','2025-06-10 16:51:58',NULL),('4','IT',NULL,NULL,NULL,NULL),('5','Server',NULL,NULL,NULL,NULL),('6','New Category',NULL,NULL,NULL,NULL),('7','Network Issues','alexs','2025-06-24 12:00:00','2025-06-24 12:00:00','alexs'),('8','Customer Support',NULL,NULL,NULL,NULL),('9','Infrastructure',NULL,NULL,NULL,NULL);
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
  `priority_id` varchar(36) NOT NULL,
  `value` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`priority_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `priority_master`
--

LOCK TABLES `priority_master` WRITE;
/*!40000 ALTER TABLE `priority_master` DISABLE KEYS */;
INSERT INTO `priority_master` VALUES ('1','Critical'),('2','High'),('3','Medium'),('4','Low');
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
-- Table structure for table `role_permission_config`
--

DROP TABLE IF EXISTS `role_permission_config`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_permission_config` (
  `role` varchar(100) NOT NULL,
  `permissions` json DEFAULT NULL,
  `updated_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `created_on` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_by` varchar(100) DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `is_deleted` tinyint DEFAULT '0',
  `allowed_status_action_ids` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_permission_config`
--

LOCK TABLES `role_permission_config` WRITE;
/*!40000 ALTER TABLE `role_permission_config` DISABLE KEYS */;
INSERT INTO `role_permission_config` VALUES ('A','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}',NULL,'2025-07-29 09:41:39',NULL,'201',1,NULL),('ADMIN','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": true, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": false, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": true, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-07-29 09:59:06',NULL,'201',NULL,0,NULL),('System Administrator','{\"pages\": {}, \"sidebar\": {}}','2025-07-24 10:33:50',NULL,'SYSTEM',NULL,0,NULL),('Team Lead','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"show\": true, \"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"statusId\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": true, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"editMode\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Edit Mode\", \"type\": \"operation\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": true, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": true, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": true, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}, \"Link to Master Ticket Modal\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Modal\"}}, \"Link to Master Ticket Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Link to Master Ticket Button\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}, \"History Sidebar\": {\"show\": true, \"children\": {\"Status History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Tab\"}}, \"Status History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Status History Button\"}}, \"Assignment History Tab\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Tab\"}}, \"Assignment History Button\": {\"show\": true, \"children\": null, \"metadata\": {\"name\": \"Assignment History Button\"}}}, \"metadata\": {\"name\": \"History Sidebar\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": true, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": true, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": true, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-07-31 11:08:03',NULL,'216',NULL,0,'1|2|3|7|8|9|10|17|18'),('USER','{\"pages\": {\"show\": true, \"children\": {\"myTickets\": {\"show\": true, \"children\": {\"grid\": {\"show\": true, \"metadata\": {\"name\": \"Grid View\", \"type\": \"section\"}}, \"table\": {\"show\": true, \"children\": {\"columns\": {\"children\": {\"email\": {\"show\": true, \"metadata\": {\"name\": \"Email\", \"type\": \"column\"}}, \"action\": {\"show\": true, \"metadata\": {\"name\": \"Action\", \"type\": \"column\"}}, \"mobile\": {\"show\": true, \"metadata\": {\"name\": \"Mobile\", \"type\": \"column\"}}, \"status\": {\"show\": true, \"metadata\": {\"name\": \"Status\", \"type\": \"column\"}}, \"assignee\": {\"show\": true, \"metadata\": {\"name\": \"Assignee\", \"type\": \"column\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"column\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"column\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"column\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub-Category\", \"type\": \"column\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"column\"}}}, \"metadata\": {\"name\": \"Columns\", \"type\": \"section\"}}, \"pageSize\": {\"show\": true, \"metadata\": {\"name\": \"Page Size\", \"type\": \"input\"}}, \"masterTag\": {\"show\": true, \"metadata\": {\"name\": \"Master Tag\", \"type\": \"section\"}}, \"pagination\": {\"show\": true, \"metadata\": {\"name\": \"Pagination\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Tickets Table\", \"type\": \"table\"}}, \"searchBar\": {\"show\": true, \"metadata\": {\"name\": \"Search Bar\", \"type\": \"input\"}}, \"statusFilter\": {\"show\": true, \"metadata\": {\"name\": \"Status Filter\", \"type\": \"input\"}}, \"masterFilterToggle\": {\"show\": false, \"metadata\": {\"name\": \"Master Filter Toggle\", \"type\": \"button\"}}, \"gridTableViewToggle\": {\"show\": true, \"metadata\": {\"name\": \"Grid/Table Toggle\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"page\"}}, \"ticketForm\": {\"show\": true, \"children\": {\"comments\": {\"show\": true, \"children\": {\"editButton\": {\"show\": true, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"button\"}}, \"postComment\": {\"show\": true, \"metadata\": {\"name\": \"Post Comment\", \"type\": \"section\"}}, \"deleteButton\": {\"show\": true, \"metadata\": {\"name\": \"Delete Button\", \"type\": \"button\"}}}, \"metadata\": {\"name\": \"Comments\", \"type\": \"section\"}}, \"ticketDetails\": {\"show\": true, \"children\": {\"impact\": {\"show\": false, \"metadata\": {\"name\": \"Impact\", \"type\": \"input\"}}, \"status\": {\"show\": false, \"metadata\": {\"name\": \"Status\", \"type\": \"input\"}}, \"subject\": {\"show\": true, \"metadata\": {\"name\": \"Subject\", \"type\": \"input\"}}, \"category\": {\"show\": true, \"metadata\": {\"name\": \"Category\", \"type\": \"input\"}}, \"priority\": {\"show\": true, \"metadata\": {\"name\": \"Priority\", \"type\": \"input\"}}, \"assignedTo\": {\"show\": true, \"metadata\": {\"name\": \"Assigned To\", \"type\": \"input\"}}, \"attachment\": {\"show\": true, \"metadata\": {\"name\": \"Attachment\", \"type\": \"input\"}}, \"editButton\": {\"show\": false, \"metadata\": {\"name\": \"Edit Button\", \"type\": \"input\"}}, \"description\": {\"show\": true, \"metadata\": {\"name\": \"Description\", \"type\": \"input\"}}, \"subCategory\": {\"show\": true, \"metadata\": {\"name\": \"Sub Category\", \"type\": \"input\"}}, \"severitytype\": {\"show\": false, \"metadata\": {\"name\": \"Severity Type\", \"type\": \"input\"}, \"severity\": true, \"selectedImpact\": true, \"recommendedSeverity\": true}, \"assignedToLevel\": {\"show\": false, \"metadata\": {\"name\": \"Assigned To Level\", \"type\": \"input\"}}, \"assignToDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Dropdown\", \"type\": \"input\"}}, \"isMasterCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Is Master Checkbox\", \"type\": \"input\"}}, \"assignFurtherCheckbox\": {\"show\": false, \"metadata\": {\"name\": \"Assign Further Checkbox\", \"type\": \"input\"}}, \"assignToLevelDropdown\": {\"show\": false, \"metadata\": {\"name\": \"Assign To Level Dropdown\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Details\", \"type\": \"section\"}}, \"requestDetails\": {\"show\": true, \"children\": {\"mode\": {\"show\": true, \"metadata\": {\"name\": \"Mode\", \"type\": \"input\"}}, \"ticketId\": {\"show\": true, \"metadata\": {\"name\": \"Ticket Id\", \"type\": \"input\"}}, \"reportedDate\": {\"show\": true, \"metadata\": {\"name\": \"Reported Date\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Request Details\", \"type\": \"input\"}}, \"requestorDetails\": {\"show\": true, \"children\": {\"role\": {\"show\": true, \"metadata\": {\"name\": \"Role\", \"type\": \"input\"}}, \"office\": {\"show\": true, \"metadata\": {\"name\": \"Office\", \"type\": \"input\"}}, \"userId\": {\"show\": true, \"metadata\": {\"name\": \"User Id\", \"type\": \"input\"}}, \"emailId\": {\"show\": true, \"metadata\": {\"name\": \"Email Id\", \"type\": \"input\"}}, \"phoneNumber\": {\"show\": true, \"metadata\": {\"name\": \"Phone Number\", \"type\": \"input\"}}, \"stakeholder\": {\"show\": true, \"metadata\": {\"name\": \"Stakeholder\", \"type\": \"input\"}}, \"requestorName\": {\"show\": true, \"metadata\": {\"name\": \"Requestor Name\", \"type\": \"input\"}}, \"onBehalfOfFciUser\": {\"show\": false, \"metadata\": {\"name\": \"On Behalf Of Fci User\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Requestor Details\", \"type\": \"input\"}}}, \"metadata\": {\"name\": \"Ticket Form\", \"type\": \"section\"}}}, \"metadata\": {\"name\": \"Pages\", \"type\": \"section\"}}, \"sidebar\": {\"show\": true, \"children\": {\"faq\": {\"show\": true, \"metadata\": {\"name\": \"FAQ\", \"type\": \"menu\"}}, \"myTickets\": {\"show\": true, \"metadata\": {\"name\": \"My Tickets\", \"type\": \"menu\"}}, \"roleMaster\": {\"show\": false, \"metadata\": {\"name\": \"Role Master\", \"type\": \"menu\"}}, \"raiseTickets\": {\"show\": true, \"metadata\": {\"name\": \"Raise Ticket\", \"type\": \"menu\"}}, \"knowledgeBase\": {\"show\": false, \"metadata\": {\"name\": \"Knowledge Base\", \"type\": \"menu\"}}, \"categoriesMaster\": {\"show\": false, \"metadata\": {\"name\": \"Categories Master\", \"type\": \"menu\"}}, \"escalationMaster\": {\"show\": false, \"metadata\": {\"name\": \"Escalation Master\", \"type\": \"menu\"}}}, \"metadata\": {\"name\": \"Sidebar\", \"type\": \"section\"}}}','2025-07-25 11:16:07',NULL,'SYSTEM',NULL,0,'2|6|7|19');
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
  `severity_id` varchar(36) NOT NULL,
  `value` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`severity_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `severity_master`
--

LOCK TABLES `severity_master` WRITE;
/*!40000 ALTER TABLE `severity_master` DISABLE KEYS */;
INSERT INTO `severity_master` VALUES ('1','CRITICAL'),('2','HIGH'),('3','MEDIUM'),('4','LOW');
/*!40000 ALTER TABLE `severity_master` ENABLE KEYS */;
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
INSERT INTO `status_history` VALUES ('05b55e58-0f1d-4604-b38c-4e3ac6cd87cb','15','teaml1','1','2','2025-08-01 15:39:27',1),('1','1','arjunm','PENDING','ON_HOLD','2025-06-09 10:00:00',NULL),('139e47b0-ee5a-4d7f-97d2-ea2335dd2af0','17','teaml1','1','2','2025-08-01 12:03:39',1),('17131af1-55d5-4f7c-86fb-d7e000a885b7','100','teaml1','2','4','2025-08-06 14:52:08',1),('1a78a330-6aae-43e2-97d8-285df2dc2816','8afd1dfe-6539-4e5b-8a8b-b86755f96e9f','216',NULL,'OPEN','2025-07-30 14:44:52',NULL),('1fbdc1ea-ba16-403a-a5bb-ae9e131926a0','100','teaml1','7','10','2025-08-05 17:16:03',0),('2','5','helpdesk.user','ON_HOLD','CLOSED','2025-06-09 10:05:00',NULL),('293680f3-b52d-4873-a258-584aa1f644c9','13','teaml1','1','2','2025-08-01 15:24:31',1),('2d22d17a-0cd2-4f01-b038-3b6f6af15902','102','teaml1','1','2','2025-07-31 17:47:26',1),('3','6','eshas','PENDING','REOPENED','2025-06-09 10:10:00',NULL),('31103d98-09b5-4459-adac-013eda520cc5','105','teaml1','1','2','2025-08-05 16:13:54',1),('31bd176d-8fb3-44f6-88e4-5576ad736966','106','teaml1','1','2','2025-08-01 15:20:23',1),('3519bbaf-b0ff-43af-b18b-0789c6eefbd3','100','teaml1','2','7','2025-08-05 17:10:40',0),('38285d7c-d815-44f3-a0cf-0c0b4fc1ffa5','18','teaml1','1','2','2025-08-01 12:32:45',1),('3e637e64-1f78-4985-8ed0-7cf518326a6d','109','teaml1','2','2','2025-08-01 12:22:54',1),('4','1','admin','ON_HOLD','RESOLVED','2025-06-24 12:05:00',NULL),('4045758f-f893-4780-8cc5-b15a03e112e1','1','teaml1','10','2','2025-08-05 17:01:30',1),('56c37330-4425-4db2-b362-6e67a96d12f8','100','teaml1','10','2','2025-08-05 17:19:38',1),('60436c16-43fd-46fa-a54d-f56973d29037','110','teaml1','1','2','2025-08-01 15:37:18',1),('6921c2cc-530c-4137-8193-2028feadf0b8','98a742db-0f6d-47a1-9c4f-33548bddb833','216',NULL,'1','2025-07-31 12:56:14',0),('702f7c71-b12f-4d6b-b809-6c8211f7d7bc','1','teaml1','7','10','2025-08-05 16:14:39',0),('7d571ad9-f26d-4dcc-9734-26e0d06ec97f','1','teaml1','2','7','2025-08-05 16:14:24',0),('877de6b6-4f7e-41b6-8de1-d51993e436d3','14','teaml1','1','2','2025-08-01 15:08:01',1),('9b3ceedc-02de-4313-9870-662ed7c22f7d','4d912f6c-9733-4703-9b31-70015fe22951','216',NULL,'1','2025-07-31 12:27:48',0),('a72d29a4-0d0b-40ea-929f-075b146c1df1','12','teaml1','1','2','2025-08-01 12:30:16',1),('b45d32ea-706f-4039-9831-13515115d868','103','teaml1','1','2','2025-07-31 17:50:06',1),('c8d6e80a-688f-476e-b5e0-fcaed13a3fbd','104','teaml1','1','9','2025-08-05 16:12:59',0),('cbddc18e-ef8b-432e-aabc-7d7c0f54551d','88d8314f-faa3-4462-9d0a-1d329b7b14e9','216',NULL,'1','2025-07-31 11:58:09',0),('cc47943d-75c8-4ccc-8a36-0f68cb5d070f','ddb183d7-f4a9-45ad-8600-a77c59aa7069','216',NULL,'1','2025-07-31 12:54:30',0),('d0dc73cb-b8af-4aab-b71a-7b11bafabbef','1','teaml1','2','7','2025-08-05 17:39:03',0),('d2036d03-aa56-483c-838a-5657ad0d5f5a','101','teaml1','2','3','2025-08-05 17:14:08',0),('da47df63-41e5-409a-a8c1-813ec5496d25','26','teaml1','1','2','2025-08-01 15:35:22',1),('dc7a61e1-5eb5-4da5-8495-1c465ec6da0e','2','teaml1','1','2','2025-08-01 16:19:30',1),('e8ed092a-f3d4-46bd-ab65-38ce5c969328','46ef0f9f-6647-46e6-ba57-d367c101901c','teaml1',NULL,'1','2025-07-31 15:45:54',0),('fbd5655a-62ea-47f7-9fd1-97d72c7a9bde','ddb183d7-f4a9-45ad-8600-a77c59aa7069','teaml1','1','2','2025-08-01 16:24:33',1);
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
  `created_by` varchar(100) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category_id` varchar(36) DEFAULT NULL,
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
INSERT INTO `sub_categories` VALUES ('1','UPI=',NULL,NULL,'2',NULL,NULL),('4','Payment Fail','nimit.jain','2025-06-11 22:15:40','2','2025-06-11 22:15:40',NULL),('5','Loading Time','helpdesk.user','2025-06-16 17:41:03','5','2025-06-16 17:41:03',NULL),('6','Latency','alexs','2025-06-24 12:05:00','2','2025-06-24 12:05:00','alexs'),('7','Login Issues',NULL,NULL,'2',NULL,NULL),('8','Hardware Failure','alexs','2025-06-24 12:30:00','5','2025-06-24 12:30:00','alexs');
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
  `priority` enum('Critical','High','Medium','Low') NOT NULL,
  `attachment_path` varchar(512) DEFAULT NULL,
  `is_master` tinyint(1) DEFAULT NULL,
  `master_id` varchar(36) DEFAULT NULL,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(50) DEFAULT NULL,
  `assigned_to_level` varchar(20) DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `assigned_by` varchar(50) DEFAULT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `recommended_severity` varchar(50) DEFAULT NULL,
  `severity_recommended_by` varchar(100) DEFAULT NULL,
  `impact` varchar(50) DEFAULT NULL,
  `stakeholder` varchar(50) DEFAULT NULL,
  `status_id` varchar(36) DEFAULT NULL,
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
INSERT INTO `tickets` VALUES ('1','2025-04-08','Call',NULL,'teaml1','team@lead.com','1212121212','Can\'t change password','Issue related to password reset. Please assist.','software','printer','Low',NULL,0,'1','2025-08-08 09:32:15','CLOSED',NULL,'eshas',NULL,NULL,NULL,NULL,NULL,NULL,'8'),('100','2025-06-05','Call',NULL,NULL,NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-07-31 10:22:30','PENDING_WITH_SERVICE_PROVIDER','L2','eshas',NULL,NULL,NULL,NULL,NULL,NULL,'4'),('101','2025-06-05','Call',NULL,NULL,NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-07-31 10:22:30','PENDING_WITH_REQUESTER','L1','jayan',NULL,NULL,NULL,NULL,NULL,NULL,'3'),('102','2025-06-05','Call',NULL,NULL,NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',1,NULL,'2025-07-31 10:22:30','ASSIGNED','L3','laras',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('103','2025-06-05','Call',NULL,NULL,NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',1,NULL,'2025-07-31 10:22:30','ASSIGNED','L1','mohank',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('104','2025-06-05','Call',NULL,NULL,NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',1,NULL,'2025-07-31 10:22:30','CANCELLED','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'9'),('105','2025-06-05','Call',NULL,NULL,NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',1,NULL,'2025-07-31 10:22:30','ASSIGNED','L3','arjunm',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('106','2025-06-08','Call',NULL,NULL,NULL,NULL,'T!','D!','software','laptop','Medium',NULL,0,NULL,'2025-07-31 10:22:30','ASSIGNED','L2','garimaj',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('107','2025-06-12','Self','201',NULL,NULL,NULL,'s1','d1','2','1','Low',NULL,0,NULL,'2025-07-31 10:24:39','ON_HOLD','','201','nimit.jain',NULL,NULL,NULL,NULL,NULL,'2'),('108','2025-06-12','Self','201',NULL,NULL,NULL,'s1','d1','2','1','Low',NULL,1,NULL,'2025-07-31 10:24:39','ON_HOLD','','201','nimit.jain',NULL,NULL,NULL,NULL,NULL,'2'),('109','2025-06-12','Self','201',NULL,NULL,NULL,'s1','d1','2','1','Low',NULL,1,NULL,'2025-07-31 10:23:29','ASSIGNED','1','ishaanm','nimit.jain',NULL,NULL,NULL,NULL,NULL,'2'),('11','2025-04-11','Call','168',NULL,NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Medium','',0,'11','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('110','2025-06-16','Email','201',NULL,NULL,NULL,'Ticket created by IT','Need to check this description box','Payment Problems','4','Low',NULL,0,NULL,'2025-07-31 10:22:30','ASSIGNED',NULL,'harshv','helpdesk.user',NULL,NULL,NULL,NULL,NULL,'2'),('111','2025-06-17','Call',NULL,'John Doe','john@doe.com','12341234','T created by Farmer','Description input text allignment wrong','Payment Problems','4','Low',NULL,0,NULL,'2025-07-31 10:23:29','PENDING','L1','arjunm','helpdesk.user',NULL,NULL,NULL,NULL,'Farmer','2'),('112','2025-06-24','Email','212','Kevin Brooks','kevin.brooks@example.com','9123456790','System Crash','System crash when saving data','IT','Network','High','/files/log.txt',0,NULL,'2025-07-31 10:23:29','PENDING','L1','Kevin Brooks','admin','HIGH','HIGH','admin','Critical','Management','2'),('12','2025-04-06','Self',NULL,NULL,NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','Account','Login','Critical','',1,'11','2025-07-31 10:22:30','ASSIGNED','L3','divyak',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('13','2025-05-23','Self',NULL,NULL,NULL,NULL,'Outlook crashes on launch','Issue related to outlook. Please assist.','Software','Outlook','Medium','',0,'11','2025-07-31 10:22:30','ASSIGNED','L1','jayan',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('14','2025-04-26','Call',NULL,NULL,NULL,NULL,'Internet not working','Issue related to connectivity. Please assist.','Network','Connectivity','Medium','',1,'11','2025-07-31 10:22:30','ASSIGNED','L2','jayan',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('15','2025-05-21','Self',NULL,NULL,NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','Hardware','Printer','Critical','',0,'11','2025-07-31 10:22:30','ASSIGNED','L3','garimaj',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('16','2025-05-05','Call','138',NULL,NULL,NULL,'Stuck at login screen','Issue related to login. Please assist.','Account','Login','Critical','',1,'11','2025-07-31 10:22:30','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('17','2025-05-10','Email',NULL,NULL,NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','Hardware','Printer','Critical','',0,'11','2025-07-31 10:22:30','ASSIGNED','L1','eshas',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('18','2025-04-16','Email',NULL,NULL,NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','Network','VPN','Critical','',1,'11','2025-07-31 10:22:30','ASSIGNED','L3','mohank',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('2','2025-06-03','Self',NULL,NULL,NULL,NULL,'Forgot my password','Issue related to password reset. Please assist.','Account','Password Reset','High','',1,'1','2025-07-31 10:22:30','ASSIGNED','L2','harshv',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('21','2025-05-20','Call','154',NULL,NULL,NULL,'Blue screen error','Issue related to system crash. Please assist.','Hardware','System Crash','Low','',0,'21','2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('22','2025-05-25','Self','122',NULL,NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','Network','VPN','Low','',1,'21','2025-07-31 10:22:30','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('23','2025-04-18','Email','162',NULL,NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','High','',0,'21','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('24','2025-04-26','Call','199',NULL,NULL,NULL,'Email stuck in outbox','Issue related to outlook. Please assist.','Software','Outlook','Critical','',1,'21','2025-07-31 10:22:30','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('25','2025-04-05','Email','118',NULL,NULL,NULL,'Forgot my password','Issue related to password reset. Please assist.','Account','Password Reset','Medium','',0,'21','2025-07-31 10:22:30','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('26','2025-05-21','Self',NULL,NULL,NULL,NULL,'System crashes on boot','Issue related to system crash. Please assist.','Hardware','System Crash','Medium','',1,'21','2025-07-31 10:22:30','ASSIGNED','L2','guest',NULL,NULL,NULL,NULL,NULL,NULL,'2'),('27','2025-05-06','Call','100',NULL,NULL,NULL,'Outlook crashes on launch','Issue related to outlook. Please assist.','Software','Outlook','High','',0,'21','2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('3','2025-04-16','Call','100',NULL,NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Medium','',0,'1','2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('31','2025-05-14','Self','168',NULL,NULL,NULL,'VPN fails during connection','Issue related to vpn. Please assist.','Network','VPN','Critical','',0,'31','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('32','2025-04-20','Call','176',NULL,NULL,NULL,'Outlook not opening','Issue related to outlook. Please assist.','Software','Outlook','Low','',1,'31','2025-07-31 10:22:30','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('33','2025-05-31','Call','197',NULL,NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','Hardware','Printer','High','',0,'31','2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('34','2025-05-04','Self','188',NULL,NULL,NULL,'Outlook not opening','Issue related to outlook. Please assist.','Software','Outlook','Critical','',1,'31','2025-07-31 10:22:30','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('35','2025-05-10','Email','124',NULL,NULL,NULL,'False positive alerts','Issue related to antivirus. Please assist.','Software','Antivirus','Medium','',0,'31','2025-07-31 10:22:30','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('36','2025-05-02','Call','142',NULL,NULL,NULL,'VPN not working','Issue related to vpn. Please assist.','Network','VPN','High','',1,'31','2025-07-31 10:22:30','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('4','2025-04-15','Self','153',NULL,NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Low','',1,'1','2025-07-31 10:22:30','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('41','2025-05-19','Self','141',NULL,NULL,NULL,'Unable to login','Issue related to login. Please assist.','Account','Login','Low','',0,'41','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('42','2025-06-02','Self','149',NULL,NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','Account','Login','Medium','',1,'41','2025-07-31 10:22:30','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('43','2025-04-17','Email','140',NULL,NULL,NULL,'Printer jammed','Issue related to printer. Please assist.','Hardware','Printer','High','',0,'41','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('44','2025-05-29','Email','128',NULL,NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Medium','',1,'41','2025-07-31 10:22:30','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('45','2025-05-31','Self','148',NULL,NULL,NULL,'Can\'t print documents','Issue related to printer. Please assist.','Hardware','Printer','Critical','',0,'41','2025-07-31 10:22:30','CLOSED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('46ef0f9f-6647-46e6-ba57-d367c101901c','2025-07-31','Self','216',NULL,'team.lead1@example.com','1212121212','Testing status 1','Status is OPEN only','Payment Problems','1','Low',NULL,0,NULL,NULL,'OPEN',NULL,NULL,'teaml1',NULL,NULL,NULL,NULL,NULL,'1'),('4d912f6c-9733-4703-9b31-70015fe22951','2025-07-31','Call','202',NULL,'bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','Payment Problems','4','Low',NULL,0,NULL,'2025-07-31 10:22:30','OPEN',NULL,NULL,'216',NULL,NULL,NULL,NULL,'Farmer','1'),('5','2025-04-10','Call','191',NULL,NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','High','',0,'1','2025-07-31 10:22:30','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('51','2025-05-17','Call','125',NULL,NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','Hardware','Printer','High','',0,'51','2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('52','2025-05-21','Email','131',NULL,NULL,NULL,'Can\'t send email','Issue related to outlook. Please assist.','Software','Outlook','High','',1,'51','2025-07-31 10:22:30','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('53','2025-05-05','Self','118',NULL,NULL,NULL,'Stuck at login screen','Issue related to login. Please assist.','Account','Login','Low','',0,'51','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('54','2025-04-08','Self','149',NULL,NULL,NULL,'Printer showing error code','Issue related to printer. Please assist.','Hardware','Printer','Low','',1,'51','2025-07-31 10:22:30','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('6','2025-04-25','Call','195',NULL,NULL,NULL,'VPN fails during connection','Issue related to vpn. Please assist.','Network','VPN','Medium','',1,'1','2025-07-31 10:22:30','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('61','2025-05-31','Email','126',NULL,NULL,NULL,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Low','',0,'61','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('62','2025-04-12','Self','164',NULL,NULL,NULL,'Login credentials not accepted','Issue related to login. Please assist.','Account','Login','High','',1,'61','2025-07-31 10:22:30','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('63','2025-05-19','Email','172',NULL,NULL,NULL,'Login page not loading','Issue related to login. Please assist.','Account','Login','Low','',0,'61','2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('7','2025-05-30','Email','186',NULL,NULL,NULL,'Can\'t connect to VPN','Issue related to vpn. Please assist.','Network','VPN','Low','',0,'1','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('71','2025-04-21','Self','112',NULL,NULL,NULL,'Email not syncing','Issue related to outlook. Please assist.','Software','Outlook','Low','',0,'71','2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('72','2025-04-17','Call','155',NULL,NULL,NULL,'VPN disconnects randomly','Issue related to vpn. Please assist.','Network','VPN','Low','',1,'71','2025-07-31 10:22:30','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('8','2025-04-23','Email','127',NULL,NULL,NULL,'Printer not responding','Issue related to printer. Please assist.','Hardware','Printer','Low','',1,'1','2025-07-31 10:22:30','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('81','2025-06-02','Email','160',NULL,NULL,NULL,'VPN disconnects randomly','Issue related to vpn. Please assist.','Network','VPN','Low','',0,'81','2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('88d8314f-faa3-4462-9d0a-1d329b7b14e9','2025-07-31','Call','202',NULL,'bhavya.rao@example.com','9123456781','Testing Creation 2','Creating + Assigning','Payment Problems','7','Low',NULL,0,NULL,'2025-07-31 10:22:30','OPEN','1',NULL,'216',NULL,NULL,NULL,NULL,'Farmer','1'),('8afd1dfe-6539-4e5b-8a8b-b86755f96e9f','2025-07-30','Call','202',NULL,'bhavya.rao@example.com','9123456781','Testing creation 1','Status at the time of creation should be Open','Payment Problems','4','Low',NULL,0,NULL,'2025-07-31 10:22:30','OPEN',NULL,NULL,'216',NULL,NULL,NULL,NULL,'Farmer','1'),('9','2025-04-26','Call','161',NULL,NULL,NULL,'Can\'t access my account','Issue related to login. Please assist.','Account','Login','High','',0,'1','2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('96','2025-06-05','Email','1024',NULL,NULL,NULL,'Unable to access internal portal','The intranet portal shows a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-07-31 10:22:30','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('97','2025-06-05','Email','1014',NULL,NULL,NULL,'Cannot access internal portal','The intranet portal shows a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-07-31 10:22:30','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('98','2025-06-05','Call','1111',NULL,NULL,NULL,'Cannot access internal portal','The intranet portal shows a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-07-31 10:22:30','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('98a742db-0f6d-47a1-9c4f-33548bddb833','2025-07-31','Call','202',NULL,'bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','Payment Problems','4','Low',NULL,0,NULL,'2025-07-31 10:22:30','OPEN',NULL,NULL,'216',NULL,NULL,NULL,NULL,'Farmer','1'),('99','2025-06-05','Call','1112',NULL,NULL,NULL,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-07-31 10:22:30','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL,NULL,'1'),('d85e3fbc-0e03-40c4-951b-22d0b4130f9f','2025-07-17','Self','201',NULL,'arjun.mehta@example.com','9123456780','S1','D1','Server','5','Low',NULL,0,NULL,'2025-07-31 10:23:29',NULL,'L1','205','201',NULL,NULL,NULL,NULL,NULL,'2'),('ddb183d7-f4a9-45ad-8600-a77c59aa7069','2025-07-31','Call','202',NULL,'bhavya.rao@example.com','9123456781','Testing creation 3','Create + Assign','Payment Problems','4','Low',NULL,0,NULL,'2025-07-31 10:22:30','ASSIGNED',NULL,'kevinb','216',NULL,NULL,NULL,NULL,'Farmer','2');
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
INSERT INTO `user_levels` VALUES (205,1),(203,3),(204,3),(201,4),(202,4),(211,6);
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
INSERT INTO `users` VALUES (201,'Arjun Mehta','arjun.mehta@example.com','9123456780','Delhi','arjunm','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','ADMIN'),(202,'Bhavya Rao','bhavya.rao@example.com','9123456781','Mumbai','bhavyar',NULL,'ADMIN'),(203,'Chirag Shah','chirag.shah@example.com','9123456782','Bangalore','chirags',NULL,'ADMIN'),(204,'Divya Kapoor','divya.kapoor@example.com','9123456783','Hyderabad','divyak',NULL,'ADMIN'),(205,'Esha Singh','esha.singh@example.com','9123456784','Chennai','eshas',NULL,'ADMIN'),(206,'Farhan Ali','farhan.ali@example.com','9123456785','Pune','farhana',NULL,'ADMIN'),(207,'Garima Jain','garima.jain@example.com','9123456786','Delhi','garimaj',NULL,'ADMIN'),(208,'Harsh Verma','harsh.verma@example.com','9123456787','Bangalore','harshv',NULL,'ADMIN'),(209,'Ishaan Malhotra','ishaan.m@example.com','9123456788','Mumbai','ishaanm',NULL,'ADMIN'),(210,'Jaya Nair','jaya.nair@example.com','9123456789','Kolkata','jayan',NULL,'ADMIN'),(211,'Guest Account',NULL,NULL,NULL,'guest','admin123','ADMIN'),(212,'Kevin Brooks','kevin.brooks@example.com','9123456790','Delhi','kevinb','password123','ADMIN'),(213,'Lara Singh','lara.singh@example.com','9123456791','Chandigarh','laras','securepass','ADMIN'),(214,'Mohan Kumar','mohan.kumar@example.com','9123456792','Jaipur','mohank','pass1234','ADMIN'),(215,'User Name','user.name@example.com','1111111111','Delhi','usern','admin123','USER'),(216,'Team Lead Name 1','team.lead1@example.com','1212121212','Delhi','teaml1','admin123','HELPDESK|Team Lead');
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

-- Dump completed on 2025-08-09 21:04:47
