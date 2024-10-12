CREATE TABLE social_profiles (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    clerk_id TEXT UNIQUE NOT NULL,
    username VARCHAR(14), -- 14 character limit
    bio TEXT,
    img TEXT,
    nickname VARCHAR(14) -- 14 character limit
);

CREATE TABLE social_posts (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    clerk_id TEXT NOT NULL,
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    likes INT,
    dislikes INT,
    CONSTRAINT fk_clerk
      FOREIGN KEY (clerk_id) 
      REFERENCES social_profiles (clerk_id)
      ON DELETE CASCADE
);

CREATE TABLE social_relationships (
    id INT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    follower_id VARCHAR(255),
    followee_id VARCHAR(255),
    FOREIGN KEY (follower_id) REFERENCES social_profiles(id) ON DELETE CASCADE,
    FOREIGN KEY (followee_id) REFERENCES social_profiles(id) ON DELETE CASCADE
);

CREATE TABLE social_likes_dislikes (
    id SERIAL PRIMARY KEY,
    clerk_id TEXT NOT NULL, 
    post_id INT NOT NULL,
    is_like BOOLEAN, -- TRUE for like, FALSE for dislike
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (clerk_id) REFERENCES social_profiles(clerk_id) ON DELETE CASCADE,
    FOREIGN KEY (post_id) REFERENCES social_posts(id) ON DELETE CASCADE,
    CONSTRAINT unique_social_like_dislike UNIQUE (clerk_id, post_id)
);

