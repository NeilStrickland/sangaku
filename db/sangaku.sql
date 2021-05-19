-- phpMyAdmin SQL Dump
-- version 4.9.5deb2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: May 19, 2021 at 06:36 PM
-- Server version: 8.0.25-0ubuntu0.20.04.1
-- PHP Version: 7.4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sangaku`
--

-- --------------------------------------------------------

--
-- Table structure for table `poll_responses`
--

CREATE TABLE `poll_responses` (
  `id` int NOT NULL,
  `poll_id` int DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `poll_item_id` int DEFAULT NULL,
  `response_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_modules`
--

CREATE TABLE `tbl_modules` (
  `id` int NOT NULL,
  `somas_moid` int DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `semester` varchar(255) DEFAULT NULL,
  `blackboard_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_polls`
--

CREATE TABLE `tbl_polls` (
  `id` int NOT NULL,
  `module_id` int DEFAULT NULL,
  `problem_sheet_id` int DEFAULT NULL,
  `session_id` int DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `intro` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_poll_instances`
--

CREATE TABLE `tbl_poll_instances` (
  `id` int NOT NULL,
  `poll_id` int DEFAULT NULL,
  `session_id` int DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `start_time` int DEFAULT NULL,
  `end_time` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_poll_items`
--

CREATE TABLE `tbl_poll_items` (
  `id` int NOT NULL,
  `poll_id` int DEFAULT NULL,
  `sequence_number` int DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `text` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_problem_sheets`
--

CREATE TABLE `tbl_problem_sheets` (
  `id` int NOT NULL,
  `module_id` int DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `week_number` int DEFAULT NULL,
  `code` varchar(10) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `intro` text,
  `latex_source` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_question_items`
--

CREATE TABLE `tbl_question_items` (
  `id` int NOT NULL,
  `problem_sheet_id` int DEFAULT NULL,
  `parent_id` int DEFAULT NULL,
  `position` int DEFAULT NULL,
  `header` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `level` int DEFAULT NULL,
  `is_bottom` tinyint(1) DEFAULT NULL,
  `problem` text,
  `solution` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_registrations`
--

CREATE TABLE `tbl_registrations` (
  `id` int NOT NULL,
  `student_id` int DEFAULT NULL,
  `module_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sessions`
--

CREATE TABLE `tbl_sessions` (
  `id` int NOT NULL,
  `problem_sheet_id` int DEFAULT NULL,
  `tutorial_group_id` int NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `duration` int DEFAULT '50',
  `is_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `solutions_shown` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_snapshots`
--

CREATE TABLE `tbl_snapshots` (
  `id` int NOT NULL,
  `session_id` int DEFAULT NULL,
  `file_extension` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_statuses`
--

CREATE TABLE `tbl_statuses` (
  `id` int NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci DEFAULT NULL,
  `text` varchar(255) DEFAULT NULL,
  `tutor_text` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_status_reports`
--

CREATE TABLE `tbl_status_reports` (
  `id` int NOT NULL,
  `session_id` int DEFAULT NULL,
  `item_id` int DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  `status_id` int DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_groups`
--

CREATE TABLE `tbl_tutorial_groups` (
  `id` int NOT NULL,
  `somas_id` int NOT NULL,
  `module_id` int DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `semester` int DEFAULT NULL,
  `day_number` int DEFAULT NULL,
  `hour` int DEFAULT NULL,
  `week_parity` varchar(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_group_students`
--

CREATE TABLE `tbl_tutorial_group_students` (
  `id` int NOT NULL,
  `somas_membership_id` int DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  `tutorial_group_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_group_teachers`
--

CREATE TABLE `tbl_tutorial_group_teachers` (
  `id` int NOT NULL,
  `teacher_id` int DEFAULT NULL,
  `tutorial_group_id` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_uploads`
--

CREATE TABLE `tbl_uploads` (
  `id` int NOT NULL,
  `session_id` int NOT NULL,
  `item_id` int DEFAULT NULL,
  `student_id` int DEFAULT NULL,
  `teacher_id` int DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `file_extension` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `is_response` tinyint(1) DEFAULT '0',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` int NOT NULL,
  `somas_student_id` int DEFAULT NULL,
  `somas_person_id` int DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `gmail_name` varchar(255) DEFAULT NULL,
  `surname` varchar(255) NOT NULL,
  `forename` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'student'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `poll_responses`
--
ALTER TABLE `poll_responses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_modules`
--
ALTER TABLE `tbl_modules`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_polls`
--
ALTER TABLE `tbl_polls`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_poll_instances`
--
ALTER TABLE `tbl_poll_instances`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_poll_items`
--
ALTER TABLE `tbl_poll_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_problem_sheets`
--
ALTER TABLE `tbl_problem_sheets`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_question_items`
--
ALTER TABLE `tbl_question_items`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_registrations`
--
ALTER TABLE `tbl_registrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_snapshots`
--
ALTER TABLE `tbl_snapshots`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_statuses`
--
ALTER TABLE `tbl_statuses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_status_reports`
--
ALTER TABLE `tbl_status_reports`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_tutorial_groups`
--
ALTER TABLE `tbl_tutorial_groups`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_tutorial_group_students`
--
ALTER TABLE `tbl_tutorial_group_students`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_tutorial_group_teachers`
--
ALTER TABLE `tbl_tutorial_group_teachers`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_uploads`
--
ALTER TABLE `tbl_uploads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `tbl_users`
--
ALTER TABLE `tbl_users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `poll_responses`
--
ALTER TABLE `poll_responses`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_modules`
--
ALTER TABLE `tbl_modules`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_polls`
--
ALTER TABLE `tbl_polls`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_poll_instances`
--
ALTER TABLE `tbl_poll_instances`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_poll_items`
--
ALTER TABLE `tbl_poll_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_problem_sheets`
--
ALTER TABLE `tbl_problem_sheets`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_question_items`
--
ALTER TABLE `tbl_question_items`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_registrations`
--
ALTER TABLE `tbl_registrations`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_snapshots`
--
ALTER TABLE `tbl_snapshots`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_status_reports`
--
ALTER TABLE `tbl_status_reports`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_tutorial_groups`
--
ALTER TABLE `tbl_tutorial_groups`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_tutorial_group_students`
--
ALTER TABLE `tbl_tutorial_group_students`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_tutorial_group_teachers`
--
ALTER TABLE `tbl_tutorial_group_teachers`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_uploads`
--
ALTER TABLE `tbl_uploads`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
