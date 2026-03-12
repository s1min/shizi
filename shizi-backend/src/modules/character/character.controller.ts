import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { CharacterService } from './character.service';

@Controller('characters')
export class CharacterController {
  constructor(private readonly characterService: CharacterService) {}

  /** GET /api/characters/batch?ids=火,水,山 */
  @Get('batch')
  async getBatch(@Query('ids') ids: string) {
    if (!ids || !ids.trim()) {
      throw new BadRequestException('ids 参数不能为空');
    }
    const idList = ids.split(',').map((s) => s.trim()).filter(Boolean);
    if (idList.length === 0) {
      throw new BadRequestException('ids 参数不能为空');
    }
    if (idList.length > 50) {
      throw new BadRequestException('单次最多查询 50 个汉字');
    }
    return this.characterService.findByIds(idList);
  }
}
