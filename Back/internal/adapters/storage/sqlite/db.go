package sqlite

import (
	"database/sql"
)

func InitDatabase(filepath string) (*sql.DB, error) {
	db, err := sql.Open("sqlite3", filepath)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)

}
