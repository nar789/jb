-- MySQL dump 10.13  Distrib 5.1.41, for Win32 (ia32)
--
-- Host: localhost    Database: jb
-- ------------------------------------------------------
-- Server version	5.1.41-community

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES latin1 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `page`
--

DROP TABLE IF EXISTS `page`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `page` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `comment` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `type_id` int(11) DEFAULT NULL,
  `attr` text CHARACTER SET latin1,
  `filter` text CHARACTER SET latin1,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=4 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `page`
--

LOCK TABLES `page` WRITE;
/*!40000 ALTER TABLE `page` DISABLE KEYS */;
INSERT INTO `page` VALUES (1,'stg','stg',1,'model','SM-F900U,SM-G975N,SM-G960N,SM-G920S'),(2,'tablet','tablet',1,'model','SM-T725'),(3,'mass','mass',1,'model','SM-A105N');
/*!40000 ALTER TABLE `page` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `phone`
--

DROP TABLE IF EXISTS `phone`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `phone` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `model` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `sales` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `nick` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `label` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=28 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `phone`
--

LOCK TABLES `phone` WRITE;
/*!40000 ALTER TABLE `phone` DISABLE KEYS */;
INSERT INTO `phone` VALUES (1,'SM-F900U','VZW','b123456,a123456','CTS1'),(2,'SM-F900U','VZW','c123456,d123456','GTS1'),(3,'SM-G975N','SKC','e123456,f123456','CTS1'),(4,'SM-G975N','KTC','g123456,h123456','GTS3'),(5,'SM-G975N','KTC','k123456','GTS2'),(6,'SM-G975N','LUC','p1234567','GTS1'),(16,'SM-T725','SPR','1q2w3e4r','ETC1'),(17,'SM-T725','VZW','1q1q2b2b','CTS1'),(18,'SM-A105N','KOO','akk7dino','CTS2'),(19,'SM-A105N','KOO','ak89655g','CTS2'),(25,'SM-G960N','SKC','r39k601trf,2318ac544f0c7ece','CTS1'),(27,'SM-G920S','SKC','r39h10jbya,06157df6ebb91a01','GTS1');
/*!40000 ALTER TABLE `phone` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `rental`
--

DROP TABLE IF EXISTS `rental`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `rental` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type_id` int(11) DEFAULT NULL,
  `asset_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `write_dt` datetime DEFAULT NULL,
  `state` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=71 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `rental`
--

LOCK TABLES `rental` WRITE;
/*!40000 ALTER TABLE `rental` DISABLE KEYS */;
INSERT INTO `rental` VALUES (1,1,1,1,'2019-04-29 18:52:32','rental'),(2,1,3,1,'2019-04-29 18:52:47','rental'),(3,1,6,1,'2019-04-29 22:30:29','rental'),(4,1,6,2,'2019-04-29 23:33:48','return'),(5,1,2,2,'2019-04-30 00:02:37','rental'),(6,1,4,2,'2019-04-30 01:22:54','rental'),(7,1,5,2,'2019-04-30 01:22:54','rental'),(8,1,1,1,'2019-04-30 04:16:07','return'),(9,1,2,1,'2019-04-30 04:16:07','return'),(10,1,1,1,'2019-04-30 04:17:27','rental'),(11,1,4,1,'2019-04-30 04:19:25','return'),(12,1,1,1,'2019-05-01 13:19:19','return'),(13,1,3,1,'2019-05-01 15:26:38','return'),(14,1,5,1,'2019-05-01 15:26:38','return'),(15,1,3,1,'2019-05-01 15:27:05','rental'),(16,1,1,1,'2019-05-01 15:27:05','rental'),(17,1,1,1,'2019-05-01 17:11:07','return'),(27,1,2,1,'2019-05-05 17:53:01','rental'),(26,1,1,1,'2019-05-05 17:53:01','rental'),(25,1,3,1,'2019-05-05 17:45:22','return'),(21,1,16,1,'2019-05-02 00:18:29','rental'),(22,1,17,1,'2019-05-02 00:18:58','rental'),(23,1,17,1,'2019-05-02 00:24:02','return'),(24,1,16,1,'2019-05-02 00:24:02','return'),(28,1,1,1,'2019-05-06 04:18:14','return'),(29,1,2,1,'2019-05-06 04:18:14','return'),(30,1,3,1,'2019-05-06 04:19:16','rental'),(31,1,4,1,'2019-05-06 04:19:16','rental'),(32,1,5,1,'2019-05-06 04:19:16','rental'),(33,1,6,1,'2019-05-06 04:19:16','rental'),(34,1,25,1,'2019-05-06 20:17:13','rental'),(35,1,25,1,'2019-05-06 20:18:41','return'),(36,1,25,1,'2019-05-06 20:21:11','return'),(37,1,25,1,'2019-05-06 20:24:02','rental'),(38,1,25,1,'2019-05-06 20:24:16','return'),(39,1,27,1,'2019-05-06 21:41:12','rental'),(40,1,25,1,'2019-05-06 21:41:12','rental'),(41,1,27,1,'2019-05-06 21:43:44','return'),(42,1,25,1,'2019-05-06 21:43:44','return'),(43,1,27,1,'2019-05-06 21:45:26','rental'),(44,1,25,1,'2019-05-06 21:45:26','rental'),(45,1,27,1,'2019-05-06 21:46:10','return'),(46,1,25,1,'2019-05-06 21:46:10','return'),(47,1,27,1,'2019-05-06 21:46:32','rental'),(48,1,25,1,'2019-05-06 21:46:32','rental'),(49,1,27,1,'2019-05-06 21:46:47','return'),(50,1,25,1,'2019-05-06 21:46:47','return'),(51,1,27,2,'2019-05-06 22:10:13','rental'),(52,1,25,2,'2019-05-06 22:10:13','rental'),(53,1,27,2,'2019-05-06 22:10:18','return'),(54,1,25,2,'2019-05-06 22:10:18','return'),(55,1,1,2,'2019-05-07 21:26:03','rental'),(56,1,2,2,'2019-05-07 21:26:03','rental'),(57,1,16,2,'2019-05-07 21:26:03','rental'),(58,1,17,2,'2019-05-07 21:26:03','rental'),(59,1,18,2,'2019-05-07 21:26:03','rental'),(60,1,19,2,'2019-05-07 21:26:03','rental'),(61,1,25,2,'2019-05-07 21:26:03','rental'),(62,1,27,2,'2019-05-07 21:26:03','rental'),(63,1,1,2,'2019-05-08 01:35:06','return'),(64,1,2,2,'2019-05-08 01:35:06','return'),(65,1,16,2,'2019-05-08 01:35:06','return'),(66,1,17,2,'2019-05-08 01:35:06','return'),(67,1,18,2,'2019-05-08 01:35:06','return'),(68,1,19,2,'2019-05-08 01:35:06','return'),(69,1,25,2,'2019-05-08 01:35:06','return'),(70,1,27,2,'2019-05-08 01:35:06','return');
/*!40000 ALTER TABLE `rental` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sim`
--

DROP TABLE IF EXISTS `sim`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `sim` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `test` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `label` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `imei` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sim`
--

LOCK TABLES `sim` WRITE;
/*!40000 ALTER TABLE `sim` DISABLE KEYS */;
/*!40000 ALTER TABLE `sim` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `type`
--

DROP TABLE IF EXISTS `type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  `kor` varchar(255) CHARACTER SET latin1 DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=3 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `type`
--

LOCK TABLES `type` WRITE;
/*!40000 ALTER TABLE `type` DISABLE KEYS */;
INSERT INTO `type` VALUES (1,'phone',NULL),(2,'sim',NULL);
/*!40000 ALTER TABLE `type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `face` varchar(255) DEFAULT NULL,
  `heart` int(11) DEFAULT NULL,
  `comment` varchar(255) DEFAULT NULL,
  `ipaddr` varchar(255) DEFAULT NULL,
  `isdel` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=8 DEFAULT CHARSET=utf8;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (1,'???','jh0511.lee@samsung.com','',0,'','',0),(2,'???','son0708@samsung.com','',0,'','',0);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2019-05-08  2:03:14
