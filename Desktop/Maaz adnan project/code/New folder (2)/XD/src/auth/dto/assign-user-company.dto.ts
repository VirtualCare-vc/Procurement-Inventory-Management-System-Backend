export class AssignUserToCompanyDto {
  userId: string;
  companyId: string;
  role: string;
}

export class RemoveUserFromCompanyDto {
  userId: string;
  companyId: string;
}

export class AssignUsersToCompanyDto {
  companyId: string;
  users: { userId: string; role: string }[];
}
