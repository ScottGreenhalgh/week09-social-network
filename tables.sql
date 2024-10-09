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


SELECT 
    social_posts.id,
    social_profiles.username,
    social_posts.content
FROM social_posts
INNER JOIN profiles ON social_posts.clerk_id = social_profiles.clerk_id;