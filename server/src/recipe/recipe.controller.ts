import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateRecipeDto } from './dto/CreateRecipeDto';
import { AuthGuard } from '../user/guards/auth.guard';
import { RecipeService } from './recipe.service';
import { RecipeEntity } from './recipe.entity';
import { User } from '../user/decorators/user.decorator';
import { UpdateRecipeDto } from './dto/UpdateRecipeDto';

@Controller('recipes')
export class RecipeController {
  constructor(private readonly recipeService: RecipeService) {}
  @Get()
  async getAllRecipes() {
    return this.recipeService.getAllRecipes();
  }

  @Post()
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async createRecipe(
    @User('id') currentUserId: number,
    @Body('recipe') createRecipeDto: CreateRecipeDto,
  ): Promise<RecipeEntity> {
    return await this.recipeService.createRecipe(currentUserId, createRecipeDto);
  }

  @Delete(':title')
  @UseGuards(AuthGuard)
  async deleteRecipe(@User('id') currentUserId: number, @Param('title') title: string) {
    return this.recipeService.deleteRecipe(currentUserId, title);
  }

  @Put(':title')
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  async updateRecipe(
    @User('id') currentUserId: number,
    @Body('recipe') updateRecipeDto: UpdateRecipeDto,
    @Param('title') title: string,
  ) {
    return await this.recipeService.updateRecipe(currentUserId, title, updateRecipeDto);
  }
}
