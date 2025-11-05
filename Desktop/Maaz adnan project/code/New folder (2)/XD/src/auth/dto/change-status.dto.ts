import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum POAction {
  SUBMIT = 'SUBMIT',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT',
  CANCEL = 'CANCEL',
  ISSUE  = 'ISSUE',
}

export class ChangePOStatusDto {
  @IsEnum(POAction) action: POAction;
  @IsOptional() @IsString() comment?: string;
}
