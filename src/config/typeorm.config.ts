import { TypeOrmModuleOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleOptions = {
    name: 'default',
    type: 'postgres',
    host: '188.68.231.163',
    port: 5432,
    username: 'licencjat',
    password: 'licencjat',
    database: 'licencjat-ug',
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: true,
}
