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
-- Table structure for table `issue_type_master`
--

DROP TABLE IF EXISTS `issue_type_master`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `issue_type_master` (
  `issue_type_id` varchar(3) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`issue_type_id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `issue_type_master`
--

LOCK TABLES `issue_type_master` WRITE;
/*!40000 ALTER TABLE `issue_type_master` DISABLE KEYS */;
INSERT INTO `issue_type_master` VALUES ('1','Incident','Unexpected disruption or degradation of a service (e.g., system outage, application crash).',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('10','Network / Connectivity Issue','Internet or VPN problems (e.g., slow network, unable to connect).',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('11','Security Incident','Breach or vulnerability (e.g., phishing attempt, malware detection).',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('12','Cosmetic Issue','Some UI/UX related non-severe issue',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('2','Service Request','Requests for new services or access (e.g., software installation, account creation).',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('3','Problem / Bug','Underlying cause of recurring incidents (e.g., root cause analysis for repeated application issue).',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('4','Change Request','Request to modify or update existing systems or configurations (e.g., upgrade server capacity).',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('5','Routine Task','Routine operational work (e.g., scheduled maintenance, data backup).',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('6','Inquiry / Question','General queries or information requests',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('7','Access / Permission Issue','Problems related to user access rights',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('8','Hardware/ Device Issue','Physical device problems',1,'2026-01-15 14:42:24','2026-01-15 14:42:24'),('9','Integrated Application Issue','Integrated Application Down / Slow Response',1,'2026-01-15 14:42:24','2026-01-15 14:42:24');
/*!40000 ALTER TABLE `issue_type_master` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping events for database 'ticketing_system'
--

--
-- Dumping routines for database 'ticketing_system'
--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-23 16:02:01
