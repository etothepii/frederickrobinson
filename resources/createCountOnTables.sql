USE frederickRobinson;
DROP TABLE IF EXISTS Agent;
CREATE TABLE Agent (
    ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
    EMAIL VARCHAR(255) NOT NULL,
    PASSWORD VARCHAR(255) NOT NULL
    INDEX `EMAIL` (`EMAIL`));
DROP TABLE IF EXISTS Overseeing;
CREATE TABLE Overseeing (
    ID INT (8) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    AGENT INT(8) NOT NULL,
    POLLING_AREA INT(8) NOT NULL,
    MAGIC_WORDS VARCHAR(32) NOT NULL,
    INDEX `AGENT` (`AGENT`),
    INDEX `POLLING_AREA` (`POLLING_AREA`));
DROP TABLE IF EXISTS Count;
CREATE TABLE Count (
    ID INT (8) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    PROVIDER INT (8) NOT NULL,
    POLLING_AREA INT(8) NOT NULL,
    VOTES_CAST INT(8) NOT NULL,
    BALLOT_BOX VARCHAR(64) NOT NULL,
    INDEX `PROVIDER` (`PROVIDER`),
    INDEX `POLLING_AREA` (`POLLING_AREA`));
DROP TABLE IF EXISTS PoliticalParty	;
CREATE TABLE PoliticalParty (
    ID INT (8) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR (255) NOT NULL,
    COLOUR CHAR(7) NOT NULL,
    LOGO_REF VARCHAR (255) NULL,
DROP TABLE IF EXISTS Tally;
CREATE TABLE Tally (
    ID INT (8) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    CANDIDATE INT (8) NOT NULL,
    COUNT INT(8) NOT NULL,
    INDEX `CANDIDATE` (`CANDIDATE`),
    INDEX `COUNT` (`COUNT`));
CREATE TABLE PollingArea (
    ID INT (8) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    NAME VARCHAR(64) NULL,
    TYPE VARCHAR(64) NULL,
    PARENT INT (8) NOT NULL,
    INDEX `PARENT` (`PARENT`));
DROP TABLE IF EXISTS Candidate;
CREATE TABLE Candidate (
    ID INT (8) NOT NULL AUTO_INCREMENT PRIMARY KEY,
    SURNAME VARCHAR(64) NULL,
    OTHER_NAMES VARCHAR(64) NULL,
    PARTY INT (8) NOT NULL,
    ELECTION_AREA INT (8) NOT NULL,
    DISPLAYABLE BOOL NOT NULL,
    ORDER INT (8) NOT NULL,
    INDEX `PARTY` (`PARTY`),
    INDEX `ELECTION_AREA` (`ELECTION_AREA`));
    INDEX `PHONE_IDENTIFIER` (`PHONE_IDENTIFIER`));
