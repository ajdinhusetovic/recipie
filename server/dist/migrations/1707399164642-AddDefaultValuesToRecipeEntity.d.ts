import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class AddDefaultValuesToRecipeEntity1707399164642 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
