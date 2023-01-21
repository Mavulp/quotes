CREATE TABLE users (
    username TEXT PRIMARY KEY NOT NULL COLLATE NOCASE,
    display_name TEXT NULL,
    profile_picture TEXT NULL,
    bio TEXT NULL,
    highlighted_quote_id INTEGER NULL,
    created_at INTEGER NOT NULL, -- unix ts

    -- private
    color_theme TEXT NOT NULL DEFAULT 'dark-theme',

    CONSTRAINT fk_highlighted_quote_assoc
        FOREIGN KEY (highlighted_quote_id)
        REFERENCES quotes (id)
        ON DELETE SET NULL
) STRICT;

CREATE TABLE quotes (
    id INTEGER PRIMARY KEY NOT NULL,
    author TEXT NOT NULL,
    offensive INTEGER NOT NULL, -- bool
    created_at INTEGER NOT NULL, -- unix ts

    CONSTRAINT fk_author_assoc
        FOREIGN KEY (author)
        REFERENCES users (username)
        ON DELETE CASCADE -- Maybe?
) STRICT;

CREATE TABLE quote_fragment_types (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE
) STRICT;

INSERT INTO quote_fragment_types (id, name)
VALUES
(1, "text"),
(2, "image");

CREATE TABLE quote_fragments (
    quote_id INTEGER NOT NULL,
    idx INTEGER NOT NULL,
    "type" INTEGER NOT NULL,
    highlight INTEGER NOT NULL,
    content TEXT NOT NULL,
    quotee TEXT NOT NULL COLLATE NOCASE,

    PRIMARY KEY(quote_id, idx),

    CONSTRAINT fk_quote_id_assoc
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_type_assoc
        FOREIGN KEY ("type")
        REFERENCES quote_fragment_types (id)
) STRICT;

CREATE TABLE user_quote_index (
    idx INTEGER NOT NULL,
    quotee TEXT NOT NULL COLLATE NOCASE,
    quote_id TEXT NOT NULL,

    UNIQUE(quotee, quote_id),
    UNIQUE(quotee, idx),

    CONSTRAINT fk_quote_id_assoc
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON DELETE CASCADE
) STRICT;

CREATE TABLE tags (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL UNIQUE COLLATE NOCASE
) STRICT;

CREATE TABLE quote_tag_associations (
    quote_id INTEGER NOT NULL,
    tag_id TEXT NOT NULL,

    UNIQUE(quote_id, tag_id),

    CONSTRAINT fk_quote_id_assoc
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_tag_id_assoc
        FOREIGN KEY (tag_id)
        REFERENCES tags (id)
        ON DELETE CASCADE
) STRICT;

CREATE TABLE comments (
    id INTEGER PRIMARY KEY NOT NULL,
    author TEXT NOT NULL,
    quote_id INTEGER NOT NULL,
    created_at INTEGER NOT NULL, -- unix ts

    text TEXT NOT NULL,

    CONSTRAINT fk_quote_id_assoc
        FOREIGN KEY (quote_id)
        REFERENCES quotes (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_author_assoc
        FOREIGN KEY (author)
        REFERENCES users (username)
        ON DELETE CASCADE
) STRICT;
