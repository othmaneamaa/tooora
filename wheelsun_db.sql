-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mer. 10 déc. 2025 à 09:17
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `wheelsun_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `bikes`
--

CREATE TABLE `bikes` (
  `id` int(11) NOT NULL,
  `station_id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `battery_level` int(11) DEFAULT 100,
  `price_per_hour` decimal(5,2) DEFAULT 6.00,
  `available` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `bikes`
--

INSERT INTO `bikes` (`id`, `station_id`, `name`, `battery_level`, `price_per_hour`, `available`, `created_at`) VALUES
(1, 1, 'V100-01', 100, 6.00, 1, '2025-12-10 07:35:21'),
(2, 1, 'V100-02', 85, 6.00, 1, '2025-12-10 07:35:21'),
(3, 1, 'V100-03', 90, 6.00, 1, '2025-12-10 07:35:21'),
(4, 1, 'V100-04', 75, 6.00, 1, '2025-12-10 07:35:21'),
(5, 2, 'V200-01', 100, 6.00, 1, '2025-12-10 07:35:21'),
(6, 2, 'V200-02', 60, 6.00, 1, '2025-12-10 07:35:21'),
(7, 2, 'V200-03', 45, 6.00, 0, '2025-12-10 07:35:21'),
(8, 3, 'V300-01', 100, 6.00, 1, '2025-12-10 07:35:21'),
(9, 3, 'V300-02', 95, 6.00, 1, '2025-12-10 07:35:21'),
(10, 3, 'V300-03', 80, 6.00, 1, '2025-12-10 07:35:21'),
(11, 3, 'V300-04', 70, 6.00, 1, '2025-12-10 07:35:21'),
(12, 3, 'V300-05', 50, 5.50, 1, '2025-12-10 07:35:21'),
(13, 4, 'V400-01', 100, 6.00, 1, '2025-12-10 07:35:21'),
(14, 4, 'V400-02', 90, 6.00, 1, '2025-12-10 07:35:21'),
(15, 4, 'V400-03', 30, 5.00, 1, '2025-12-10 07:35:21'),
(16, 5, 'V500-01', 100, 6.00, 1, '2025-12-10 07:35:21'),
(17, 5, 'V500-02', 65, 6.00, 0, '2025-12-10 07:35:21'),
(18, 6, 'V600-01', 100, 6.00, 1, '2025-12-10 07:35:21'),
(19, 6, 'V600-02', 85, 6.00, 1, '2025-12-10 07:35:21'),
(20, 6, 'V600-03', 95, 6.00, 1, '2025-12-10 07:35:21');

-- --------------------------------------------------------

--
-- Structure de la table `stations`
--

CREATE TABLE `stations` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `address` varchar(255) DEFAULT NULL,
  `capacity` int(11) DEFAULT 10,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `stations`
--

INSERT INTO `stations` (`id`, `name`, `latitude`, `longitude`, `address`, `capacity`, `created_at`) VALUES
(1, 'ST-WS100', 33.57310000, -7.58980000, 'Centre-ville Casablanca', 20, '2025-12-10 07:34:01'),
(2, 'ST-WS200', 33.57900000, -7.59900000, 'Quartier des affaires', 15, '2025-12-10 07:34:01'),
(3, 'ST-WS300', 33.56700000, -7.58000000, 'Port de Casablanca', 25, '2025-12-10 07:34:01'),
(4, 'ST-WS400', 33.58300000, -7.57500000, 'Nord Casablanca', 18, '2025-12-10 07:34:01'),
(5, 'ST-WS500', 33.58157100, -7.60231700, 'Nouvelle zone Casablanca', 12, '2025-12-10 07:34:01'),
(6, 'ST-WS600', 33.60179000, -7.58410100, 'Quartier résidentiel Nord', 10, '2025-12-10 07:34:01');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `phone`, `created_at`, `updated_at`) VALUES
(1, 'admin@wheelsun.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIUT1j7QJY9Z8J6A1JgZ/3JZ', 'Admin Wheelsun', '+212600000000', '2025-12-10 07:34:02', '2025-12-10 07:34:02'),
(2, 'test@gmail.com', '$2b$10$ctRkghghf9bdfBfikxhEweKqzAzJmQ0EPgoLoaWZTY56c1I7dXg72', 'Test', '06060606', '2025-12-10 08:02:32', '2025-12-10 08:02:32');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `bikes`
--
ALTER TABLE `bikes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `station_id` (`station_id`);

--
-- Index pour la table `stations`
--
ALTER TABLE `stations`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `bikes`
--
ALTER TABLE `bikes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT pour la table `stations`
--
ALTER TABLE `stations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `bikes`
--
ALTER TABLE `bikes`
  ADD CONSTRAINT `bikes_ibfk_1` FOREIGN KEY (`station_id`) REFERENCES `stations` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
