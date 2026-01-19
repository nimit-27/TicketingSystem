CREATE DATABASE  IF NOT EXISTS `ad_prd_ticket_system` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `ad_prd_ticket_system`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: localhost    Database: ad_prd_ticket_system
-- ------------------------------------------------------
-- Server version	8.0.43

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
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('201','Arjun Mehta','arjun.mehta@example.com','9123456780',NULL,'arjunm','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5','7'),('202','Bhavya Rao','bhavya.rao@example.com','9123456781',NULL,'bhavyar','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','3','6'),('203','Chirag Shah','chirag.shah@example.com','9123456782',NULL,'chirags','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5','2'),('204','Divya Kapoor','divya.kapoor@example.com','9123456783',NULL,'divyak','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','2','6'),('205','Esha Singh','esha.singh@example.com','9123456784',NULL,'eshas','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5','2'),('206','Farhan Ali','farhan.ali@example.com','9123456785',NULL,'farhana','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','1','6'),('207','Garima Jain','garima.jain@example.com','9123456786',NULL,'garimaj','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','3','6'),('208','RNO Harsh Verma','harsh.verma@example.com','9123456787',NULL,'rnoharshv','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','4','6'),('209','Ishaan Malhotra','ishaan.m@example.com','9123456788',NULL,'ishaanm','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','6','6'),('210','Jaya Nair','jaya.nair@example.com','9123456789',NULL,'jayan','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5|7','6|7'),('211','Guest Account','guest@example.com','6135712345',NULL,'guest','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5','1'),('212','Kevin Brooks','kevin.brooks@example.com','9123456790',NULL,'kevinb','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','8','6'),('213','Lara Singh','lara.singh@example.com','9123456791',NULL,'laras','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5|7|8','6|7'),('214','Mohan Kumar','mohan.kumar@example.com','9123456792',NULL,'mohank','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','ADMIN','7'),('215','User Name','user.name@example.com','1111111111',NULL,'usern','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','USER','1'),('216','Team Lead Name 1','team.lead1@example.com','1212121212',NULL,'teaml1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5|7','6|7'),('217','ITM John Doe','itm.johndoe@example.com','2222222222',NULL,'itmjd','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','9','6'),('301','fci Aditi Sharma','fci.aditi.sharma@example.com','9123000001','New Delhi','fciaditi','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','USER','1'),('302','fci Bharat Kumar','fci.bharat.kumar@example.com','9123000002','Lucknow','fcibharat','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','USER','1'),('303','fci Charu Patel','fci.charu.patel@example.com','9123000003','Chandigarh','fcicharu','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','USER','1'),('304','fci Deepak Verma','fci.deepak.verma@example.com','9123000004','Hyderabad','fcideepak','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','USER','1'),('306','John Doe Hda prd 1','hda.env@prd.com','9876543211',NULL,'prd_hda_1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','3','3'),('307','John Doe Rno prd 1','rno.env@prd.com','9876543212',NULL,'prd_rno_1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','4','3'),('308','John Doe Req Prd 1','req.env@prd.com','9876543213',NULL,'prd_req_1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','5','3'),('309','John Doe Sa prd 1','sa.env@prd.com','9876543214',NULL,'prd_sa_1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','6','3'),('310','John Doe Tl prd 1','tl.env@prd.com','9876543215',NULL,'prd_tl_1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','7','3'),('311','John Doe Tt prd 1','tt.env@prd.com','9876543216',NULL,'prd_tt_1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','8','3'),('312','John Doe M prd 1','m.env@prd.com','8876543216',NULL,'prd_m_1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','11','3'),('313','Jon Doe ITM prd 1','itm.env@prd.com','8988980790',NULL,'prd_itm_1','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','9','3'),('314','Vikram Kumar Singh','vikram.6.singh@coforge.com','9345397273',NULL,'vikram6singh','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','7','3'),('315','Shruti Kumari','shrutipan966@gmail.com','7033312254',NULL,'shrutipan966','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','3','3'),('316','Shivani Yadav','shivaniyadav091298@gmail.com','8285790449',NULL,'shivaniyadav091298','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','3','3'),('317','Sushil Kumar Gupt','kumarguptsushil@gmail.com','7268809617',NULL,'kumarguptsushil','$2y$10$Pnf3.cQpS8Tz6sUs0y94LePHy0cEAnXS.8d/Pyzvvx4gldkosoufm','3','3');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-16 15:26:03
