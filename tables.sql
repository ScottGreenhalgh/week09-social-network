CREATE TABLE social_profiles (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    clerk_id TEXT UNIQUE NOT NULL,
    username TEXT,
    bio TEXT
);

CREATE TABLE social_posts (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    clerk_id TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_clerk
      FOREIGN KEY (clerk_id) 
      REFERENCES social_profiles (clerk_id)
      ON DELETE CASCADE
);

CREATE TABLE social_relationships (
    follower_id VARCHAR(255),
    followee_id VARCHAR(255),
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES social_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES social_profiles(id) ON DELETE CASCADE
);