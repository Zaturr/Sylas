package ports

import (
	"Alias_bdsa/Back/internal/domain"
	"context"
)

type RandomizerService interface {
	Run(ctx context.Context, config domain.RandomizerConfig) error
}

type BulkDataRepository interface {
	SeedBanks(ctx context.Context, banks []domain.BankSeed) error
	BeginBulkTransaction(ctx context.Context) (BulkTransaction, error)
}

type BulkTransaction interface {
	ResolveBatchCollisions(ctx context.Context, batch *[]domain.GeneratedCustomer) error
	InsertBatch(ctx context.Context, batch []domain.GeneratedCustomer) error
	Commit() error
	Rollback() error
}
