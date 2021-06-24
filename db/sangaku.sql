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

DROP TABLE IF EXISTS `poll_responses`;
CREATE TABLE IF NOT EXISTS `poll_responses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `poll_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `poll_item_id` int(11) DEFAULT NULL,
  `response_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_modules`
--

DROP TABLE IF EXISTS `tbl_modules`;
CREATE TABLE IF NOT EXISTS `tbl_modules` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `somas_moid` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `is_regular` tinyint(1) NOT NULL DEFAULT '1',
  `semester` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  `video_url_description` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_polls`
--

DROP TABLE IF EXISTS `tbl_polls`;
CREATE TABLE IF NOT EXISTS `tbl_polls` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) DEFAULT NULL,
  `problem_sheet_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `intro` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_poll_instances`
--

DROP TABLE IF EXISTS `tbl_poll_instances`;
CREATE TABLE IF NOT EXISTS `tbl_poll_instances` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `poll_id` int(11) DEFAULT NULL,
  `session_id` int(11) DEFAULT NULL,
  `state` varchar(255) DEFAULT NULL,
  `start_time` int(11) DEFAULT NULL,
  `end_time` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_poll_items`
--

DROP TABLE IF EXISTS `tbl_poll_items`;
CREATE TABLE IF NOT EXISTS `tbl_poll_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `poll_id` int(11) DEFAULT NULL,
  `sequence_number` int(11) DEFAULT NULL,
  `code` varchar(255) DEFAULT NULL,
  `text` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_problem_sheets`
--

DROP TABLE IF EXISTS `tbl_problem_sheets`;
CREATE TABLE IF NOT EXISTS `tbl_problem_sheets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `module_id` int(11) DEFAULT NULL,
  `semester` int(11) DEFAULT NULL,
  `week_number` int(11) DEFAULT NULL,
  `code` varchar(10) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `intro` text,
  `latex_source` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_question_items`
--

DROP TABLE IF EXISTS `tbl_question_items`;
CREATE TABLE IF NOT EXISTS `tbl_question_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `problem_sheet_id` int(11) DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `position` int(11) DEFAULT NULL,
  `header` varchar(255) DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `level` int(11) DEFAULT NULL,
  `is_bottom` tinyint(1) DEFAULT NULL,
  `problem` text,
  `solution` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_registrations`
--

DROP TABLE IF EXISTS `tbl_registrations`;
CREATE TABLE IF NOT EXISTS `tbl_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `student_id` int(11) DEFAULT NULL,
  `module_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_sessions`
--

DROP TABLE IF EXISTS `tbl_sessions`;
CREATE TABLE IF NOT EXISTS `tbl_sessions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `problem_sheet_id` int(11) DEFAULT NULL,
  `tutorial_group_id` int(11) NOT NULL,
  `date` date DEFAULT NULL,
  `time` time DEFAULT NULL,
  `duration` int(11) DEFAULT '50',
  `is_confirmed` tinyint(1) NOT NULL DEFAULT '0',
  `solutions_shown` varchar(255) DEFAULT NULL,
  `video_url` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_snapshots`
--

DROP TABLE IF EXISTS `tbl_snapshots`;
CREATE TABLE IF NOT EXISTS `tbl_snapshots` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `file_extension` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_statuses`
--

DROP TABLE IF EXISTS `tbl_statuses`;
CREATE TABLE IF NOT EXISTS `tbl_statuses` (
  `id` int(11) NOT NULL,
  `code` varchar(255) DEFAULT NULL,
  `icon` varchar(255) CHARACTER SET utf8mb4 DEFAULT NULL,
  `text` varchar(255) DEFAULT NULL,
  `tutor_text` varchar(255) DEFAULT NULL,
  `message` varchar(255) DEFAULT NULL,
  `action` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_status_reports`
--

DROP TABLE IF EXISTS `tbl_status_reports`;
CREATE TABLE IF NOT EXISTS `tbl_status_reports` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) DEFAULT NULL,
  `item_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `status_id` int(11) DEFAULT NULL,
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_groups`
--

DROP TABLE IF EXISTS `tbl_tutorial_groups`;
CREATE TABLE IF NOT EXISTS `tbl_tutorial_groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `somas_id` int(11) DEFAULT NULL,
  `module_id` int(11) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `is_regular` tinyint(1) NOT NULL DEFAULT '1',
  `semester` varchar(255) DEFAULT NULL,
  `day_number` int(11) DEFAULT NULL,
  `hour` int(11) DEFAULT NULL,
  `week_parity` varchar(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_group_students`
--

DROP TABLE IF EXISTS `tbl_tutorial_group_students`;
CREATE TABLE IF NOT EXISTS `tbl_tutorial_group_students` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `somas_membership_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `tutorial_group_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_tutorial_group_teachers`
--

DROP TABLE IF EXISTS `tbl_tutorial_group_teachers`;
CREATE TABLE IF NOT EXISTS `tbl_tutorial_group_teachers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `teacher_id` int(11) DEFAULT NULL,
  `tutorial_group_id` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_uploads`
--

DROP TABLE IF EXISTS `tbl_uploads`;
CREATE TABLE IF NOT EXISTS `tbl_uploads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `session_id` int(11) NOT NULL,
  `item_id` int(11) DEFAULT NULL,
  `student_id` int(11) DEFAULT NULL,
  `teacher_id` int(11) DEFAULT NULL,
  `source` varchar(255) DEFAULT NULL,
  `file_extension` varchar(255) DEFAULT NULL,
  `mime_type` varchar(255) DEFAULT NULL,
  `is_response` tinyint(1) DEFAULT '0',
  `timestamp` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_users`
--

DROP TABLE IF EXISTS `tbl_users`;
CREATE TABLE IF NOT EXISTS `tbl_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `somas_student_id` int(11) DEFAULT NULL,
  `somas_person_id` int(11) DEFAULT NULL,
  `username` varchar(255) DEFAULT NULL,
  `gmail_name` varchar(255) DEFAULT NULL,
  `email_address` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `forename` varchar(255) DEFAULT NULL,
  `status` varchar(255) NOT NULL DEFAULT 'student',
  `is_admin` tinyint(1) NOT NULL DEFAULT '0',
  `password_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
