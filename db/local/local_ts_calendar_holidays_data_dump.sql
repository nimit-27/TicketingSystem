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
-- Dumping data for table `calendar_holiday`
--

LOCK TABLES `calendar_holiday` WRITE;
/*!40000 ALTER TABLE `calendar_holiday` DISABLE KEYS */;
INSERT INTO `calendar_holiday` VALUES (1,'2026-01-03','Weekend','IN-WB-Kolkata',0),(2,'2026-01-04','Weekend','IN-WB-Kolkata',0),(3,'2026-01-10','Weekend','IN-WB-Kolkata',0),(4,'2026-01-11','Weekend','IN-WB-Kolkata',0),(5,'2026-01-17','Weekend','IN-WB-Kolkata',0),(6,'2026-01-18','Weekend','IN-WB-Kolkata',0),(7,'2026-01-24','Weekend','IN-WB-Kolkata',0),(8,'2026-01-25','Weekend','IN-WB-Kolkata',0),(9,'2026-01-31','Weekend','IN-WB-Kolkata',0),(10,'2026-02-01','Weekend','IN-WB-Kolkata',0),(11,'2026-02-07','Weekend','IN-WB-Kolkata',0),(12,'2026-02-08','Weekend','IN-WB-Kolkata',0),(13,'2026-02-14','Weekend','IN-WB-Kolkata',0),(14,'2026-02-15','Weekend','IN-WB-Kolkata',0),(15,'2026-02-21','Weekend','IN-WB-Kolkata',0),(16,'2026-02-22','Weekend','IN-WB-Kolkata',0),(17,'2026-02-28','Weekend','IN-WB-Kolkata',0),(18,'2026-03-01','Weekend','IN-WB-Kolkata',0),(19,'2026-03-07','Weekend','IN-WB-Kolkata',0),(20,'2026-03-08','Weekend','IN-WB-Kolkata',0),(21,'2026-03-14','Weekend','IN-WB-Kolkata',0),(22,'2026-03-15','Weekend','IN-WB-Kolkata',0),(23,'2026-03-21','Weekend','IN-WB-Kolkata',0),(24,'2026-03-22','Weekend','IN-WB-Kolkata',0),(25,'2026-03-28','Weekend','IN-WB-Kolkata',0),(26,'2026-03-29','Weekend','IN-WB-Kolkata',0),(27,'2026-04-04','Weekend','IN-WB-Kolkata',0),(28,'2026-04-05','Weekend','IN-WB-Kolkata',0),(29,'2026-04-11','Weekend','IN-WB-Kolkata',0),(30,'2026-04-12','Weekend','IN-WB-Kolkata',0),(31,'2026-04-18','Weekend','IN-WB-Kolkata',0),(32,'2026-04-19','Weekend','IN-WB-Kolkata',0),(33,'2026-04-25','Weekend','IN-WB-Kolkata',0),(34,'2026-04-26','Weekend','IN-WB-Kolkata',0),(35,'2026-05-02','Weekend','IN-WB-Kolkata',0),(36,'2026-05-03','Weekend','IN-WB-Kolkata',0),(37,'2026-05-09','Weekend','IN-WB-Kolkata',0),(38,'2026-05-10','Weekend','IN-WB-Kolkata',0),(39,'2026-05-16','Weekend','IN-WB-Kolkata',0),(40,'2026-05-17','Weekend','IN-WB-Kolkata',0),(41,'2026-05-23','Weekend','IN-WB-Kolkata',0),(42,'2026-05-24','Weekend','IN-WB-Kolkata',0),(43,'2026-05-30','Weekend','IN-WB-Kolkata',0),(44,'2026-05-31','Weekend','IN-WB-Kolkata',0),(45,'2026-06-06','Weekend','IN-WB-Kolkata',0),(46,'2026-06-07','Weekend','IN-WB-Kolkata',0),(47,'2026-06-13','Weekend','IN-WB-Kolkata',0),(48,'2026-06-14','Weekend','IN-WB-Kolkata',0),(49,'2026-06-20','Weekend','IN-WB-Kolkata',0),(50,'2026-06-21','Weekend','IN-WB-Kolkata',0),(51,'2026-06-27','Weekend','IN-WB-Kolkata',0),(52,'2026-06-28','Weekend','IN-WB-Kolkata',0),(53,'2026-07-04','Weekend','IN-WB-Kolkata',0),(54,'2026-07-05','Weekend','IN-WB-Kolkata',0),(55,'2026-07-11','Weekend','IN-WB-Kolkata',0),(56,'2026-07-12','Weekend','IN-WB-Kolkata',0),(57,'2026-07-18','Weekend','IN-WB-Kolkata',0),(58,'2026-07-19','Weekend','IN-WB-Kolkata',0),(59,'2026-07-25','Weekend','IN-WB-Kolkata',0),(60,'2026-07-26','Weekend','IN-WB-Kolkata',0),(61,'2026-08-01','Weekend','IN-WB-Kolkata',0),(62,'2026-08-02','Weekend','IN-WB-Kolkata',0),(63,'2026-08-08','Weekend','IN-WB-Kolkata',0),(64,'2026-08-09','Weekend','IN-WB-Kolkata',0),(65,'2026-08-15','Weekend','IN-WB-Kolkata',0),(66,'2026-08-16','Weekend','IN-WB-Kolkata',0),(67,'2026-08-22','Weekend','IN-WB-Kolkata',0),(68,'2026-08-23','Weekend','IN-WB-Kolkata',0),(69,'2026-08-29','Weekend','IN-WB-Kolkata',0),(70,'2026-08-30','Weekend','IN-WB-Kolkata',0),(71,'2026-09-05','Weekend','IN-WB-Kolkata',0),(72,'2026-09-06','Weekend','IN-WB-Kolkata',0),(73,'2026-09-12','Weekend','IN-WB-Kolkata',0),(74,'2026-09-13','Weekend','IN-WB-Kolkata',0),(75,'2026-09-19','Weekend','IN-WB-Kolkata',0),(76,'2026-09-20','Weekend','IN-WB-Kolkata',0),(77,'2026-09-26','Weekend','IN-WB-Kolkata',0),(78,'2026-09-27','Weekend','IN-WB-Kolkata',0),(79,'2026-10-03','Weekend','IN-WB-Kolkata',0),(80,'2026-10-04','Weekend','IN-WB-Kolkata',0),(81,'2026-10-10','Weekend','IN-WB-Kolkata',0),(82,'2026-10-11','Weekend','IN-WB-Kolkata',0),(83,'2026-10-17','Weekend','IN-WB-Kolkata',0),(84,'2026-10-18','Weekend','IN-WB-Kolkata',0),(85,'2026-10-24','Weekend','IN-WB-Kolkata',0),(86,'2026-10-25','Weekend','IN-WB-Kolkata',0),(87,'2026-10-31','Weekend','IN-WB-Kolkata',0),(88,'2026-11-01','Weekend','IN-WB-Kolkata',0),(89,'2026-11-07','Weekend','IN-WB-Kolkata',0),(90,'2026-11-08','Weekend','IN-WB-Kolkata',0),(91,'2026-11-14','Weekend','IN-WB-Kolkata',0),(92,'2026-11-15','Weekend','IN-WB-Kolkata',0),(93,'2026-11-21','Weekend','IN-WB-Kolkata',0),(94,'2026-11-22','Weekend','IN-WB-Kolkata',0),(95,'2026-11-28','Weekend','IN-WB-Kolkata',0),(96,'2026-11-29','Weekend','IN-WB-Kolkata',0),(97,'2026-12-05','Weekend','IN-WB-Kolkata',0),(98,'2026-12-06','Weekend','IN-WB-Kolkata',0),(99,'2026-12-12','Weekend','IN-WB-Kolkata',0),(100,'2026-12-13','Weekend','IN-WB-Kolkata',0),(101,'2026-12-19','Weekend','IN-WB-Kolkata',0),(102,'2026-12-20','Weekend','IN-WB-Kolkata',0),(103,'2026-12-26','Weekend','IN-WB-Kolkata',0),(104,'2026-12-27','Weekend','IN-WB-Kolkata',0);
/*!40000 ALTER TABLE `calendar_holiday` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-02-13  3:28:27
