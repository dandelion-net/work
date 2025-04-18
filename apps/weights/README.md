# Weighted Voting System

A flexible and secure voting system that implements weighted voting based on user vouching. This system allows for topic-specific vote weighting where users can vouch for other users' expertise in particular topics.

## Core Concepts

### Vouching System
- Users can vouch for other users' expertise in specific topics
- Vouches create a trust network that determines vote weights
- Both direct and indirect vouches contribute to a user's voting weight
- Users can vouch for users who have vouched for them
- Circular vouching is allowed but handled intelligently to prevent gaming the system

### Vote Weighting
- Base weight: 1.0 for all users
- Direct vouch bonus: Configurable via `DIRECT_VOUCH_WEIGHT` (default: 0.2)
- Indirect vouch bonus: Configurable via `INDIRECT_VOUCH_WEIGHT` (default: 0.1)
- Weights are topic-specific and calculated dynamically

#### Weight Calculation Example
Given this vouch chain:
```
user1 -> user2 (user2 weight = 1.2)
user2 -> user3 (user3 weight = 1.3)
user3 -> user4 (user4 weight = 1.4)
user4 -> user1 (user1 weight = 1.4)
```

- Each user starts with a base weight of 1.0
- Direct vouches add 0.2 to the weight
- Indirect vouches add 0.1 to the weight
- Indirect vouches "roll up" through the chain
- Circular vouches are allowed but don't create infinite weight accumulation
- The system tracks both direct and indirect vouchers for transparency

### Authentication
The system implements two levels of authentication:

1. **Admin Authentication**
   - Controls system-wide configuration
   - Manages users, topics, and vouches
   - Uses an environment-configured admin API key

2. **User Authentication**
   - Individual API keys for each user
   - Created during user registration
   - Allows users to manage their own vouches

## API Endpoints

### Model Management (`/api/models`)

#### Users
- `POST /api/models/users` (Admin) - Create new user
- `GET /api/models/users/me` (User) - Get own user details
- `GET /api/models/users` (Admin) - List all users
- `GET /api/models/users/:id` (Admin/Self) - Get user details
- `GET /api/models/users/:id/weights` (Public) - Get user's topic weights
- `PUT /api/models/users/:id` (Admin) - Update user
- `DELETE /api/models/users/:id` (Admin) - Delete user

#### Topics
- `POST /api/models/topics` (Admin) - Create new topic
- `GET /api/models/topics` (Public) - List all topics
- `GET /api/models/topics/:id` (Public) - Get topic details
- `PUT /api/models/topics/:id` (Admin) - Update topic
- `DELETE /api/models/topics/:id` (Admin) - Delete topic

#### Vouches
- `POST /api/models/vouches` (User) - Create vouch
- `GET /api/models/vouches` (Admin) - List all vouches
- `GET /api/models/vouches/:id` (Admin) - Get vouch details
- `DELETE /api/models/vouches/:id` (User) - Delete own vouch

### Vote Calculation
- `POST /calculate-votes` (Public) - Calculate weighted vote results

## Security Considerations

### API Key Management
- Admin key must be securely stored in environment variables
- User API keys are generated using cryptographic random values
- Keys should be transmitted securely and never logged

### Access Control
- Strict authentication for administrative operations
- Users can only manage their own vouches
- Public access limited to non-sensitive operations

### Data Protection
- No exposure of API keys through public endpoints
- Weights and voting calculations visible to all users
- Careful validation of all inputs to prevent gaming the system

## Configuration

### Environment Variables

#### Database Configuration
- `DATABASE_PROVIDER`: The database provider to use
  - Valid values: `sqlite`, `postgresql`, `postgres`
  - Default: `sqlite`

- `DATABASE_URL`: The database connection URL
  - For SQLite: `file:./dev.db`
  - For PostgreSQL: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`

#### Authentication
- `ADMIN_API_KEY`: The administrator API key for system management

#### Vote Weight Configuration
- `DIRECT_VOUCH_WEIGHT`: Weight bonus for direct vouches (default: 0.2)
- `INDIRECT_VOUCH_WEIGHT`: Weight bonus for indirect vouches (default: 0.1)

### Example Configuration

```env
# Database Configuration
DATABASE_PROVIDER="sqlite"
DATABASE_URL="file:./dev.db"

# API Keys
ADMIN_API_KEY=your-secure-admin-key-here

# Vote Weight Configuration
DIRECT_VOUCH_WEIGHT=0.2
INDIRECT_VOUCH_WEIGHT=0.1
```

## Best Practices

### System Setup
1. Configure environment variables before starting the system
2. Generate a strong admin API key
3. Plan your topic structure carefully
4. Consider database choice based on scale and deployment needs
5. Adjust vouch weights based on your community needs

### Vouching Guidelines
1. Only vouch for users whose expertise you can verify
2. Consider the topic specificity when vouching
3. Regularly review and update vouches
4. Be aware that vouches affect voting power
5. Understand that circular vouching is allowed but managed

### Vote Weight Management
1. Monitor weight distributions across topics
2. Watch for potential gaming of the system
3. Regular audits of vouch patterns
4. Consider implementing additional weight caps if needed

## Development

### Prerequisites
- Node.js 14+
- npm or yarn
- Database (SQLite or PostgreSQL)

### Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Configure environment variables
4. Run database migrations: `npm run prisma:migrate`
5. Start the server: `npm run dev`

### Testing
Run the test suite with:
```bash
npm run test
```