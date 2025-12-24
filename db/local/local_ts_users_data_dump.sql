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
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('201','Arjun Mehta','arjun.mehta@example.com','9123456780',NULL,'arjunm','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5','7'),('202','Bhavya Rao','bhavya.rao@example.com','9123456781',NULL,'bhavyar','admin123','2','6'),('203','Chirag Shah','chirag.shah@example.com','9123456782',NULL,'chirags','admin123','5','2'),('204','Divya Kapoor','divya.kapoor@example.com','9123456783',NULL,'divyak','admin123','2','6'),('205','Esha Singh','esha.singh@example.com','9123456784',NULL,'eshas','admin123','5','2'),('206','Farhan Ali','farhan.ali@example.com','9123456785',NULL,'farhana','admin123','1','6'),('207','Garima Jain','garima.jain@example.com','9123456786',NULL,'garimaj','admin123','3','6'),('208','RNO Harsh Verma','harsh.verma@example.com','9123456787',NULL,'rnoharshv','admin123','4','6'),('209','Ishaan Malhotra','ishaan.m@example.com','9123456788',NULL,'ishaanm','admin123','6','6'),('210','Jaya Nair','jaya.nair@example.com','9123456789',NULL,'jayan','admin123','5|7','6|7'),('211','Guest Account','guest@example.com','6135712345',NULL,'guest','admin123','5','1'),('212','Kevin Brooks','kevin.brooks@example.com','9123456790',NULL,'kevinb','admin123','8','6'),('213','Lara Singh','lara.singh@example.com','9123456791',NULL,'laras','admin123','5|7|8','6|7'),('214','Mohan Kumar','mohan.kumar@example.com','9123456792',NULL,'mohank','admin123','ADMIN','7'),('215','User Name','user.name@example.com','1111111111',NULL,'usern','admin123','USER','1'),('216','Team Lead Name 1','team.lead1@example.com','1212121212',NULL,'teaml1','admin123','5|7','6|7'),('217','ITM John Doe','itm.johndoe@example.com','2222222222',NULL,'itmjd','admin123','9','6'),('301','fci Aditi Sharma','fci.aditi.sharma@example.com','9123000001','New Delhi','fciaditi','admin123','USER','1'),('302','fci Bharat Kumar','fci.bharat.kumar@example.com','9123000002','Lucknow','fcibharat','admin123','USER','1'),('303','fci Charu Patel','fci.charu.patel@example.com','9123000003','Chandigarh','fcicharu','admin123','USER','1'),('304','fci Deepak Verma','fci.deepak.verma@example.com','9123000004','Hyderabad','fcideepak','admin123','USER','1'),('306','John Doe Hda Dev 1','hda.env@dev.com','9876543211',NULL,'dev_hda_1','admin123','3','3'),('307','John Doe Rno Dev 1','rno.env@dev.com','9876543212',NULL,'dev_rno_1','admin123','4','3'),('308','John Doe Req Dev 1','req.env@dev.com','9876543213',NULL,'dev_req_1','admin123','5','3'),('309','John Doe Sa Dev 1','sa.env@dev.com','9876543214',NULL,'dev_sa_1','admin123','6','3'),('310','John Doe Tl Dev 1','tl.env@dev.com','9876543215',NULL,'dev_tl_1','admin123','7','3'),('311','John Doe Tt Dev 1','tt.env@dev.com','9876543216',NULL,'dev_tt_1','admin123','8','3'),('312','John Doe M Dev 1','m.env@dev.com','8876543216',NULL,'dev_m_1','admin123','11','3'),('313','Jon Doe ITM Dev 1','itm.env@dev.com','8988980790',NULL,'dev_itm_1','admin123','9','3'),('314','Vikram Kumar Singh','vikram.6.singh@coforge.com','9345397273',NULL,'vikram6singh','admin123','7','3'),('315','Shruti Kumari','shrutipan966@gmail.com','7033312254',NULL,'shrutipan966','admin123','3','3'),('316','Shivani Yadav','shivaniyadav091298@gmail.com','8285790449',NULL,'shivaniyadav091298','admin123','3','3'),('317','Sushil Kumar Gupt','kumarguptsushil@gmail.com','7268809617',NULL,'kumarguptsushil','admin123','3','3');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
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

-- Dump completed on 2025-12-24 10:48:01
