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
    CONSTRAINT fk_clerk
      FOREIGN KEY (clerk_id) 
      REFERENCES social_profiles (clerk_id)
      ON DELETE CASCADE
);

CREATE TABLE social_relationships (
    follower_id INT,
    followee_id INT,
    PRIMARY KEY (follower_id, followee_id),
    FOREIGN KEY (follower_id) REFERENCES social_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES social_profiles(id) ON DELETE CASCADE
);