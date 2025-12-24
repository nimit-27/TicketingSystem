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
INSERT INTO `notification_master` VALUES (1,'TICKET_CREATED','Ticket Created','Triggered when a new ticket is logged in the system.','Ticket {{ticketId}} created','Hello {{recipientName}}, ticket {{ticketId}} has been created by {{initiatorName}}.','ticket_created_email.html',NULL,'ticket_created_inapp.html','[\"EMAIL\", \"IN_APP\"]',_binary '','2025-01-10 09:00:00.000000','2025-09-29 03:44:59.270447'),(2,'TICKET_STATUS_UPDATE','Ticket Status Updated','Alerts requestors when ticket status changes.','Ticket {{ticketId}} status updated','Ticket {{ticketNumber}} changed from {{oldStatus}} to {{newStatus}}.','ticket_status_update_email.html','TKT_STATUS_UPDATE','ticket_status_update_inapp.html','[\"EMAIL\", \"SMS\", \"IN_APP\"]',_binary '','2025-01-10 09:05:00.000000','2025-12-22 01:37:42.254489'),(3,'TICKET_FEEDBACK_REMINDER','Ticket Feedback Reminder','Reminder to share feedback after resolution.','Feedback pending for ticket {{ticketId}}','Hi {{recipientName}}, please provide feedback for ticket {{ticketNumber}} resolved on {{resolvedDate}}.',NULL,NULL,'ticket_feedback_inapp.html','[\"IN_APP\"]',_binary '','2025-01-10 09:10:00.000000','2025-09-29 03:44:59.277083'),(4,'TICKET_ASSIGNED','Ticket Assigned','Notifies the assignee when a ticket is assigned to them.','Ticket {{ticketId}} assigned to you','Ticket {{ticketId}} has been assigned to you.','ticket_assigned_email.html',NULL,'ticket_assigned_inapp.html','[\"IN_APP\"]',_binary '','2025-01-10 09:15:00.000000','2025-12-22 01:37:42.255011'),(5,'TICKET_UPDATED','Ticket Updated','Alerts requestors when key ticket details are updated, such as assignment changes.','Ticket {{ticketId}} updated','Ticket {{ticketNumber}} has been updated.',NULL,NULL,'ticket_updated_inapp.html','[\"IN_APP\"]',_binary '','2025-01-10 09:20:00.000000','2025-12-22 02:57:24.996039'),(6,'TICKET_SLA_BREACHED','Ticket SLA Breached','Alerts assignees when an assigned ticket breaches its SLA.','Ticket {{ticketId}} breached SLA','Ticket {{ticketNumber}} has breached its SLA by {{breachedByMinutes}} minutes. Please review and take corrective action.','ticket_sla_breached_email.html',NULL,'ticket_sla_breached_inapp.html','[\"IN_APP\"]',_binary '','2025-01-10 09:25:00.000000','2025-09-29 03:44:59.280145'),(7,'TICKET_ASSIGNED_REQUESTER','Ticket Assigned - Requester','Notifies the requester when their ticket assignment is updated.','Ticket {{ticketId}} assigned','Hello {{recipientName}}, your ticket {{ticketId}} has been assigned.','ticket_assigned_requester_email.html',NULL,'ticket_assigned_requester_inapp.html','[\"EMAIL\", \"IN_APP\"]',_binary '','2025-01-10 09:30:00.000000','2025-12-22 01:37:42.252780');
/*!40000 ALTER TABLE `notification_master` ENABLE KEYS */;
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

-- Dump completed on 2025-12-22  2:58:03
