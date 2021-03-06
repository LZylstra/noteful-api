CREATE TABLE notes (
  id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
  note_name TEXT NOT NULL,
  date_modified TIMESTAMP NOT NULL DEFAULT now(),
  folderid INTEGER REFERENCES folders(id) ON DELETE CASCADE NOT NULL,
  content TEXT
);