package logging

const (
	FolderCreateAlias         = "CreateAlias"
	FolderUpdateAlias         = "UpdateAlias"
	FolderBlockAlias          = "BlockAlias"
	FolderResolveAlias        = "ResolveAlias"
	FolderResolveAntiphishing = "ResolveAntiphishing"
)

func AllOperationLogFolders() []string {
	return []string{
		FolderCreateAlias,
		FolderUpdateAlias,
		FolderBlockAlias,
		FolderResolveAlias,
		FolderResolveAntiphishing,
	}
}

func FolderForOperation(operation string) string {
	switch operation {
	case "CreateUser":
		return FolderCreateAlias
	case "UpdateAlias":
		return FolderUpdateAlias
	case "BlockAlias":
		return FolderBlockAlias
	case "ResolveAlias":
		return FolderResolveAlias
	case "ResolveAntiphishing":
		return FolderResolveAntiphishing
	default:
		if operation == "" {
			return "Unknown"
		}
		return operation
	}
}
