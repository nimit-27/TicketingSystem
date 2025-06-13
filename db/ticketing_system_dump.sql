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
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `assigned_by` varchar(100) NOT NULL,
  `assigned_to` varchar(100) NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_ticket_assignment_history` (`ticket_id`),
  CONSTRAINT `fk_ticket_assignment_history` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`)
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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categories` (
  `category_id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(100) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`category_id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES (2,'Payment Problems','bhavyar','2025-06-10 16:51:58','2025-06-10 16:51:58',NULL),(3,'Bug Reports','chirags','2025-06-10 16:51:58','2025-06-10 16:51:58',NULL),(4,'IT',NULL,NULL,NULL,NULL),(5,'Server',NULL,NULL,NULL,NULL),(6,'New Category',NULL,NULL,NULL,NULL);
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
INSERT INTO `employee_levels` VALUES (201,1),(205,1),(201,2),(202,2),(203,3),(204,3);
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
  PRIMARY KEY (`employee_id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `employees`
--

LOCK TABLES `employees` WRITE;
/*!40000 ALTER TABLE `employees` DISABLE KEYS */;
INSERT INTO `employees` VALUES (201,'Arjun Mehta','arjun.mehta@example.com','9123456780','Delhi','arjunm'),(202,'Bhavya Rao','bhavya.rao@example.com','9123456781','Mumbai','bhavyar'),(203,'Chirag Shah','chirag.shah@example.com','9123456782','Bangalore','chirags'),(204,'Divya Kapoor','divya.kapoor@example.com','9123456783','Hyderabad','divyak'),(205,'Esha Singh','esha.singh@example.com','9123456784','Chennai','eshas'),(206,'Farhan Ali','farhan.ali@example.com','9123456785','Pune','farhana'),(207,'Garima Jain','garima.jain@example.com','9123456786','Delhi','garimaj'),(208,'Harsh Verma','harsh.verma@example.com','9123456787','Bangalore','harshv'),(209,'Ishaan Malhotra','ishaan.m@example.com','9123456788','Mumbai','ishaanm'),(210,'Jaya Nair','jaya.nair@example.com','9123456789','Kolkata','jayan');
/*!40000 ALTER TABLE `employees` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `knowledge_base`
--

DROP TABLE IF EXISTS `knowledge_base`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `knowledge_base` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) DEFAULT NULL,
  `description` text,
  `type` varchar(100) DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `knowledge_base`
--

LOCK TABLES `knowledge_base` WRITE;
/*!40000 ALTER TABLE `knowledge_base` DISABLE KEYS */;
INSERT INTO `knowledge_base` VALUES (1,'Java Basics','Introduction to Java programming','Tutorial','/files/java_basics.pdf'),(2,'Spring Boot Guide','Comprehensive guide to Spring Boot','Documentation','/files/spring_boot_guide.pdf'),(3,'REST API Design','Best practices for RESTful APIs','Article','/files/rest_api_design.pdf'),(4,'Docker Overview','Introduction to Docker containers','Tutorial','/files/docker_overview.pdf'),(5,'Microservices Architecture','Designing microservices systems','Whitepaper','/files/microservices_architecture.pdf');
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `levels`
--

LOCK TABLES `levels` WRITE;
/*!40000 ALTER TABLE `levels` DISABLE KEYS */;
INSERT INTO `levels` VALUES (1,'L1'),(2,'L2'),(3,'L3');
/*!40000 ALTER TABLE `levels` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `role_id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`role_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_categories`
--

DROP TABLE IF EXISTS `sub_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_categories` (
  `sub_category_id` int NOT NULL AUTO_INCREMENT,
  `sub_category` varchar(100) NOT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `timestamp` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `category_id` int DEFAULT NULL,
  `last_updated` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `updated_by` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`sub_category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `sub_categories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`category_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_categories`
--

LOCK TABLES `sub_categories` WRITE;
/*!40000 ALTER TABLE `sub_categories` DISABLE KEYS */;
INSERT INTO `sub_categories` VALUES (1,'UPI=',NULL,NULL,2,NULL,NULL),(4,'Payment Fail','nimit.jain','2025-06-11 22:15:40',2,'2025-06-11 22:15:40',NULL);
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
INSERT INTO `sync_metadata` VALUES ('last_sync_time','2025-06-08T11:11:23.362938',NULL);
/*!40000 ALTER TABLE `sync_metadata` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_categories`
--

DROP TABLE IF EXISTS `ticket_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category` varchar(255) DEFAULT NULL,
  `subcategory` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_categories`
--

LOCK TABLES `ticket_categories` WRITE;
/*!40000 ALTER TABLE `ticket_categories` DISABLE KEYS */;
INSERT INTO `ticket_categories` VALUES (1,'Software','Bug'),(2,'Software','Feature Request'),(3,'Hardware','Replacement'),(4,'HR','Leave Request'),(5,'Finance','Reimbursement'),(6,'Operations','Logistics');
/*!40000 ALTER TABLE `ticket_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ticket_comments`
--

DROP TABLE IF EXISTS `ticket_comments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ticket_comments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int DEFAULT NULL,
  `comment` text,
  `created_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_ticket` (`ticket_id`),
  CONSTRAINT `fk_ticket` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ticket_comments`
--

LOCK TABLES `ticket_comments` WRITE;
/*!40000 ALTER TABLE `ticket_comments` DISABLE KEYS */;
INSERT INTO `ticket_comments` VALUES (2,1,'Acknowledgment from support teams','2025-06-09 10:20:21'),(3,8,'User confirmed issue is resolved.','2025-06-09 10:21:02'),(4,8,'Closing ticket with resolution notes.','2025-06-09 10:11:02'),(5,6,'Reported again after facing same problem.','2025-06-09 10:21:03'),(6,6,'Waiting for update from development team.','2025-06-09 09:51:03'),(7,18,'First comment','2025-06-09 10:23:48'),(8,1,'abc','2025-06-09 18:02:07');
/*!40000 ALTER TABLE `ticket_comments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tickets`
--

DROP TABLE IF EXISTS `tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tickets` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reported_date` date DEFAULT NULL,
  `mode` enum('Email','Self','Call') DEFAULT NULL,
  `employee_id` int DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `description` text,
  `category` varchar(100) DEFAULT NULL,
  `sub_category` varchar(100) DEFAULT NULL,
  `priority` enum('Critical','High','Medium','Low') NOT NULL,
  `attachment_path` varchar(512) DEFAULT NULL,
  `is_master` tinyint(1) DEFAULT NULL,
  `master_id` int DEFAULT NULL,
  `last_modified` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `status` varchar(20) DEFAULT NULL,
  `assigned_to_level` varchar(20) DEFAULT NULL,
  `assigned_to` varchar(100) DEFAULT NULL,
  `assigned_by` varchar(50) DEFAULT NULL,
  `severity` varchar(50) DEFAULT NULL,
  `recommended_severity` varchar(50) DEFAULT NULL,
  `severity_recommended_by` varchar(100) DEFAULT NULL,
  `impact` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `master_id` (`master_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`master_id`) REFERENCES `tickets` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=110 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tickets`
--

LOCK TABLES `tickets` WRITE;
/*!40000 ALTER TABLE `tickets` DISABLE KEYS */;
INSERT INTO `tickets` VALUES (1,'2025-04-08','Call',101,'Can\'t change password','Issue related to password reset. Please assist.','software','printer','Low',NULL,0,1,'2025-06-09 09:53:04','ON_HOLD',NULL,NULL,NULL,NULL,NULL,NULL,NULL),(2,'2025-06-03','Self',110,'Forgot my password','Issue related to password reset. Please assist.','Account','Password Reset','High','',1,1,'2025-06-09 09:53:52','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL),(3,'2025-04-16','Call',100,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Medium','',0,1,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(4,'2025-04-15','Self',153,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Low','',1,1,'2025-06-09 09:53:52','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL),(5,'2025-04-10','Call',191,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','High','',0,1,'2025-06-09 09:53:04','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL),(6,'2025-04-25','Call',195,'VPN fails during connection','Issue related to vpn. Please assist.','Network','VPN','Medium','',1,1,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(7,'2025-05-30','Email',186,'Can\'t connect to VPN','Issue related to vpn. Please assist.','Network','VPN','Low','',0,1,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(8,'2025-04-23','Email',127,'Printer not responding','Issue related to printer. Please assist.','Hardware','Printer','Low','',1,1,'2025-06-09 09:53:52','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL),(9,'2025-04-26','Call',161,'Can\'t access my account','Issue related to login. Please assist.','Account','Login','High','',0,1,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(11,'2025-04-11','Call',168,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Medium','',0,11,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(12,'2025-04-06','Self',146,'Login credentials not accepted','Issue related to login. Please assist.','Account','Login','Critical','',1,11,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(13,'2025-05-23','Self',199,'Outlook crashes on launch','Issue related to outlook. Please assist.','Software','Outlook','Medium','',0,11,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(14,'2025-04-26','Call',194,'Internet not working','Issue related to connectivity. Please assist.','Network','Connectivity','Medium','',1,11,'2025-06-09 09:53:52','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL),(15,'2025-05-21','Self',155,'Printer jammed','Issue related to printer. Please assist.','Hardware','Printer','Critical','',0,11,'2025-06-09 09:54:08','CLOSED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(16,'2025-05-05','Call',138,'Stuck at login screen','Issue related to login. Please assist.','Account','Login','Critical','',1,11,'2025-06-09 09:53:52','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL),(17,'2025-05-10','Email',150,'Printer not responding','Issue related to printer. Please assist.','Hardware','Printer','Critical','',0,11,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(18,'2025-04-16','Email',163,'VPN not working','Issue related to vpn. Please assist.','Network','VPN','Critical','',1,11,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(21,'2025-05-20','Call',154,'Blue screen error','Issue related to system crash. Please assist.','Hardware','System Crash','Low','',0,21,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(22,'2025-05-25','Self',122,'VPN not working','Issue related to vpn. Please assist.','Network','VPN','Low','',1,21,'2025-06-09 09:53:52','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL),(23,'2025-04-18','Email',162,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','High','',0,21,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(24,'2025-04-26','Call',199,'Email stuck in outbox','Issue related to outlook. Please assist.','Software','Outlook','Critical','',1,21,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(25,'2025-04-05','Email',118,'Forgot my password','Issue related to password reset. Please assist.','Account','Password Reset','Medium','',0,21,'2025-06-09 09:53:04','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL),(26,'2025-05-21','Self',131,'System crashes on boot','Issue related to system crash. Please assist.','Hardware','System Crash','Medium','',1,21,'2025-06-09 09:53:52','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL),(27,'2025-05-06','Call',100,'Outlook crashes on launch','Issue related to outlook. Please assist.','Software','Outlook','High','',0,21,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(31,'2025-05-14','Self',168,'VPN fails during connection','Issue related to vpn. Please assist.','Network','VPN','Critical','',0,31,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(32,'2025-04-20','Call',176,'Outlook not opening','Issue related to outlook. Please assist.','Software','Outlook','Low','',1,31,'2025-06-09 09:53:52','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL),(33,'2025-05-31','Call',197,'Printer jammed','Issue related to printer. Please assist.','Hardware','Printer','High','',0,31,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(34,'2025-05-04','Self',188,'Outlook not opening','Issue related to outlook. Please assist.','Software','Outlook','Critical','',1,31,'2025-06-09 09:53:52','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL),(35,'2025-05-10','Email',124,'False positive alerts','Issue related to antivirus. Please assist.','Software','Antivirus','Medium','',0,31,'2025-06-09 09:53:04','CLOSED','L1',NULL,NULL,NULL,NULL,NULL,NULL),(36,'2025-05-02','Call',142,'VPN not working','Issue related to vpn. Please assist.','Network','VPN','High','',1,31,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(41,'2025-05-19','Self',141,'Unable to login','Issue related to login. Please assist.','Account','Login','Low','',0,41,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(42,'2025-06-02','Self',149,'Login credentials not accepted','Issue related to login. Please assist.','Account','Login','Medium','',1,41,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(43,'2025-04-17','Email',140,'Printer jammed','Issue related to printer. Please assist.','Hardware','Printer','High','',0,41,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(44,'2025-05-29','Email',128,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Medium','',1,41,'2025-06-09 09:53:52','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL),(45,'2025-05-31','Self',148,'Can\'t print documents','Issue related to printer. Please assist.','Hardware','Printer','Critical','',0,41,'2025-06-09 09:54:08','CLOSED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(51,'2025-05-17','Call',125,'Printer not responding','Issue related to printer. Please assist.','Hardware','Printer','High','',0,51,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(52,'2025-05-21','Email',131,'Can\'t send email','Issue related to outlook. Please assist.','Software','Outlook','High','',1,51,'2025-06-09 09:53:52','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL),(53,'2025-05-05','Self',118,'Stuck at login screen','Issue related to login. Please assist.','Account','Login','Low','',0,51,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(54,'2025-04-08','Self',149,'Printer showing error code','Issue related to printer. Please assist.','Hardware','Printer','Low','',1,51,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(61,'2025-05-31','Email',126,'Can\'t change password','Issue related to password reset. Please assist.','Account','Password Reset','Low','',0,61,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(62,'2025-04-12','Self',164,'Login credentials not accepted','Issue related to login. Please assist.','Account','Login','High','',1,61,'2025-06-09 09:53:52','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL),(63,'2025-05-19','Email',172,'Login page not loading','Issue related to login. Please assist.','Account','Login','Low','',0,61,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(71,'2025-04-21','Self',112,'Email not syncing','Issue related to outlook. Please assist.','Software','Outlook','Low','',0,71,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(72,'2025-04-17','Call',155,'VPN disconnects randomly','Issue related to vpn. Please assist.','Network','VPN','Low','',1,71,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(81,'2025-06-02','Email',160,'VPN disconnects randomly','Issue related to vpn. Please assist.','Network','VPN','Low','',0,81,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(96,'2025-06-05','Email',1024,'Unable to access internal portal','The intranet portal shows a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(97,'2025-06-05','Email',1014,'Cannot access internal portal','The intranet portal shows a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(98,'2025-06-05','Call',1111,'Cannot access internal portal','The intranet portal shows a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-06-09 09:53:52','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL),(99,'2025-06-05','Call',1112,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-06-09 09:54:08','PENDING','L3',NULL,NULL,NULL,NULL,NULL,NULL),(100,'2025-06-05','Call',1113,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-06-09 09:53:52','CLOSED','L2',NULL,NULL,NULL,NULL,NULL,NULL),(101,'2025-06-05','Call',1114,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',0,NULL,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(102,'2025-06-05','Call',1115,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',1,NULL,'2025-06-09 09:54:08','REOPENED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(103,'2025-06-05','Call',1116,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',1,NULL,'2025-06-09 09:53:04','PENDING','L1',NULL,NULL,NULL,NULL,NULL,NULL),(104,'2025-06-05','Call',1117,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',1,NULL,'2025-06-09 09:53:52','ON_HOLD','L2',NULL,NULL,NULL,NULL,NULL,NULL),(105,'2025-06-05','Call',1118,'Cannot access internal portal','The intranet portal a 403 forbidden error since morning.','IT Support','Network Issue','High','',1,NULL,'2025-06-09 09:54:08','CLOSED','L3',NULL,NULL,NULL,NULL,NULL,NULL),(106,'2025-06-08','Call',101,'T!','D!','software','laptop','Medium',NULL,0,NULL,'2025-06-09 09:53:52','PENDING','L2',NULL,NULL,NULL,NULL,NULL,NULL),(107,'2025-06-12','Self',201,'s1','d1','2','1','Low',NULL,0,NULL,NULL,'ON_HOLD','','','nimit.jain',NULL,NULL,NULL,NULL),(108,'2025-06-12','Self',201,'s1','d1','2','1','Low',NULL,1,NULL,NULL,'ON_HOLD','','','nimit.jain',NULL,NULL,NULL,NULL),(109,'2025-06-12','Self',201,'s1','d1','2','1','Low',NULL,1,NULL,NULL,'RESOLVED','1','201','nimit.jain',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `tickets` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-06-13  9:56:51
