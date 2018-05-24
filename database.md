# Mongodb
1. Install mongodb-org.
2. Create Database called "streamme".
3. Create Collections (UserAuthority, Content, Followers, Invoice).
4. Create unique index on UserAuthority `db.UserAuthority.createIndex({ "username": 1 }, { unique: true })`.
