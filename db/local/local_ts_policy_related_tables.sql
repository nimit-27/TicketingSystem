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
-- Table structure for table `access_policy`
--

DROP TABLE IF EXISTS `access_policy`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `access_policy` (
  `policy_id` int NOT NULL AUTO_INCREMENT,
  `code` varchar(100) NOT NULL,
  `resource` varchar(100) NOT NULL,
  `effect` varchar(20) NOT NULL,
  `description` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(100) DEFAULT 'SYSTEM',
  `updated_by` varchar(100) DEFAULT 'SYSTEM',
  PRIMARY KEY (`policy_id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_access_policy_resource_active` (`resource`,`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `access_policy`
--

LOCK TABLES `access_policy` WRITE;
/*!40000 ALTER TABLE `access_policy` DISABLE KEYS */;
INSERT INTO `access_policy` VALUES (1,'TICKET_VIEW_ALL','ticket','allow','View all tickets',1,'2026-03-21 22:02:27','2026-03-23 00:03:52','SYSTEM','SYSTEM'),(2,'TICKET_VIEW_OWN','ticket','allow','View own tickets',1,'2026-03-21 22:02:27','2026-03-21 22:02:27','SYSTEM','SYSTEM'),(3,'TICKET_VIEW_ASSIGNED','ticket','allow','View assigned tickets',1,'2026-03-21 22:02:27','2026-03-21 22:02:27','SYSTEM','SYSTEM'),(4,'TICKET_VIEW_SAME_ZONE','ticket','allow','View tickets in same zone as user',1,'2026-03-21 22:02:27','2026-03-21 22:02:27','SYSTEM','SYSTEM'),(5,'DOWNLOADS_VIEW_SELF','downloads','allow','View self generated reports',1,'2026-05-26 23:57:49','2026-05-26 23:57:49','SYSTEM','SYSTEM');
/*!40000 ALTER TABLE `access_policy` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `policy_rule`
--

DROP TABLE IF EXISTS `policy_rule`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `policy_rule` (
  `rule_id` int NOT NULL AUTO_INCREMENT,
  `policy_id` int NOT NULL,
  `condition_key` varchar(100) NOT NULL,
  `operator` varchar(50) NOT NULL,
  `condition_value` text,
  `priority` int NOT NULL DEFAULT '100',
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  PRIMARY KEY (`rule_id`),
  KEY `idx_policy_rule_policy_active_priority` (`policy_id`,`is_active`,`priority`),
  CONSTRAINT `fk_policy_rule_policy` FOREIGN KEY (`policy_id`) REFERENCES `access_policy` (`policy_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `policy_rule`
--

LOCK TABLES `policy_rule` WRITE;
/*!40000 ALTER TABLE `policy_rule` DISABLE KEYS */;
INSERT INTO `policy_rule` VALUES (1,2,'ticket.owner_id','EQ','user.user_id',100,1),(2,3,'ticket.assigned_to','EQ','user.user_id',100,1),(3,4,'ticket.zone_id','IN_CONTEXT','user.zone_ids',100,1),(4,5,'requestedBy','EQ','user_id',100,1);
/*!40000 ALTER TABLE `policy_rule` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role_policy_map`
--

DROP TABLE IF EXISTS `role_policy_map`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role_policy_map` (
  `role_id` int NOT NULL,
  `policy_id` int NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_on` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `created_by` varchar(100) DEFAULT 'SYSTEM',
  `updated_by` varchar(100) DEFAULT 'SYSTEM',
  PRIMARY KEY (`role_id`,`policy_id`),
  KEY `fk_role_policy_policy` (`policy_id`),
  KEY `idx_role_policy_map_role_active` (`role_id`,`is_active`),
  CONSTRAINT `fk_role_policy_policy` FOREIGN KEY (`policy_id`) REFERENCES `access_policy` (`policy_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_role_policy_role` FOREIGN KEY (`role_id`) REFERENCES `role_permission_config` (`role_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role_policy_map`
--

LOCK TABLES `role_policy_map` WRITE;
/*!40000 ALTER TABLE `role_policy_map` DISABLE KEYS */;
INSERT INTO `role_policy_map` VALUES (3,1,1,'2026-03-23 00:11:17','2026-03-23 00:11:17','SYSTEM','SYSTEM'),(6,1,1,'2026-03-23 00:09:57','2026-03-23 00:09:57','SYSTEM','SYSTEM'),(7,1,1,'2026-03-22 23:58:26','2026-03-22 23:58:26','SYSTEM','SYSTEM'),(7,5,1,'2026-05-27 00:03:58','2026-05-27 00:03:58','SYSTEM','SYSTEM'),(12,1,1,'2026-05-01 23:45:04','2026-05-01 23:45:04','SYSTEM','SYSTEM');
/*!40000 ALTER TABLE `role_policy_map` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-27  0:37:17
