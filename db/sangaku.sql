-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 01, 2020 at 11:12 PM
-- Server version: 5.7.32-0ubuntu0.18.04.1
-- PHP Version: 7.2.24-0ubuntu0.18.04.7

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
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
  `id` int(11) NOT NULL,
  `poll_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `poll_item_id` int(11) DEFAULT NULL,
  `response_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_modules`
--

CREATE TABLE `tbl_modules` (
  `id` int(11) NOT NULL,
  `somas_moid` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `blackboard_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_polls`
--

CREATE TABLE `tbl_polls` (
  `id` int(11) NOT NULL,
  `module_id` int(11) DEFAULT NULL,
  `problem_sheet_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `intro` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_poll_instances`
--

CREATE TABLE `tbl_poll_instances` (
  `id` int(11) NOT NULL,
  `poll_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `start_time` int(11) DEFAULT NULL,
  `end_time` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_poll_items`
--

CREATE TABLE `tbl_poll_items` (
  `id` int(11) NOT NULL,
  `poll_id` int(11) DEFAULT NULL,
  `sequence_number` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `text` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_problem_sheets`
--

CREATE TABLE `tbl_problem_sheets` (
  `id` int(11) NOT NULL,
  `module_id` int(11) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `week_number` int(11) DEFAULT NULL,
  `code` varchar(10) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `intro` text,
  `latex_source` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_question_items`
--

CREATE TABLE `tbl_question_items` (
  `id` int(11) NOT NULL,
  `problem_sheet_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `header` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `is_bottom` tinyint(1) DEFAULT NULL,
  `problem` text,
  `solution` text
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_registrations`
--

CREATE TABLE `tbl_registrations` (
  `id` int(11) NOT NULL,
  `student_id` int(11) DEFAULT NULL,
  `module_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sessions`
--

CREATE TABLE `tbl_sessions` (
  `id` int(11) NOT NULL,
  `problem_sheet_id` int(11) DEFAULT NULL,
  `tutorial_group_id` int(11) NOT NULL,
  `start_time` datetime DEFAULT NULL,
  `duration` int(11) DEFAULT '50',
  `is_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `solutions_shown` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_snapshots`
--

CREATE TABLE `tbl_snapshots` (
  `id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `file_extension` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_statuses`
--

CREATE TABLE `tbl_statuses` (
  `id` int(11) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `text` varchar(255) DEFAULT NULL,
  `tutor_text` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_status_reports`
--

CREATE TABLE `tbl_status_reports` (
  `id` int(11) NOT NULL,
  `session_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `status_id` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_groups`
--

CREATE TABLE `tbl_tutorial_groups` (
  `id` int(11) NOT NULL,
  `somas_id` int(11) NOT NULL,
  `module_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `day_number` int(11) DEFAULT NULL,
  `hour` int(11) DEFAULT NULL,
  `week_parity` varchar(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_group_students`
--

CREATE TABLE `tbl_tutorial_group_students` (
  `id` int(11) NOT NULL,
  `somas_membership_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `tutorial_group_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_group_teachers`
--

CREATE TABLE `tbl_tutorial_group_teachers` (
  `id` int(11) NOT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `tutorial_group_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_uploads`
--

CREATE TABLE `tbl_uploads` (
  `id` int(11) NOT NULL,
  `session_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `file_extension` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `is_response` tinyint(1) DEFAULT '0',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

CREATE TABLE `tbl_users` (
  `id` int(11) NOT NULL,
  `somas_student_id` int(11) DEFAULT NULL,
  `somas_person_id` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `gmail_name` varchar(255) DEFAULT NULL,
  `surname` varchar(255) NOT NULL,
  `forename` varchar(255) NOT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'student'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_modules`
--
ALTER TABLE `tbl_modules`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_polls`
--
ALTER TABLE `tbl_polls`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_poll_instances`
--
ALTER TABLE `tbl_poll_instances`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_poll_items`
--
ALTER TABLE `tbl_poll_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_problem_sheets`
--
ALTER TABLE `tbl_problem_sheets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_question_items`
--
ALTER TABLE `tbl_question_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_registrations`
--
ALTER TABLE `tbl_registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_sessions`
--
ALTER TABLE `tbl_sessions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_snapshots`
--
ALTER TABLE `tbl_snapshots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_status_reports`
--
ALTER TABLE `tbl_status_reports`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_tutorial_groups`
--
ALTER TABLE `tbl_tutorial_groups`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_tutorial_group_students`
--
ALTER TABLE `tbl_tutorial_group_students`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_tutorial_group_teachers`
--
ALTER TABLE `tbl_tutorial_group_teachers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_uploads`
--
ALTER TABLE `tbl_uploads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_users`
--
ALTER TABLE `tbl_users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
