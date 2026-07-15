package application

import (
	"Alias_bdca/Back/internal/domain"
	"context"
)

// ResolveAliasInquiry resuelve un titular y sus alias según perfil natural o jurídico (J/G/C).
func (s *AppService) ResolveAliasInquiry(
	ctx context.Context,
	documentType, documentNumber string,
) (*domain.AliasInquiryResult, error) {
	customer, err := s.repo.GetCustomerByDocument(ctx, documentType, documentNumber)
	if err != nil {
		return nil, err
	}
	if customer == nil {
		return nil, nil
	}

	accounts, err := s.repo.GetAccountsByCustomerID(ctx, customer.ID)
	if err != nil {
		return nil, err
	}

	result := &domain.AliasInquiryResult{
		Customer:      customer,
		Accounts:      accounts,
		IsLegalEntity: domain.IsLegalEntityDocumentType(customer.DocumentType),
	}

	if result.IsLegalEntity {
		result.Aliases, err = s.repo.ListAliasesByCustomerID(ctx, customer.ID)
		if err != nil {
			return nil, err
		}
		return result, nil
	}

	alias, err := s.repo.GetAliasByCustomerID(ctx, customer.ID)
	if err != nil {
		return nil, err
	}
	if alias != nil {
		result.Aliases = []domain.Alias{*alias}
	}

	return result, nil
}
