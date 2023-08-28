CREATE DATABASE  IF NOT EXISTS `accounts` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `accounts`;
-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: accounts
-- ------------------------------------------------------
-- Server version	8.0.33

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
  `id` varchar(255) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `role` varchar(255) DEFAULT NULL,
  `profilePicture` varchar(255) DEFAULT NULL,
  `profileDescription` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('user-1','Eves','Host','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-1.png','I\'ve been to 15 different planets and decided to make a home for myself and others in my favourites. Each planet and location has its own distinct environment, so read the description carefully. I have equipped them all with the necessary amenities.','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-2','Jackenn','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-2.png','Not a guest feature yet.','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-3','Athes','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-3.png','Not a guest feature yet.','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-4','Kelle','Host','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-4.png','So excited to have you! I\'m readily available if you need anything, from missing bath towels to local food recommendations. Have an awesome time!','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-5','Renie','Host','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-5.png','You won\'t regret staying at my place! My listings get booked up quickly so better get to it!','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-6','Flinson','Host','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-6.png','I\'m new at this, please be nice.','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-7','Cara','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-7.png','Not a guest feature yet.','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-8','Wardy','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-8.png','Not a guest feature yet.','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-9','Brise','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-9.png','Not a guest feature yet.','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-10','Hendav','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-10.png','Not a guest feature yet.','2023-05-25 01:01:39','2023-05-25 01:01:39'),('user-1','Eves','Host','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-1.png','I\'ve been to 15 different planets and decided to make a home for myself and others in my favourites. Each planet and location has its own distinct environment, so read the description carefully. I have equipped them all with the necessary amenities.','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-2','Jackenn','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-2.png','Not a guest feature yet.','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-3','Athes','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-3.png','Not a guest feature yet.','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-4','Kelle','Host','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-4.png','So excited to have you! I\'m readily available if you need anything, from missing bath towels to local food recommendations. Have an awesome time!','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-5','Renie','Host','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-5.png','You won\'t regret staying at my place! My listings get booked up quickly so better get to it!','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-6','Flinson','Host','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-6.png','I\'m new at this, please be nice.','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-7','Cara','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-7.png','Not a guest feature yet.','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-8','Wardy','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-8.png','Not a guest feature yet.','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-9','Brise','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-9.png','Not a guest feature yet.','2023-07-17 11:34:15','2023-07-17 11:34:15'),('user-10','Hendav','Guest','https://res.cloudinary.com/apollographql/image/upload/odyssey/airlock/user-10.png','Not a guest feature yet.','2023-07-17 11:34:15','2023-07-17 11:34:15');
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

-- Dump completed on 2023-07-21 21:25:20
