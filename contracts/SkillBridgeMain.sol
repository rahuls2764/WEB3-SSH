// contracts/SkillBridgeMain.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./SkillBridgeNFT.sol";

contract SkillBridgeMain is Ownable {
    IERC20 public sbtToken;
    SkillBridgeNFT public nftCertificate;

    uint256 public nextCourseId;
    uint256 public constant TOKEN_PRICE = 0.0001 ether; // 1 token = 0.0001 ETH

    struct User {
        address wallet;
        uint256 testScore;
        uint256 tokensEarned;
        uint256 coursesCompleted;
        bool hasCompletedTest;
    }

    struct Course {
        uint256 id;
        address instructor;
        string title;
        uint256 price;
        string metadataCID;
        address[] enrolledStudents;
        bool isActive;
        uint256 createdAt;
    }

    mapping(address => User) public users;
    mapping(uint256 => Course) public courses;
    mapping(address => uint256[]) public userCourses;
    mapping(address => uint256[]) public instructorCourses;
    mapping(address => string) public userProfileCid;
    mapping(address => mapping(uint256 => uint256)) public userCourseCertificates;

    event TestCompleted(address indexed user, uint256 score, uint256 tokensEarned);
    event CourseCreated(uint256 indexed courseId, address indexed instructor, string title, uint256 price);
    event CourseEnrolled(address indexed student, uint256 indexed courseId, uint256 price);
    event CourseCompleted(address indexed student, uint256 indexed courseId, uint256 nftTokenId);
    event TokensPurchased(address indexed buyer, uint256 amount, uint256 ethPaid);

    constructor(address _sbtToken, address _nftContract, address initialOwner) Ownable(initialOwner) {
        sbtToken = IERC20(_sbtToken);
        nftCertificate = SkillBridgeNFT(_nftContract);
        nextCourseId = 1;
    }

    function completeTest(uint256 _score) external {
        require(!users[msg.sender].hasCompletedTest, "Test already completed");
        uint256 reward = _score * 1e18;

        users[msg.sender] = User({
            wallet: msg.sender,
            testScore: _score,
            tokensEarned: reward,
            coursesCompleted: 0,
            hasCompletedTest: true
        });

        require(sbtToken.transfer(msg.sender, reward), "Token reward failed");
        emit TestCompleted(msg.sender, _score, reward);
    }

    function retakeTest(uint256 _score, uint256 _fee) external {
        require(users[msg.sender].hasCompletedTest, "Initial test required");
        require(sbtToken.transferFrom(msg.sender, address(this), _fee), "Retake fee failed");

        users[msg.sender].testScore = _score;
        users[msg.sender].tokensEarned += _score * 1e18;

        require(sbtToken.transfer(msg.sender, _score * 1e18), "Token reward failed");
        emit TestCompleted(msg.sender, _score, _score * 1e18);
    }

    function createCourse(string memory _metadataCID, string memory _title, uint256 _price) external {
        uint256 id = nextCourseId++;
        Course storage newCourse = courses[id];
        newCourse.id = id;
        newCourse.instructor = msg.sender;
        newCourse.title = _title;
        newCourse.price = _price;
        newCourse.metadataCID = _metadataCID;
        newCourse.isActive = true;
        newCourse.createdAt = block.timestamp;

        instructorCourses[msg.sender].push(id);
        emit CourseCreated(id, msg.sender, _title, _price);
    }

    function enrollInCourse(uint256 _courseId) external {
        Course storage course = courses[_courseId];
        require(course.isActive, "Inactive course");
        require(users[msg.sender].hasCompletedTest, "Test not completed");

        uint256 price = course.price;
        uint256 instructorShare = (price * 80) / 100;
        uint256 platformShare = price - instructorShare;

        require(sbtToken.transferFrom(msg.sender, course.instructor, instructorShare), "Instructor payment failed");
        require(sbtToken.transferFrom(msg.sender, owner(), platformShare), "Platform fee failed");

        course.enrolledStudents.push(msg.sender);
        userCourses[msg.sender].push(_courseId);

        emit CourseEnrolled(msg.sender, _courseId, price);
    }

    function completeCourse(uint256 _courseId, string memory _resultCID) external {
        require(hasAccessToCourse(msg.sender, _courseId), "Not enrolled");

        uint256 nftId = nftCertificate.mintCertificate(msg.sender, _resultCID);
        users[msg.sender].coursesCompleted++;

        userCourseCertificates[msg.sender][_courseId] = nftId;
        emit CourseCompleted(msg.sender, _courseId, nftId);
    }

    function hasAccessToCourse(address user, uint256 courseId) public view returns (bool) {
        Course storage course = courses[courseId];
        for (uint256 i = 0; i < course.enrolledStudents.length; i++) {
            if (course.enrolledStudents[i] == user) return true;
        }
        return false;
    }

    function buyTokens(uint256 amount) external payable {
        uint256 cost = TOKEN_PRICE * amount;
        require(msg.value == cost, "Incorrect ETH sent");

        require(sbtToken.transfer(msg.sender, amount * 1e18), "Token transfer failed");
        emit TokensPurchased(msg.sender, amount, msg.value);
    }

    function getUserEnrolledCourses(address user) external view returns (uint256[] memory) {
        return userCourses[user];
    }

    function getInstructorCourses(address instructor) external view returns (uint256[] memory) {
        return instructorCourses[instructor];
    }

    function setProfileMetadata(string memory cid) external {
        userProfileCid[msg.sender] = cid;
    }

    function getProfileMetadata(address user) external view returns (string memory) {
        return userProfileCid[user];
    }

    // ✅ Allow frontend to fetch enrolled students list for any course
    function getEnrolledStudents(uint256 courseId) external view returns (address[] memory) {
        return courses[courseId].enrolledStudents;
    }

    // ✅ Allow frontend to fetch NFT ID for user & course
    function getCertificateNftId(address user, uint256 courseId) external view returns (uint256) {
        return userCourseCertificates[user][courseId];
    }
}
