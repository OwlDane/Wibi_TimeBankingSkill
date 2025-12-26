package service

import (
  "errors"
  "strings"

  "github.com/timebankingskill/backend/internal/dto"
  "github.com/timebankingskill/backend/internal/models"
  "github.com/timebankingskill/backend/internal/repository"
  "github.com/timebankingskill/backend/internal/utils"
)

// AuthService handles authentication business logic
type AuthService struct {
  userRepo        *repository.UserRepository
  transactionRepo *repository.TransactionRepository
}

// NewAuthService creates a new auth service
func NewAuthService(userRepo *repository.UserRepository, transactionRepo *repository.TransactionRepository) *AuthService {
  return &AuthService{
    userRepo:        userRepo,
    transactionRepo: transactionRepo,
  }
}

// Register registers a new user account in the system
// Creates user profile, grants welcome bonus credits, and generates JWT token
//
// Registration Flow:
//   1. Validates registration input (email, password, username, etc)
//   2. Checks email and username uniqueness
//   3. Hashes password securely
//   4. Creates user record with default settings
//   5. Grants 3.0 welcome bonus credits (starting balance)
//   6. Creates initial transaction record for audit trail
//   7. Generates JWT authentication token
//
// Welcome Bonus:
//   - New users receive 3.0 time credits to get started
//   - This allows immediate booking of learning sessions
//   - Credits are tracked in transaction history
//
// Validation Rules:
//   - Password: Minimum 6 characters
//   - Username: Minimum 3 characters, unique
//   - Email: Must be valid format, unique
//   - Full Name, School, Grade: Required fields
//
// Parameters:
//   - req: Registration request with user details
//
// Returns:
//   - *AuthResponse: JWT token and user profile
//   - error: If validation fails, duplicate email/username, or database error
func (s *AuthService) Register(req *dto.RegisterRequest) (*dto.AuthResponse, error) {
  // Validate input
  if err := s.validateRegistration(req); err != nil {
    return nil, err
  }

  // Check if email already exists
  exists, err := s.userRepo.EmailExists(req.Email)
  if err != nil {
    return nil, err
  }
  if exists {
    return nil, errors.New("email already registered")
  }

  // Check if username already exists
  exists, err = s.userRepo.UsernameExists(req.Username)
  if err != nil {
    return nil, err
  }
  if exists {
    return nil, errors.New("username already taken")
  }

  // Hash password
  hashedPassword, err := utils.HashPassword(req.Password)
  if err != nil {
    return nil, errors.New("failed to hash password")
  }

  // Create user
  user := &models.User{
    Email:         strings.ToLower(req.Email),
    Password:      hashedPassword,
    FullName:      req.FullName,
    Username:      strings.ToLower(req.Username),
    School:        req.School,
    Grade:         req.Grade,
    Major:         req.Major,
    PhoneNumber:   req.PhoneNumber,
    CreditBalance: 3.0, // Starting bonus
    IsActive:      true,
    IsVerified:    false,
  }

  // Save user
  if err := s.userRepo.Create(user); err != nil {
    return nil, errors.New("failed to create user")
  }

  // Create initial transaction for welcome bonus
  transaction := &models.Transaction{
    UserID:        user.ID,
    Type:          models.TransactionInitial,
    Amount:        3.0,
    BalanceBefore: 0,
    BalanceAfter:  3.0,
    Description:   "Welcome bonus - Free credits to get started",
  }
  _ = s.transactionRepo.Create(transaction)

  // Generate JWT token
  token, err := utils.GenerateToken(user.ID, user.Email)
  if err != nil {
    return nil, errors.New("failed to generate token")
  }

  // Prepare response
  response := &dto.AuthResponse{
    Token: token,
    User:  s.mapUserToProfile(user),
  }

  return response, nil
}

// Login authenticates a user and generates JWT token
// Validates credentials and checks account status before allowing access
//
// Authentication Flow:
//   1. Finds user by email (case-insensitive)
//   2. Validates user account is active
//   3. Verifies password using secure hash comparison
//   4. Generates JWT token with user ID and email
//   5. Returns token and user profile
//
// Security:
//   - Passwords are never returned in response
//   - Uses bcrypt for secure password hashing
//   - JWT tokens expire after configured duration
//   - Inactive accounts cannot login
//
// Parameters:
//   - req: Login request with email and password
//
// Returns:
//   - *AuthResponse: JWT token and user profile
//   - error: If invalid credentials, inactive account, or database error
func (s *AuthService) Login(req *dto.LoginRequest) (*dto.AuthResponse, error) {
  // Find user by email
  user, err := s.userRepo.GetByEmail(strings.ToLower(req.Email))
  if err != nil {
    return nil, errors.New("invalid email or password")
  }

  // Check if user is active
  if !user.IsActive {
    return nil, errors.New("account is deactivated")
  }

  // Verify password
  if err := utils.CheckPassword(user.Password, req.Password); err != nil {
    return nil, errors.New("invalid email or password")
  }

  // Generate JWT token
  token, err := utils.GenerateToken(user.ID, user.Email)
  if err != nil {
    return nil, errors.New("failed to generate token")
  }

  // Prepare response
  response := &dto.AuthResponse{
    Token: token,
    User:  s.mapUserToProfile(user),
  }

  return response, nil
}

// GetProfile gets user profile by ID
func (s *AuthService) GetProfile(userID uint) (*dto.UserProfile, error) {
  user, err := s.userRepo.GetByID(userID)
  if err != nil {
    return nil, err
  }

  profile := s.mapUserToProfile(user)
  return &profile, nil
}

// validateRegistration validates registration request
func (s *AuthService) validateRegistration(req *dto.RegisterRequest) error {
  if len(req.Password) < 6 {
    return errors.New("password must be at least 6 characters")
  }
  if len(req.Username) < 3 {
    return errors.New("username must be at least 3 characters")
  }
  if req.FullName == "" {
    return errors.New("full name is required")
  }
  if req.School == "" {
    return errors.New("school is required")
  }
  if req.Grade == "" {
    return errors.New("grade is required")
  }
  return nil
}

// mapUserToProfile maps user model to profile DTO
func (s *AuthService) mapUserToProfile(user *models.User) dto.UserProfile {
  return dto.UserProfile{
    ID:            user.ID,
    Email:         user.Email,
    FullName:      user.FullName,
    Username:      user.Username,
    School:        user.School,
    Grade:         user.Grade,
    Major:         user.Major,
    Bio:           user.Bio,
    Avatar:        user.Avatar,
    Location:      user.Location,
    CreditBalance: user.CreditBalance,
    IsActive:      user.IsActive,
    IsVerified:    user.IsVerified,
  }
}
