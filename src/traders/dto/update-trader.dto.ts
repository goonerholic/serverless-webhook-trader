import { PartialType } from '@nestjs/mapped-types';
import { CreateTraderDto } from './create-trader.dto';

export class UpdateTraderDto extends PartialType(CreateTraderDto) {}
