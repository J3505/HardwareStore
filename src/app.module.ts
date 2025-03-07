import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { SaleModule } from './sale/sale.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    PrismaModule.forRoot({ isGlobal: true }),
    AuthModule,
    CategoryModule,
    ProductModule,
    SaleModule,
    UserModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
