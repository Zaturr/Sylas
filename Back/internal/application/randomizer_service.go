package application

import (
	"Alias_bdsa/Back/internal/adapters/simulation"
	"Alias_bdsa/Back/internal/domain"
	"Alias_bdsa/Back/internal/ports"
	"context"
	"errors"
	"fmt"
	"math/rand"
	"time"
)

const randomizerBatchSize = 500

type RandomizerAppService struct {
	bulkRepo ports.BulkDataRepository
}

func NewRandomizerService(bulkRepo ports.BulkDataRepository) *RandomizerAppService {
	return &RandomizerAppService{bulkRepo: bulkRepo}
}

func (s *RandomizerAppService) Run(ctx context.Context, config domain.RandomizerConfig) error {
	if config.TotalCustomers <= 0 || config.MaxAccountsPerCustomer <= 0 || len(config.Banks) == 0 {
		return errors.New("parametros invalidos")
	}

	if err := s.bulkRepo.SeedBanks(ctx, config.Banks); err != nil {
		return err
	}

	tx, err := s.bulkRepo.BeginBulkTransaction(ctx)
	if err != nil {
		return err
	}

	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	rng := rand.New(rand.NewSource(time.Now().UnixNano()))
	batch := make([]domain.GeneratedCustomer, 0, randomizerBatchSize)

	for i := 1; i <= config.TotalCustomers; i++ {
		batch = append(batch, simulation.GenerateCustomer(config, rng))

		if len(batch) == randomizerBatchSize || i == config.TotalCustomers {
			if err := tx.ResolveBatchCollisions(ctx, &batch); err != nil {
				return fmt.Errorf("error resolviendo colisiones: %w", err)
			}
			if err := tx.InsertBatch(ctx, batch); err != nil {
				return err
			}
			batch = batch[:0]
		}
	}

	if err := tx.Commit(); err != nil {
		return err
	}
	committed = true

	return nil
}
