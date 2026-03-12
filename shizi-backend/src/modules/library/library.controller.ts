import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { LibraryService } from './library.service';

@Controller('libraries')
export class LibraryController {
  constructor(private readonly libraryService: LibraryService) {}

  /** GET /api/libraries — 字库列表 */
  @Get()
  async findAll() {
    return this.libraryService.findAll();
  }

  /** GET /api/libraries/:id — 字库详情 */
  @Get(':id')
  async findById(@Param('id') id: string) {
    const library = await this.libraryService.findById(id);
    if (!library) {
      throw new NotFoundException(`字库 ${id} 不存在`);
    }
    return library;
  }
}
